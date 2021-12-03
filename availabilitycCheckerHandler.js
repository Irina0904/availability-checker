//Type 'node dentistHandler.js' in the console to run this file
//var mongoose = require('mongoose');
var fetch = require('node-fetch');
//const mqtt = require("mqtt");
//const dotenv = require("dotenv");
//const mongodb = require("mongodb");
//const mongoClient = mongodb.MongoClient;
var mqttClient = require('./mqttHandler');
//const CircuitBreaker = require("opossum");

mqttClient.mqttTest();


async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    //const db = client.db();
  
}
main()
.catch(console.error)
