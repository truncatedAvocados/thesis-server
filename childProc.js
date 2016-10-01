//childProc
const crawlUrl = require('./postCrawler').crawlUrl;
const cluster = require('cluster');

console.log('Firing up process ', process.pid);
var masterMessageHandler = (message) => {
  if (message.type === 'start') {
    crawlUrl(message.data, (links) => {
      process.send({
        type: 'finish',
        from: cluster.worker.id,
        data: links
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