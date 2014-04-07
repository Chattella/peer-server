"use strict";

var expect = require("expect.js"),
    bcrypt = require("bcrypt-nodejs"),
    request = require("request"),
    concat = require("concat-stream"),
    fs = require("fs"),
    testNetworks = "test/networks",
    createPeerNetwork = require("../lib/createPeerNetwork"),
    setupTestEnvironment = require("./setupTestEnvironment");



describe("createPeerNetwork", function() {

    var testConfig = setupTestEnvironment.testConfig,
        server;

    before(setupTestEnvironment);
    before(function(done){
        server = setupTestEnvironment.server;
        done();
    });
    
    after(function(){
        server.stop();
    });

    it("is defined", function() {
        expect(createPeerNetwork).to.be.an("function");
    });

    it("return express app", function() {
        expect(server.app).to.be.an("function");
        expect(server.app.get).to.be.an("function");
    });

    it("create public https key", function() {
        expect(fs.existsSync(testNetworks + "/test/server.pub")).to.be.equal(true);
    });

    it("create private https key", function() {
        expect(fs.existsSync(testNetworks + "/test/server.key")).to.be.equal(true);
    });

    it("create https certificate", function() {
        expect(fs.existsSync(testNetworks + "/test/server.crt")).to.be.equal(true);
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
    describe("network config file", function() {
        var cfg;

        before(function() {
            cfg = fs.readFileSync(testNetworks + "/test/cfg.json", "utf8");
            cfg = JSON.parse(cfg);

        });

        it("is saved", function() {
            expect(cfg).to.be.a("object");
        });

        it("contains peers", function() {
            expect(cfg.peers).to.be.an("array");
        });

        it("contain self as first peer", function() {
            expect(cfg.peers[0].ip).to.be.equal(testConfig.address);
        });

        it("contains name", function() {

            expect(cfg.name).to.be.equal("test");
        });

        it("contains password", function() {
            expect(bcrypt.compareSync("pwd", cfg.password)).to.be.equal(true);

        });

    });


});
