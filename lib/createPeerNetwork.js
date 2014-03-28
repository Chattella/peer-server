/*
 * peer-server
 * https://github.com/Chattella/peer-server
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

"use strict";

var crypto = require("crypto"),
    q = require("q"),
    qFs = require("q-io/fs"),
    bcrypt = require("bcrypt-nodejs"),
    pem = require("pem"),
    fs = require("fs"),
    keypair = require("keypair"),
    path = require("path"),
    PeerNetwork = require("./PeerNetwork");

function createPeerNetwork(name, password, options) {




    var networkPath = path.resolve(options.networkFolder, name),
        pemOptions = {
            days: 356 * 10,
            selfSigned: true
        },
        network = new PeerNetwork();

    network.name = name;

    return qFs.makeTree(networkPath)
        .then(hashPwd)
        .then(buildNetworkConfig)
        .then(createPEMKeys)
        .then(retrievePublicKey)
        .then(network.saveNetworkData.bind(network))
        .then(function() {
            return network;
        });


    function retrievePublicKey() {
        var deferred = q.defer();
        pem.getPublicKey(network.keys.certificate, function(err, key) {
            if (err) {
                return deferred.reject(err);
            }

            network.keys.publicKey = key.publicKey;
            deferred.resolve();

        });

        return deferred.promise;
    }

    function buildNetworkConfig(hash) {
        network.networksFolder = options.networkFolder;
        network.cfg = {
            name: name,
            port: options.port,
            address: options.address,

            peers: [{
                ip: options.address
            }],
            password: hash
        };

    }

    function hashPwd() {
        var deferred = q.defer();

        bcrypt.hash(password, null, null, function(err, hash) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(hash);
            }

        });

        return deferred.promise;
    }

    function createPEMKeys() {
        var deferred = q.defer();
        pem.createCertificate(pemOptions, function(err, keys) {
            if (err) {
                deferred.reject(err);
            } else {
                network.keys = keys;
                deferred.resolve(true);
            }
        });

        return deferred.promise;
    }



}


module.exports = createPeerNetwork;
