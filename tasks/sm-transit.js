/*
 * grunt-sails-mysql-transit
 * https://github.com/AGCPartners/grunt-sails-mysql-transit
 *
 * Copyright (c) 2015 AGC Partners Ltd
 * Licensed under the MIT license.
 */

'use strict';
var Sails = require('sails').Sails;
var connectionsConfig = require('../../config/connections');
var modelsConfig = require('../../config/models');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('sm-transit', 'Grunt task for Sails Mysql migration tool', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var done = this.async();
    var appPath = sails.config.appPath;
    // get the env from the params or use the NODE_ENV
    var env = grunt.option('env') || process.env.NODE_ENV;
    var envConfig = require(appPath+'/config/env/' + env + '.js');
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
    var migrationDB = 'sailsMigration' + Math.floor(Math.random() * 999999);

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
    
    var sails = new Sails();
    sails.lift(sailsConfig, function (err, server) {
      if (err) done(err);
    });
  });
};