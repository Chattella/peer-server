'use strict';

var expect = require("expect.js"),
    request = require('request'),
    concat = require('concat-stream'),
    fs = require("fs"),
    rimraf = require("rimraf"),
    peerServer = require("../lib/peer-server");


describe("peerServer", function() {
    var testNetworks = "test/networks";

    it("is defined", function() {
        expect(peerServer).to.be.an('object');
    });

    describe("createNetwork", function() {
        

        before(function(done) {
            rimraf.sync(testNetworks + "/test");

            this.timeout( 10000 );

            peerServer.createNetwork("test", "pwd", {
                networkFolder: testNetworks,
                port: 34000
            }, done);
        });

        it("is defined", function() {
            expect(peerServer.createNetwork).to.be.an('function');
        });

        it("create private key", function() {
            expect(fs.existsSync(testNetworks + "/test/server.key")).to.be.equal(true);
        });

        it("create certificate", function() {
            expect(fs.existsSync(testNetworks + "/test/server.crt")).to.be.equal(true);
        });

        it("create listening https server", function(done) {

            request('https://localhost:34000/ping', function(error, response, body) {
                if (error) {
                    throw error;
                }



                response.pipe(concat(function(data) {
                    var pong = JSON.parse(data);

                    expect(pong.name).to.be.equal("test");
                    expect(pong.protocolVersion).to.be.equal("0.1.0");
                    done();
                }));





            })

        });

    });

});
