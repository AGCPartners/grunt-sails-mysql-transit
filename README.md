# grunt-sails-mysql-transit
Grunt task for Sails MySQL migration tool. With this task you'll be able to automigrate changes from your models to your existing mysql/mariadb database. It's developed and tested with sequelize ORM, but it should work with Waterline as well. For other frameworks/implementations please use the core package [mysql-transit](https://github.com/AGCPartners/mysql-transit).

### Known issues
For now if there is any constraint on a certain field you'll not be able to remove the field in question using this tool. You have to remove the constraint(primary key / foreign key) manually, and then you can run the tool again and remove the field. 
If there is any other issue please report it using the issues tab in this repository or by email to developers@agcpartners.co.uk and we'll do our best to publish a new version.

### Install
```
npm install grunt-sails-mysql-transit
```

### Config

Create migrate.js in tasks/config
```
module.exports = function(grunt) {

  grunt.config.set('smTransit', {
    mysql: true
  });
  grunt.loadNpmTasks('grunt-sails-mysql-transit');
};
```

and create migrate.js in tasks/register

```
module.exports = function (grunt) {
  grunt.registerTask('migrate', [
    'smTransit'
  ]);
};
```

### Usage

```
grunt migrate [--interactive=true --env=NODE_ENV]
```

### Optional params
There are 2 optional parameters - interactive (deafault is true) and env (default is the enviroment variable NODE_ENV). If you set the interactive param to false, it will perform all the operations except deleting tables and fields. This is useful if you want to include the task in a deployment script, but you'll have to take care about the garbage yourself. The other param is the env, if you want to specify the environment on which you want to apply the changes. This means that you have custom config file for e.g. config/env/production.js where the production mysql connection params are stored.
