const mqtt = require('mqtt');
const hostname = "mqtt://raspberrypi.local";
const client  = mqtt.connect(hostname);
const express = require('express')
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs')
const say = require('say')
const LifxClient = require('node-lifx').Client;
const clientLight = new LifxClient();

// init new lightStrip to be used throughout script
let lightStrip 
clientLight.on('light-new', function(light){
  lightStrip = light
})
clientLight.init()

// listen to app on port 3000
http.listen(3000, function(){
    console.log('listening on *:3000');
});
//add HTML, public folder for stylesheets
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });
app.use(express.static(__dirname + '/public'));

// connect to snips
client.on('connect', function () {
    console.log("[Snips Log] Connected to MQTT broker " + hostname);
    client.subscribe('hermes/#');
});

client.on('message', function (topic, message) {
    if (topic === "hermes/asr/startListening") {
        onListeningStateChanged(true);
    } else if (topic === "hermes/asr/stopListening") {
        onListeningStateChanged(false);
    } else if (topic.match(/hermes\/hotword\/.+\/detected/g) !== null) {
        onHotwordDetected()
    } else if (topic.match(/hermes\/intent\/.+/g) !== null) {
        onIntentDetected(JSON.parse(message));
    }
});

// send intent through rest of script
function onIntentDetected(intent) {
    // console.log("[Snips Log] Intent detected: " + JSON.stringify(intent));
    getAction(intent)
}

// flash white lights when hotword is detected
function onHotwordDetected() {
    console.log("[Snips Log] Hotword detected");
    lightStrip.colorRgb(255, 255, 255, 100)
    lightStrip.on()
    const lightStripOff = () => lightStrip.off()
    setTimeout(lightStripOff, 1500)
}

function onListeningStateChanged(listening) {  
  console.log("[Snips Log] " + (listening ? "Start" : "Stop") + " listening");
}

// connect to websocket
io.on('connection', function(socket) {
    console.log('A user connected');
    console.log(clientLight.lights())
});

// take intent and send to frontend for media, process lights and audio feedback on server
const getAction = intent => {
  console.log(intent)
  // only take action if action of intent can be read to avoid shutting down script
  if(intent.slots[0].slotName != undefined){
    let action  
    io.emit('action', action)

      if(action == 'kim'){
        say.speak('Hi Kim')
        lightStrip.colorRgb(253, 131, 112, 100)
        lightStrip.on()
      }
      else if(action == 'al'){
        say.speak('Hi Al')
        lightStrip.colorRgb(255, 165, 0, 100)
        lightStrip.on()
      }
      else if(action == 'captain'){
        say.speak('Hi Captain')
        lightStrip.colorRgb(0, 100, 255, 100)
        lightStrip.on()
      }    
      else if(action == 'off'){
        say.speak('Goodbye')
        lightStrip.off()
      }     
  }
}

// add all mp4s an loop over them to create routes
const vidRoutes = ['tour', 'portfolio', 'history']

vidRoutes.forEach(el => {
  app.get(`/${el}`, function(req, res) {
    const path = `./videos/${el}.mp4`
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] 
        ? parseInt(parts[1], 10)
        : fileSize-1
      const chunksize = (end-start)+1
      const file = fs.createReadStream(path, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  });
})
