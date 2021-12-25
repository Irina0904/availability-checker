var mqttClient = require("./mqttHandler");
const client = mqttClient.getMQTTClient();
var mongoUtil = require('./mongoUtil');
var PriorityQueue = require('js-priority-queue')

const topic = "dentistimo/booking-request";
client.on("connect", () => {
  console.log("Connected");
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
  });
});

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

  var bookingRequest = {};
  client.on("message", (topic, payload) => {
      console.log("Received Message:", topic, payload.toString());
      bookingRequest = payload.toString();
      processBookingRequest(bookingRequest);
  });

async function processBookingRequest(request) {
 if (isJson(request)) {
  mongoUtil.connectToServer(function (err) {
    if (err) console.log(err);
    const db = mongoUtil.getDb();
    const appointments = db.collection("appointments");

      let allBookings = [];
      appointments
        .find({})
        .toArray()
        .then((result) => {
            allBookings = result;
            console.log(allBookings);
            

           
                var bookingRequest = JSON.parse(request);
                var counter = 0;
            for (let i = 0; i < allBookings.length; i++) {
                    //First we check how many appointments booked for 
                    //the same clinic and date as the request
                    //exist in the database
                    if (allBookings[i].clinicId === bookingRequest.clinicId && allBookings[i].appointmentDate === bookingRequest.appointmentDate) {
                        counter++;
            }
                }
            console.log(counter);
            generateResponse(bookingRequest, counter);
        });
  });
} else {
                console.log('not a json');
          }
}

async function generateResponse(request, numOfAppointments) {
    var ObjectId = require('mongodb').ObjectId;
    mongoUtil.connectToServer(function (err) {
        if (err) console.log(err);
        const db = mongoUtil.getDb();
        const dentists = db.collection("dentists");
    
        return new Promise((resolve, reject) => {
            let allDentists = [];
          dentists
            .find({"_id": ObjectId(request.clinicId)})
            .toArray()
              .then((result) => {
                  allDentists = result;
                  console.log(allDentists);
                  //We reject the appointment if the number of available dentists
                  //is the same as the number of booked appointments 
                  //for the same date and time
                  if (numOfAppointments >= allDentists[0].dentists) {
                      console.log("Request not approved");
                      let rejectMessage = {
                        "response": "Rejected"
                      }
                      client.publish('dentistimo/booking-response', JSON.stringify(rejectMessage), { qos: 0, retain: false }, (error) => {
                        if (error) {
                          console.error(error)
                        }
                      })
                  } else {
                      console.log("Request approved");
                      let approveMessage = {
                          "response": "Approved",
                          "bookingRequest": request
                      }
                      console.log(approveMessage);
                      client.publish('dentistimo/booking-response', JSON.stringify(approveMessage), { qos: 0, retain: false }, (error) => {
                        if (error) {
                          console.error(error)
                        }
                      })
            }
              
                    resolve(console.log("resolved"));
            });
        });
      });
}
