const assert = require('assert');
const PostCrawler = require('../../postCrawler');
const scheduler = require('../../scheduler').scheduleCrawlersSingle;
const links = require('../data/links.json').slice(0, 10);
const db = require('../../db/database');

