/*
 * peer-server
 * https://github.com/Chattella/peer-server
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

"use strict";

var crypto = require("crypto"),
    express = require("express"),
    fs = require("fs"),
    keypair = require("keypair"),
    path = require("path"),
    https = require("https");

function createNetwork(name, password, options, cb) {


    var prime_length = 60,
        networkPath = path.resolve(options.networkFolder, name),
        privateKeyPath = path.resolve(options.networkFolder, "test/server.key"),
        publicKeyPath = path.resolve(options.networkFolder, "test/server.crt");;

    createNetworkDirectory();

    function runServer(err) {
        if (err) {
            throw err;
        }
        var privateKey = fs.readFileSync(privateKeyPath, "utf8"),
            certificate = fs.readFileSync(publicKeyPath, "utf8"),
            credentials = {
                key: privateKey,
                cert: certificate
            },
            app = express(),
            httpsServer = https.createServer(credentials, app);


        httpsServer.listen(options.port, function(err) {
            cb(err, app);
        });
    }

    function writePublicKey(err, pair) {
        if (err) {
            throw err;
        }
        fs.writeFile(publicKeyPath, pair.public, runServer);
    }

    function writePrivateKey(err, pair) {
        if (err) {
            throw err;
        }

        fs.writeFile(privateKeyPath, pair.private, function(err) {
            writePublicKey(err, pair);
        });
    }

    function createNetworkDirectory() {
        fs.exists(networkPath, function(exists) {
            var pair = keypair();
            console.dir(pair );

            if (!exists) {
                return fs.mkdir(networkPath, function(err) {
                    writePrivateKey(err, pair);
                });

            }


            writePrivateKey(null, pair);
        });

    }




}


module.exports = {
    createNetwork: createNetwork
};
