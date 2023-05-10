FROM buildpack-deps:bullseye-curl as libPCKCertSelection

RUN apt-get update && apt-get install -y \
                gcc \
                g++ \
                libssl-dev \
                make \
                zip \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/dcap/QuoteGeneration/common/inc/internal
COPY QuoteGeneration/common/inc/internal/se_version.h .

WORKDIR /usr/src/dcap/QuoteVerification/QVL/Src
COPY QuoteVerification/QVL/Src .

WORKDIR /usr/src/dcap/tools/PCKCertSelection
COPY tools/PCKCertSelection .

RUN set -eux; \
    \
    make; \
    cp out/libPCKCertSelection.so /usr/src/dcap/;


FROM node:bullseye

RUN npm install -g npm@9.6.6

RUN apt-get update && apt-get install -y \
                python3 \
                python-is-python3 \
                # for dev purposes
                vim \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/pccs
COPY QuoteGeneration/pccs .
RUN mkdir -p lib
COPY --from=libPCKCertSelection /usr/src/dcap/libPCKCertSelection.so lib/

ARG http_proxy=""
ARG https_proxy=""
ARG https_port=8081
ARG hosts="127.0.0.1"
ARG caching_mode=LAZY
ARG pccs_api_key
ARG admin_token
ARG user_token

# update config/default.json
RUN set -eux; \
    \
    sed "/\"proxy\"*/c\ \ \ \ \"proxy\" \: \"${https_proxy}\"," -i config/default.json; \
    sed "/\"HTTPS_PORT\"*/c\ \ \ \ \"HTTPS_PORT\" \: ${https_port}," -i config/default.json; \
    sed "/\"hosts\"*/c\ \ \ \ \"hosts\" \: \"${hosts}\"," -i config/default.json; \
    sed "/\"CachingFillMode\"*/c\ \ \ \ \"CachingFillMode\" \: \"${caching_mode}\"," -i config/default.json; \
    sed "/\"ApiKey\"*/c\ \ \ \ \"ApiKey\" \: \"${pccs_api_key}\"," -i config/default.json; \
    sed "/\"AdminTokenHash\"*/c\ \ \ \ \"AdminTokenHash\" \: \"${admin_token}\"," -i config/default.json; \
    sed "/\"UserTokenHash\"*/c\ \ \ \ \"UserTokenHash\" \: \"${user_token}\"," -i config/default.json;

RUN set -eux; \
    \
    npm config set proxy ${http_proxy}; \
    npm config set https-proxy ${https_proxy}; \
    npm config set engine-strict true; \
    npm install;

# dummy cert
RUN set -eux; \
    \
    mkdir -p ssl_key; \
    openssl genrsa -out ssl_key/private.pem 2048; \
    openssl req \
        -new \
        -key ssl_key/private.pem \
        -out ssl_key/csr.pem \
        --subj /C=US/ST=Illinois/L="Urbana-Champaign"/O=IC3; \
    openssl x509 \
        -req \
        -days 365 \
        -in ssl_key/csr.pem \
        -signkey ssl_key/private.pem \
        -out ssl_key/file.crt;

CMD ["node", "pccs_server.js"]
