var app = require('./server.js');
var port = process.env.RDS_PORT || 3000;

app.listen(port, function () {
  console.log('BlogRank RESTful API listening on port ' + port);
});