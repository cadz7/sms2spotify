const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');

/* -- Begin third party -- */
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId : '00464140d58c4c9b929d496cbc3a078c',
  clientSecret : '5cf500688e89410fb6adba5e1095fc76',
  redirectUri : 'http://localhost:8888'
});

const twilio = require('twilio');
const client = twilio('AC2206b84868fc34f9502977b54957db14', 'db2959bb2a20567ad88136b18af62fe5');

/* -- End third party -- */
const app = express();
app.set('port', process.env.PORT || 4567);
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.send('Hello! This is an sms to spotify app.');
})

app.post('/tracks/:track', function(req, res) {
  res.sendFile(__dirname + '/public/tracks/' + req.params.track + '.xml');
});

// post made by ever listening twilio to request the song and return twiml
app.post('/sms', function(req, res) {
  const from = "+16038194519";
  const to = req.body.From;
  const message = req.body.Body;
  const resp = new twilio.TwimlResponse();
  spotifyApi.searchTracks(message)
  .then(function(data) {
    if (data.body.tracks.items.length > 0) {
      const track = data.body.tracks.items[0];
      resp.play(track.preview_url);     
      fs.writeFile('public/tracks/' + track.id + '.xml', resp.toString(), function (err) {
        if (err) throw err;
        client.makeCall({
            to: to,
            from: '+16038194519', 
            url: 'http://564fed1a.ngrok.io/tracks/' + track.id
        }, function(err, responseData) { 
            if (!err) {
              const responseLog = {
                to: responseData.to_formatted,
                message: message,
                track: track.name,
                artist: track.artists.name,
                album: track.album.name,
                preview: track.preview_url,
                time: new Date()
              };
              fs.appendFile('response-log.txt', JSON.stringify(responseLog, undefined, 4) + '\n', function (err) {
                if (err) throw err;
              });
            } else {
              fs.appendFile('error-log.txt', new Date() + ' ' + JSON.stringify(err, undefined, 4) + '\n', function (err) {
                if (err) throw err;
              });
            }
        });
      });
    }
  }, function(err) {
    console.error(err);
  });
});
