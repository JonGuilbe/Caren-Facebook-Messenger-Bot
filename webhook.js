//TODO Clean up this file so that it calls other files. This one is getting too big... Look up some style guides.
const express = require ('express'); //Import express
const bodyParser = require("body-parser");  //Import body parser
const app = express(); //Create the express object
app.use(bodyParser.json()); //Parse some jsons
app.use(bodyParser.urlencoded({extended: true}));

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
  console.log("TRIGGERED");
  if(req.body.result.action === 'weather'){
    let city = req.body.result.parameters['geo-city'];
    let restUrl = 'http://api.openweathermap.org/data/2.5/weather?units=imperial&APPID='+ process.env.open_weather_key +'&q='+city;

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
    let restUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=' + searchFor + '&type=video&key=' + process.env.youtube_key

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
    let subreddit = req.body.result.parameters['any'];
    subreddit = subreddit.replace(/ /g, "_");
    let restUrl = 'https://www.reddit.com/r/'+subreddit+'/top.json?limit=1';
    request.get(restUrl, (err, response, body) => {
      if(!err && response.statusCode == 200){
        let json = JSON.parse(body);
        let msg = json.data.children[0].data.url;
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
  else if(req.body.result.action === 'reddit-img'){
    let subreddit = req.body.result.parameters['any'];
    subreddit = subreddit.replace(/ /g, "_");
    let restUrl = 'https://www.reddit.com/r/'+subreddit+'/top.json?limit=1';
    request.get(restUrl, (err, response, body) => {
      if(!err && response.statusCode == 200){
        let json = JSON.parse(body);
        let msg = json.data.children[0].data.url;
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'reddit-img'});
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'The narwhal did not bacon at midnight...'}});
      }})
  }
  else if(req.body.result.action === 'begin-duel'){
    timeToDuel();
    msg = "IT'S TIME TO D-D-D-D-D-D-DUEL! Player 1 & 2 set to " + player1LP + "LP";
    return res.json({
      speech: msg,
      displayText: msg,
      source: 'begin-duel'});
  }
  else if(req.body.result.action === 'add-lp'){
    amount = req.body.result.parameters['number'];
    player = req.body.result.parameters['number1'];
    addLP(player, amount);
    msg = "Player 1: " + player1LP + "LP. Player 2: " + player2LP + "LP. " + checkForWin();
    return res.json({
      speech: msg,
      displayText: msg,
      source: 'add-lp'});
  }
  else if(req.body.result.action === 'subtract-lp'){
    amount = req.body.result.parameters['number'];
    player = req.body.result.parameters['number1'];
    subtractLP(player, amount);
    msg = "Player 1: " + player1LP + "LP. Player 2: " + player2LP + "LP. " + checkForWin();
    return res.json({
      speech: msg,
      displayText: msg,
      source: 'subtract-lp'});
  }
  else if(req.body.result.action === 'flip-coin'){
    result = Math.random();
    var message;
    console.log("Coin flip result: " + result);
    if(result > 0.5){
      message = "https://thumbs.dreamstime.com/b/closeup-united-states-quarter-coin-heads-12377413.jpg"
    }
    else{
      message = "https://images-na.ssl-images-amazon.com/images/I/51NyMaKLydL.jpg"
    }
    return res.json({
      speech: message,
      displayText: message,
      source: 'flip-coin'});
  }
  else if(req.body.result.action === 'anime-search'){
    let anime = req.body.result.parameters['any'];
    let restUrl = 'https://kitsu.io/api/edge/anime?page[limit]=1&filter[text]='+anime;
    request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        console.log(json.data[0].attributes.titles.en);
        console.log(json.data[0].attributes.titles.en_jp);
        let msg = json.data[0].attributes.titles.en + "^" + json.data[0].attributes.posterImage.small + "^" + json.data[0].attributes.titles.en_jp + "^" + json.data[0].attributes.slug + "^" + json.data[0].attributes.youtubeVideoId;
        return res.json({
          displayText: msg,
          speech: msg,
          source: 'anime-search'});
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'I failed to look up the anime.'}});
      }})
  }
  else if(req.body.result.action === 'hots-build'){
    let hero = req.body.result.parameters['any']; //Change to capitalize 1st letter, fix names with dots, spaces, and accents.
    let restUrl = 'http://jonguilbe.us/HOTS/herobuilds.json';
    request.get(restUrl, (err, response, body) => {
      if(!err && response.statusCode == 200){
        let json = JSON.parse(body);
        let msg = hero + "^" + json[hero] + "^https://hotslogs.com/Sitewide/HeroDetails?Hero=" + hero;
        return res.json({
          displayText: msg,
          speech: msg,
          source: 'hots-build'});
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'I failed to look up the hero.'}});
      }})
  }
  //This probably won't work
  else if(req.body.result.action === 'dice-roll'){
    var result = 0;
    if(typeof(req.body.result.parameters['number2']) == 'undefined' || req.body.result.parameters['number2'] === '1')
      result = Math.trunc((Math.random() * req.body.result.parameters['number']) + 1);
    else{
      for(i = 0; i < req.body.result.parameters['number2']; i++){
        result += Math.trunc((Math.random() * req.body.result.parameters['number']) + 1);
      }
      if(typeof(req.body.result.parameters['number1']) != 'undefined'){
        result += parseInt(req.body.result.parameters['number1']);
        console.log("Added " + req.body.result.parameters['number1'] + " to Result.");
      }
    }
    var message = result; // Why?
    console.log("Dice Roll result: " + result);
    
    return res.json({
      speech: message,
      displayText: message,
      source: 'dice-roll'});
  }  
})


const request = require('request');
var ai = require('apiai');
const apiaiApp = ai(process.env.apiaiKey);

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;
  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'el_psy_congree' // use any arbitrary id
  });
    apiai.on('response', (response) => {
  let aiText = response.result.fulfillment.speech;
  let source = response.result.fulfillment.source;
  console.log("Sauce is " + source);
  //Message json for images
  if(source === 'reddit-img' || source === 'flip-coin'){
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.fb_access_token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {"attachment":{
          "type": "image",
          "payload":{
            "url":aiText
          }
        }}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
  }
  else if(source === 'anime-search'){
    //This is really, really bad, probably.
    hackyArray = aiText.split('^');
    console.log("----- Anime Debugging!");
    console.log(response.result.fulfillment);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.fb_access_token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {"attachment":{
          "type": "template",
          "payload":{
            "template_type": "generic",
            "elements":[
              {
                "title": hackyArray[0],
                "image_url": hackyArray[1],
                "subtitle": "Japanese Title: " + hackyArray[2],
                "default_action": {
                  "type": "web_url",
                  "url": "https://kitsu.io/anime/" + hackyArray[3],
                  "messenger_extensions": true,
                  "webview_height_ratio": "tall",
                  "fallback_url":  "https://kitsu.io/anime/" + hackyArray[3]
                },
                "buttons":[
                  {
                    "type":"web_url",
                    "url": "https://youtube.com/watch?v=" +  hackyArray[4],
                    "title": "Watch Trailer"
                  }
                ]
              }
            ]
          }
        }}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
  }
  else if(source === 'hots-build'){
    //This is really, really bad, probably pt2
    hackyArray = aiText.split('^');
    console.log("----- Hero Debugging!");
    console.log(response.result.fulfillment);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.fb_access_token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {"attachment":{
          "type": "template",
          "payload":{
            "template_type": "button",
            "text":"Here's the top " + hackyArray[0] + " build: " + hackyArray[1],
            "buttons":[
              {
                "type":"web_url",
                "url":hackyArray[2],
                "title":"HOTSLog Build Page"
              }
            ]
          }
        }}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
  }
  else{
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.fb_access_token},
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
  }

 });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}

var player1LP = 8000;
var player2LP = 8000;

function timeToDuel(){
  console.log("It's time to duel!");
  player1LP = 8000;
  player2LP = 8000;
}

function subtractLP(playerNumber, subtractThis){
  if(playerNumber == 1){
    player1LP -= subtractThis;
  }
  else{
    player2LP -= subtractThis;
  }
  checkForWin();
}

function addLP(playerNumber, addThis){
  if(playerNumber == 1){
    player1LP += Number(addThis);
  }
  else{
    player2LP += Number(addThis);
  }
  checkForWin();
}

function checkForWin(){
    if(player1LP < 1)
        return("Player 2 wins!");
    else if(player2LP < 1)
       return("Player 1 wins!");
    else
      return "";
}

