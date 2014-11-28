'use strict';

module.exports = {
  main: [
    'Gruntfile.js',
    'lib/**/*.js',
    'test/**/*.js',
    'tasks/**/*.js'
  ],
  options: {
    jshintrc: true,
    reporter: require('jshint-stylish')
  }
};
