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