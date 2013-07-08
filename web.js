var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var index = 'index.html';
app.get('/', function(request, response) {
    fs.readFile(index, function(err, data) {
	response.send(data.toString());
    };
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
