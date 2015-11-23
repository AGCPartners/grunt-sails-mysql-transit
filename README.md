# grunt-sails-mysql-transit
Grunt task for Sails MySQL migration tool

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
