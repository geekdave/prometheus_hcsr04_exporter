# prometheus_hcsr04_exporter
Monitor a Raspberry Pi / HC-SR04 Ultrasonic Rangefinder Distance with Prometheus

# Requirements

* A Raspberry Pi (this won't work on Mac/PC/etc)
* an HC-SR04 sensor.
* A breadboard
* [Follow this guide](https://www.modmypi.com/blog/hc-sr04-ultrasonic-range-sensor-on-the-raspberry-pi) to wire the Pi's GPIO pins to the sensor using the same pins they specify in the guide.

# Install

From the raspberry pi CLI:

```
git clone git@github.com:geekdave/prometheus_hcsr04_exporter.git
cd prometheus_hcsr04_exporter.git
npm install
```

# Running

```
sudo node exporter.js
```

Note: sudo is required to access the GPIO pins.

Test it using:

```
curl http://localhost:9207/metrics
```

# License

Apache 2.0

# Version history

* v0.0.1 (June 2, 2019) : Initial release