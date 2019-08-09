var mqtt = require('mqtt');
var hostname = "mqtt://raspberrypi.local";
var client  = mqtt.connect(hostname);
var express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs')
var say = require('say')
var LifxClient = require('node-lifx').Client;
var clientLight = new LifxClient();

let lightStrip 
clientLight.on('light-new', function(light){
  lightStrip = light
})

clientLight.init()

http.listen(3000, function(){
    console.log('listening on *:3000');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

app.use(express.static(__dirname + '/public'));


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

function onIntentDetected(intent) {
    // console.log("[Snips Log] Intent detected: " + JSON.stringify(intent));
    getAction(intent)
}

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

io.on('connection', function(socket) {
    console.log('A user connected');
    console.log(clientLight.lights())
});


const getAction = intent => {
  console.log(intent)
  let action = intent.slots[0].slotName
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










app.get('/tour', function(req, res) {
    const path = './videos/tour.mp4'
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

  app.get('/history', function(req, res) {
    const path = './videos/history.mp4'
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

  app.get('/portfolio', function(req, res) {
    const path = './videos/portfolio.mp4'
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