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

/* -- End third party -- */
const app = express();
app.set('port', process.env.PORT || 9001);
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

spotifyApi.searchTracks('queen - london thumakda')
.then(function(data) {
  console.log(data.body.tracks.items.length)
  fs.appendFile('test-bollywood-spotify.txt', JSON.stringify(data.body.tracks, undefined, 4) + '\n', function (err) {
    if (err) throw err;    
  });
});