// trampoline.js
// (C) 2018 Dave Cadwallader
// Released under the MIT license
//
// Derived from code from pigpio, also released under the MIT license
// See: https://github.com/fivdi/pigpio#measure-distance-with-a-hc-sr04-ultrasonic-sensor

const Gpio = require("pigpio").Gpio;
const prometheus = require("prom-client");
const express = require("express");

const metricsServer = express();
const gauge = new prometheus.Gauge({
  name: "distance_to_garage_door_cm",
  help: "How far away the garage door is in cm"
});
const up = new prometheus.Gauge({ name: "up", help: "UP Status" });

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECONDS_PER_CM = 1e6 / 34321;

const trigger = new Gpio(23, { mode: Gpio.OUTPUT });

trigger.digitalWrite(0); // Make sure trigger is low

function startServer() {
  console.log("Hello!  I just started my server.");

  metricsServer.get("/metrics", async (req, res) => {
    res.contentType(prometheus.register.contentType);

    try {
      var distanceCM = await getValue();
      console.log("Distance: " + distanceCM);
      gauge.set(distanceCM);
      up.set(1);
      res.send(prometheus.register.metrics());
    } catch (error) {
      // error connecting
      up.set(0);
      res.header("X-Error", error.message || error);
      res.send(prometheus.register.getSingleMetricAsString(up.name));
    }
  });

  console.log("Server listening to 9207, metrics exposed on /metrics endpoint");
  metricsServer.listen(9207);
}

const getValue = async () => {
  let startTick;

  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
  const echo = new Gpio(24, { mode: Gpio.INPUT, alert: true });

  var timeoutPromise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log("Timed out!");
      resolve(999);
    }, 50);
  });

  var sensorPromise = new Promise((resolve, reject) => {
    echo.on("alert", (level, tick) => {
      if (level == 1) {
        startTick = tick;
      } else {
        const endTick = tick;
        const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
        const distanceCM = diff / 2 / MICROSECONDS_PER_CM;
        resolve(distanceCM);
      }
    });
  });
  return Promise.race([timeoutPromise, sensorPromise]);
};

startServer();