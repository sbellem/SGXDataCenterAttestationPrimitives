/*
 * Copyright (C) 2011-2021 Intel Corporation. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *   * Neither the name of Intel Corporation nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

'use strict';

const config = require('./common/config');
const ConfigLoader = config.ConfigLoader;
const _ = require('lodash');

class QVSConfig extends config.BaseRestService {

    constructor(configJson) {

        super(configJson);
        this.validate(configJson, {
            required:   ['service', 'pcsClient', 'crlClient', 'healthCheck', 'logger', 'cache', 'target'],
            properties: {
                crlClient: {
                    required:   ['retries', 'initialInterval', 'factor'],
                    properties: {                                                
                        retries: {
                            type: 'number'
                        },
                        initialInterval: {
                            type: 'number'
                        },
                        factor: {
                            type: 'number'
                        }
                    }
                },
                target: {
                    required:                              ['attestationReportSigningCaCertificate', 'attestationReportSigningCertificate', 'trustedRootPublicKey'],
                    attestationReportSigningCaCertificate: {
                        type: 'string'
                    },
                    attestationReportSigningCertificate: {
                        type: 'string'
                    },
                    trustedRootPublicKey: {
                        type: 'string'
                    }
                }

            }
        });

        this.pcsClient = new config.RestClient(configJson.pcsClient);
        if (configJson.vcsClient) {
            this.vcsClient = new config.RestClient(configJson.vcsClient);
        }
        this.crlClient = configJson.crlClient;
        this.healthCheck = _.extend({}, configJson.healthCheck);
        this.logger = _.extend({}, configJson.logger);
        this.cache = new config.Cache(configJson.cache);
        this.target = configJson.target;
    }
}

const loader = new ConfigLoader(QVSConfig);

module.exports = loader;
