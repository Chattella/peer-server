"use strict";

var expect = require("expect.js"),
  bcrypt = require("bcrypt-nodejs"),
  request = require("request"),
  concat = require("concat-stream"),
  fs = require("fs"),
  rimraf = require("rimraf"),
  createPeerNetwork = require("../lib/createPeerNetwork"),
  openPeerNetwork = require("../lib/openPeerNetwork"),
  setupTestEnvironment = require("./setupTestEnvironment");


describe("openPeerNetwork", function() {

  var testNetworks = "test/networks",
    testConfig = setupTestEnvironment.testConfig,
    server;

  before(setupTestEnvironment);

  before(function(done) {
    setupTestEnvironment.server.stop();
    openPeerNetwork("test", "pwd", testConfig)
      .then(function(network) {
        server = network;
        network.start()
          .then(done)
          .
        catch (function(err) {
          console.log(err.stack)
        });


       
      })
      .
    catch (function(err) {
      console.log(err.stack)
    });

  });

  after(function() {
    server.stop();
  });

  it("create listening https server", function(done) {
    var reqOptions = {
      url: "https://localhost:34000/ping",
      strictSSL: false
    };


    request(reqOptions).pipe(concat(function(data) {
      var pong = JSON.parse(data);

      expect(pong.name).to.be.equal("test");
      expect(pong.protocolVersion).to.be.equal("0.1.0");
      done();
    }));

  });

  it("is defined", function() {
    expect(openPeerNetwork).to.be.an("function");
  });

  it("return express app", function() {
    expect(server.app).to.be.an("function");
    expect(server.app.get).to.be.an("function");
  });


});
