/*
 * grunt-sails-mysql-transit
 * https://github.com/AGCPartners/grunt-sails-mysql-transit
 *
 * Copyright (c) 2015 AGC Partners Ltd
 * Licensed under the MIT license.
 */

'use strict';
var path = require('path');
var basePath = path.resolve('./');
var Sails = require('sails').Sails;
var mysql = require('mysql');
var util = require('util');
var connectionsConfig = require(basePath+'/config/connections');
var modelsConfig = require(basePath+'/config/models');
var async = require('async');
var prompt = require('prompt');
var colors = require('colors');
var MysqlTransit = require('mysql-transit');

var dropTempDbQueryTemplate = 'DROP DATABASE IF EXISTS `%s`;';
var createTempDbQueryTemplate = 'CREATE DATABASE IF NOT EXISTS `%s`;';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('smTransit', 'Grunt task for Sails Mysql migration tool', function() {
    //console.log(basePath);

    var done = this.async();
    // get the env from the params or use the NODE_ENV
    var env = grunt.option('env') || process.env.NODE_ENV;
    var envConfig = require(basePath+'/config/env/' + env);
    var envConnection =
      (envConfig.hasOwnProperty('models') && envConfig.models.hasOwnProperty('connection')) ?
        envConfig.models.connection : modelsConfig.models.connection;

    // read the Sails mysql config for the env 
    var mysqlParams = connectionsConfig.connections[envConnection];

    // convert sails mysql params to mysql params appropriate for node-myqsl
    var mysqlConfig = {
      port: mysqlParams.options.port,
      host: mysqlParams.options.host,
      user: mysqlParams.user,
      password: mysqlParams.password
    };
    var queryQueue = [];

    // origDB is the database to which you'd like to apply the changes
    var origDB = mysqlParams.database;

    // migrationDB is the temporary database that holds the desired structure
    var tm = new Date().getTime();
    var migrationDB = 'sailsMigration_' + tm;

    // alter the sails mysql params to use the temporary db
    mysqlParams.database = migrationDB;
    mysqlParams.module = 'sails-mysql';
    var sailsConfig = {
      port: -1,
      log: { level: 'silent' },
      hooks: { blueprints: false, orm: false, pubsub: false },
      models: { migrate: 'drop', connection: 'migration' },
      connections: {
        migration: mysqlParams
      }
    };
    // Some prompts and messages before it starts
    prompt.message = "SailsJS + Sequelize migration tool by AGC Partners Ltd. <developers@agcparners.co.uk>".cyan;
    prompt.delimiter = '\n';
    prompt.start();
    prompt.get({
      properties: {
        continue: {
          description: "You're about to alter your database. It is strongly advised to create a backup before you proceed. Ready to go? (yes/no)".red,
          default: 'yes',
          pattern: /^(yes|no)$/i,
          required: true
        }
      }
    }, function (err, result) {
      if(result.continue.toLowerCase() === 'no') done();

      var connection = mysql.createConnection(mysqlConfig);
      async.waterfall([
        function(callback) {
          connection.connect(callback);
        },
        function(callback) {
          var dropQuery = util.format(dropTempDbQueryTemplate, migrationDB);
          connection.query(dropQuery, callback); 
        },
        function(callback) {
          var dbQuery = util.format(createTempDbQueryTemplate, migrationDB);
          connection.query(dbQuery, callback);
        },
        function(callback) {
          var sails = new Sails();
          sails.lift(sailsConfig, callback);
        },
        function(callback) {
          var mysqlTransit = new MysqlTransit(origDB, migrationDB, mysqlConfig, callback);
          mysqlTransit.transit(opts);
        }
      ], done);
    });
  });
};