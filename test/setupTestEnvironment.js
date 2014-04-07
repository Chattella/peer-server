"use strict";


var rimraf = require("rimraf"),
    createPeerNetwork = require("../lib/createPeerNetwork"),
    testNetworks = "test/networks";

setupTestEnvironment.testConfig = {
    networkFolder: testNetworks,
    address: "192.168.192.168", //http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
    port: 34000
};


function setupTestEnvironment(done) {
    rimraf.sync(testNetworks + "/test");

    createPeerNetwork("test", "pwd", setupTestEnvironment.testConfig)
        .then(function(network) {
            setupTestEnvironment.server = network;
            network.start()
                .then(done)
                .
            catch (done);



        })
        .
    catch (done);

}

module.exports = setupTestEnvironment;
