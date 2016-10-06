const CronJob = require('cron').CronJob;
const startCrawlers = require('./startCrawlers').start;

const job = new CronJob({
  // Start the crawler everyday at 3:00:00 AM
  cronTime: '00 00 03 * * 0-6',
  onTick: () => { startCrawlers(); },
  start: false,
  timeZone: 'America/Los_Angeles' });

job.start();

