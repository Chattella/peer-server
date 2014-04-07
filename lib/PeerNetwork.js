/*
 * peer-server
 * https://github.com/Chattella/peer-server
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

"use strict";

var q = require("q"),
    qFs = require("q-io/fs"),
    path = require("path"),
    express = require("express"),
    https = require("https");


function PeerNetwork() {
    
}



PeerNetwork.prototype.stop = function stop() {
    this.httpServer.close();

};

PeerNetwork.prototype.saveNetworkData = function() {

    function mkPath(pathPart) {
        return path.resolve(network.networksFolder, pathPart);
    }

    var network = this,
        networkPath = mkPath(network.name),
        cfgPath = mkPath(network.name + "/cfg.json"),
        privateKeyPath = mkPath(network.name + "/server.key"),
        publicKeyPath = mkPath(network.name + "/server.pub"),
        certPath = mkPath(network.name + "/server.crt");

    var cfgContent = JSON.stringify(this.cfg, null, "\t"),
        filesWriteOps = [
            qFs.write(cfgPath, cfgContent),
            qFs.write(privateKeyPath, this.keys.serviceKey),
            qFs.write(publicKeyPath, this.keys.publicKey),
            qFs.write(certPath, this.keys.certificate)
        ];

    return q.all(filesWriteOps);


}


PeerNetwork.prototype.start = function() {

    var network = this,
        deferred = q.defer(),
        privateKey = this.keys.serviceKey,
        certificate = this.keys.certificate,
        credentials = {
            key: privateKey,
            cert: certificate
        };

    network.app = express();

    network.app.get("/ping", function(req, res) {
        
        res.json({
            name: network.cfg.name,
            protocolVersion: "0.1.0"
        });
        //console.log("ping")
    });
    //console.dir(credentials)
    network.httpServer = https.createServer(credentials, network.app)
        .listen(network.cfg.port, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve();
            }

        });

    return deferred.promise;
}

module.exports = PeerNetwork;
