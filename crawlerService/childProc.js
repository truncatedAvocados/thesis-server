//childProc
const crawlUrl = require('./postCrawler').crawlUrl;
const cluster = require('cluster');

console.log('Firing up process ', process.pid);
var masterMessageHandler = (message) => {
  if (message.type === 'start') {
    var count = message.count;
    crawlUrl(message.data, message.options, (links) => {
      process.send({
        type: 'finish',
        from: cluster.worker.id,
        data: links,
        count: count
      });
    });
  } else if (message.type === 'kill') {
    cluster.worker.kill();
  }
};
process.on('message', masterMessageHandler);
process.send({
  type: 'ready',
  from: cluster.worker.id,
  data: []
});