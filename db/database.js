var pg = require('pg');
var Sequelize = require('sequelize');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/testgraph';

var sequelize = new Sequelize(connectionString, {logging: false});


//Our primary table of interest. Importantly, inLinks are defined as the number of
//links pointing towards the entry that inLinks is contained in
//This is the reverse of the way you would normally think about a directed graph but
//gives us the advantage of having O(1) lookup time on the stat we care the most about
exports.Post = sequelize.define('post', {
  url: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true
    //Primary and unique key
  },
  postId: {
    type: Sequelize.INTEGER,
    unique: true,
    autoIncrement: true
  },
  inLinks: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    defaultValue: []
  },
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  keys: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    defaultValue: []
  },
  author: Sequelize.STRING,
  publishDate: Sequelize.DATE
});

//This table will be useful for traversing the graph bidirectionally (if it ends up being necessary)
exports.Edges = sequelize.define('edges', {

  from: {
    type: Sequelize.INTEGER
  },
  to: {
    type: Sequelize.INTEGER
  }

});

//This table will improve lookup time on tags, and also will be quite necessary when
//we want to start creating an indexing service. It will allow us to simply iterate through tags,
//instead of a complex logic when visiting each entry. Additionally it may be useful for data scrubbing purposes
exports.Tags = sequelize.define('tags', {
  tag: {
    type: Sequelize.STRING,
    unique: true,
  },
  blogId: {
    type: Sequelize.INTEGER,
    unique: true,
    primaryKey: true
  }

});

//Note: needs a many to many join table on post ID

//This table is simply for persisting whitelist data so we know it is stored and safe somewhere.
//When a web worker instance is started up it will read in this whole table
exports.WL = sequelize.define('whitelist', {
  url: {
    type: Sequelize.STRING,
    unique: true
  }
});


//Create the tables if necessary
//use {force: true} in sync() to drop tables first if neccessary 
//Ex: making a schema change by adding an author field
//Only run this file once (cmd-B in sublime w/ node build).
sequelize.sync();
