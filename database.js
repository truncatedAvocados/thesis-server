var pg = require('pg');
var Sequelize = require('sequelize');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/testgraph';

var sequelize = new Sequelize(connectionString);


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
  inLinks: Sequelize.ARRAY(Sequelize.INTEGER),
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  keys: Sequelize.ARRAY(Sequelize.TEXT),
  author: Sequelize.STRING
});

exports.Edges = sequelize.define('edges', {

  from: {
    type: Sequelize.INTEGER
  },
  to: {
    type: Sequelize.INTEGER
  }
});

//Create the tables if necessary
//use {force: true} in sync() to drop tables first if neccessary 
//Ex: making a schema change by adding an author field
//Only run this file once (cmd-B in sublime w/ node build).
sequelize.sync();
