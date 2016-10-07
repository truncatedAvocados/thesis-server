const CronJob = require('cron').CronJob;
const startCrawlers = require('./crawlerService/startCrawlers').start;
const startIndex = require('./indexService/main').initRebalance;

//Potential to give these guys callbacks that write some process information here and write it to a log file
if (process.argv.indexOf('--crawl') > -1) {
  // const job = new CronJob({
  //   // Start the crawler everyday at 3:00:00 AM
  //   cronTime: '00 00 03 * * 0-6',
  //   onTick: () => { startCrawlers(); },
  //   start: false,
  //   timeZone: 'America/Los_Angeles' });
  job = startCrawlers;
} else if (process.argv.indexOf('--index') > -1) {

  const job = new CronJob({
    // Start the crawler everyday at 10:00:00 PM
    cronTime: '00 00 22 * * 0-6',
    onTick: () => { startIndex(); },
    start: false,
    timeZone: 'America/Los_Angeles' });  

}


// job.start();

job();
