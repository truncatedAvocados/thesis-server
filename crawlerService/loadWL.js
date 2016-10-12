//File to load in the base urls and whitelist urls

var whitelist = require('./whitelist.json');
var baseUrls = require('./baseUrls.json');
var db = require('./workerUtils/wlUtils.js');


for (var url in whitelist) {
  console.log(url, whitelist[url]);
  var obj = {
    url: url
  };

  if (whitelist[url].siteMap) {
    obj.siteMap = whitelist[url].siteMap;
  }

  db.addOne(obj, (err, created) => console.log(err, created.dataValues));
  
}


for (var url in baseUrls) {
  // console.log(url, baseUrls[url]);

  obj = {
    url: url,
    base: true
  };

  db.addOne(obj, (err, created) => console.log(err, created.dataValues));
}