/*
 * peer-server
 * https://github.com/Chattella/peer-server
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

//"use strict";

var crypto = require("crypto"),
  q = require("q"),
  qFs = require("q-io/fs"),
  bcrypt = require("bcrypt-nodejs"),
  express = require("express"),
  pem = require("pem"),
  fs = require("fs"),
  keypair = require("keypair"),
  path = require("path"),
  https = require("https");

function createNetwork(name, password, options, cb) {
  
  var networkPath = mkPath(name),
    cfgPath = mkPath(name + "/cfg.json"),
    privateKeyPath = mkPath(name + "/server.key"),
    publicKeyPath = mkPath(name + "/server.pub"),
    certPath = mkPath(name + "/server.crt"),
    pemOptions = {
      days: 356 * 10,
      selfSigned: true
    };


  return qFs.makeTree(networkPath)
    .then(function() {
      return createPEMKeys()
        .then(saveNetworkData);
    })
    .then(function() {
      return runServer();
    })
    .then(function(app) {
      cb && cb(null, app);
      return app;
    })
    .catch (function(err) {
      cb(err);
    });

  function mkPath(pathPart) {
    return path.resolve(options.networkFolder, pathPart);
  }

  function runServer() {

    var deferred = q.defer(),
      privateKey = fs.readFileSync(privateKeyPath, "utf8"),
      certificate = fs.readFileSync(certPath, "utf8"),
      credentials = {
        key: privateKey,
        cert: certificate
      },
      app = express(),
      httpsServer = https.createServer(credentials, app);

    app.get("/ping", function(req, res) {
      res.json({
        name: name,
        protocolVersion: "0.1.0"
      });
    });

    httpsServer.listen(options.port, function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(app);
      }

    });

    return deferred.promise;
  }


  function hashPwd(pwd) {
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


  function writeConfig(keys) {

    return hashPwd(password)
      .then(function(hash) {

        var cfg = {
          name: name,
          peers: [{
            ip: options.address
          }],
          password: hash
        },
          cfgContent = JSON.stringify(cfg, null, "\t");

        return qFs.write(cfgPath, cfgContent);
      });



  }

  function createPEMKeys() {
    var deferred = q.defer();
    pem.createCertificate(pemOptions, function(err, keys) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(keys);
      }
    });

    return deferred.promise;
  }


  function saveNetworkData(keys) {


    var filesWriteOps = [
      writeConfig(keys),
      qFs.write(privateKeyPath, keys.serviceKey),
      writePublicKey(keys),
      qFs.write(certPath, keys.certificate)
    ];

    return q.all(filesWriteOps);


  }

  function writePublicKey(keys) {
    var deferred = q.defer();
    pem.getPublicKey(keys.certificate, function(err, key) {
      deferred.resolve(
        qFs.write(publicKeyPath, key.publicKey)
      );
    });

    return deferred.promise;
  }

}


module.exports = {
  createNetwork: createNetwork
};
