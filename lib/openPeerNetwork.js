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

function openPeerNetwork(name, password, options) {
    console.dir(options)
  function mkPath(pathPart) {
    return path.resolve(options.networkFolder, pathPart);
  }

  var network = new PeerNetwork(),
    deferred = q.defer(),
    networkPath = mkPath(name),
    cfgPath = mkPath(name + "/cfg.json"),
    privateKeyPath = mkPath(name + "/server.key"),
    publicKeyPath = mkPath(name + "/server.pub"),
    certPath = mkPath(name + "/server.crt"),

    publicKey, privateKey, cfg, certificate;

  network.keys = {};
  network.networksFolder = options.networkFolder;

  publicKey = qFs.read(publicKeyPath).then(function(key) {
    network.keys.publicKey = key;
  });

  privateKey = qFs.read(privateKeyPath).then(function(key) {
    network.keys.serviceKey = key;
  }),

  cfg = qFs.read(cfgPath).then(function(cfgText) {
    network.cfg = JSON.parse(cfgText);
  }),

  certificate = qFs.read(certPath).then(function(key) {
    network.keys.certificate = key;
  });

  q.all([publicKey, privateKey, cfg, certificate]).then(function() {
    deferred.resolve(network);
  }).catch(function(err){
    deferred.reject(err);
  });


  return deferred.promise;
}

module.exports = openPeerNetwork;
