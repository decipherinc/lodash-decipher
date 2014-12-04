'use strict';

var path = require('path'),
  basename = path.basename,
  format = require('util').format,
  _ = require('lodash'),
  pkg = require('./package.json'),
  bower = require('./bower.json'),
  time = require('time-grunt'),
  load = require('load-grunt-config'),
  resolve = require.resolve;

module.exports = function (grunt) {
  var ngName, ngRegExp, isAngular, mainFilepath, release, setPreExt, name, data,
    dist;

  time(grunt);

  /**
   * Path to `dist/` directory.
   * @type {string}
   */
  dist = 'dist';

  /**
   * Name of this package (for dist file banner)
   * @type {string}
   */
  name = pkg.name;

  /**
   * Name of AngularJS extension (for dist file banner)
   * @type {string}
   */
  ngName = format('%s %s', name, '(AngularJS extension)');

  /**
   * Targets that begin with `ng` will use `ngName`.
   * @type {RegExp}
   */
  ngRegExp = /^ng/;

  /**
   * Returns `true` if parameter begins with `ng`.
   * @param {string} target Grunt task target
   * @returns {boolean}
   */
  isAngular = function (target) {
    return ngRegExp.test(target);
  };

  /**
   * Path to main file (for browser usage)
   * @type {string}
   */
  mainFilepath = bower.main;

  /**
   * Grunt task to bump, build, then commit.
   * @param {string} target Bump target.  One of `major`, `minor`, or `patch`
   */
  release = function release(target) {
    var run = grunt.task.run.bind(grunt.task);
    run('bump-only:' + target) && run('build') && run('bump-commit');
  };

  /**
   * Given `foo.js` and "pre-extension" `bar`, return `foo.bar.js`.
   * @param {string} [ext=''] Extension
   * @param {string} [filepath] Filepath.  Defaults to `main` in `bower.json`
   * @returns {string}
   */
  setPreExt = function setPreExt(ext, filepath) {
    ext = ext ? '.' + ext : '';
    filepath = filepath || mainFilepath;
    return path.join('dist', basename(filepath, '.js') + ext + '.js');
  };

  /**
   * Custom data to make available to the task template engine.
   */
  data = {
    /**
     * Contents of package.json
     * @type {Object}
     */
    pkg: pkg,

    /**
     * Browserify alias for LoDash build to use during custom build.
     * @type {string}
     */
    customAlias: format('%s:%s', _.isString(grunt.option('lodash')) ?
      path.resolve(__dirname, lodashOption) : resolve('lodash'), 'lodash'),

    /**
     * Gets the name of the current dist file being created.  Used in banner.
     * @returns {string}
     */
    getName: function getName() {
      return isAngular(this.target) ? ngName : name;
    },

    /**
     * Stuff related to filepaths for builds
     */
    files: {
      /**
       * Gets the filepath to the appropriate lib/ file for the task target.
       * @returns {string}
       */
      lib: function lib() {
        return isAngular(grunt.task.current.target) ?
          resolve('./lib/lodash-decipher.ng') :
          resolve('./lib/lodash-decipher');
      }
    }
  };

  // create accessor functions to get at filenames
  _.each(['', 'min', 'custom', 'ng'], function (ext) {
    data.files[ext || 'main'] = _.partial(setPreExt, ext);
  })

  grunt.task.registerTask('release', 'Bump, build, then commit', release);

  load(grunt, {
    configPath: path.join(__dirname, 'tasks'),
    jitGrunt: {
      staticMappings: {
        'mochacov': 'grunt-mocha-cov',
        'bump-only': 'grunt-bump',
        'bump-commit': 'grunt-bump'
      }
    },
    data: data
  });


};
