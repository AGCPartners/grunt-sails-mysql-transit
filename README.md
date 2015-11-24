# grunt-sails-mysql-transit
Grunt task for Sails MySQL migration tool. With this task you'll be able to automigrate changes from your models to your existing mysql/mariadb database. It's developed and tested with sequelize ORM, but it should work with Waterline as well. For other frameworks/implementations please use the core package [mysql-transit](https://github.com/AGCPartners/mysql-transit).

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
grunt migrate
```
