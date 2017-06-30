const express = require ('express'); //Import express
const bodyParser = require("body-parser");  //Import body parser
const app = express(); //Create the express object
app.use(bodyParser.json()); //Parse some jsons!
app.use(bodyParser.urlencoded({extended: true}));   //No idea actually

const server = app.listen(process.env.PORT || 5000, () => { //Start the server at a given port
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env); //Confirm this worked
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'el_psy_congroo') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

app.post('/ai', (req, res) => { 
  console.log("TRIGGERED REEEEE");
  if(req.body.result.action === 'weather'){
    let city = req.body.result.parameters['geo-city'];
    let restUrl = 'http://api.openweathermap.org/data/2.5/weather?units=imperial&APPID='+"***REMOVED***"+'&q='+city;

    request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        let msg = json.weather[0].description + ' and the temperature is ' + json.main.temp + ' ℉';
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'weather'});
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'I failed to look up the city name.'}});
      }})
  }
  else if(req.body.result.action === 'youtube'){
    let searchFor = req.body.result.parameters['any'];
    let restUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=' + searchFor + '&type=video&key=***REMOVED***'

    request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        console.log(json.items[0].id);
        let msg = "https://www.youtube.com/watch?v=" + json.items[0].id.videoId;
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'youtube'});
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'I failed to look up the video.'}});
      }})
  }
  else if(req.body.result.action === 'reddit'){
    console.log("We've entered the Reddit Zone...");
    let subreddit = req.body.result.parameters['any']; //Need to convert spaces to underscores apparently >:(
    let restUrl = 'https://www.reddit.com/r/'+subreddit+'/top.json?limit=1';
    request.get(restUrl, (err, response, body) => {
      if(!err && response.statusCode == 200){
        let json = JSON.parse(body);
        console.log(json);
        console.log(json.data);
        console.log(json.data.children);
        let msg = "Testing..."
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'reddit'});
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'The narwhal did not bacon at midnight...'}});
      }})
  }
})


const request = require('request');
var ai = require('apiai');
const apiaiApp = ai("***REMOVED***");

function sendMessage(event) {
  //console.log("Funct start");
  let sender = event.sender.id;
  let text = event.message.text;
  //console.log(text);
  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'el_psy_congree' // use any arbitrary id
  });
  //console.log(text);
    apiai.on('response', (response) => {
  let aiText = response.result.fulfillment.speech;
  //console.log(aiText);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: "***REMOVED***"},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
 });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}