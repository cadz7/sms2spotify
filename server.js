const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');

/* -- Begin third party -- */
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENT,
  clientSecret : process.env.SPOTIFY_SECRET,
  redirectUri : 'http://localhost:8888'
});

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ID, process.env.TWILIO_SECRET);
var twiml = new twilio.TwimlResponse();

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
            url: 'https://sms2music.herokuapp.com/tracks/' + track.id
        }, function(err, responseData) { 
            if (!err) {
              twiml.message('Successfully sent the song!');
              res.send(twiml);
            } else {
              twiml.message('Error in sending the song: ' + message);
              res.send(twiml);
            }
        });
      });
    }
  }, function(err) {
    console.error(err);
  });
});
