'use strict';

module.exports = function (grunt) {
  var path = require('path'),
    pkg = grunt.file.readJSON('package.json'),
    dist = path.basename(pkg.main),
    noExt = path.basename(pkg.main, '.js'),
    min = noExt + '.min.js',
    umd = path.join('build', noExt + '.umd.js'),
    map = min + '.map',
    BANNER = '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> Decipher, Inc.;' +
        ' Licensed <%= pkg.license %>\n */\n';

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: pkg,

    jshint: {
      main: [
        'Gruntfile.js',
        '<%= pkg.main %>',
        '<%= mochacov.options.files %>'
      ],
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      }
    },

    // Unit tests.
    mochacov: {
      options: {
        files: 'test/*.spec.js'
      },
      main: {
        options: {
          reporter: 'spec'
        }
      },
      lcov: {
        options: {
          reporter: 'mocha-lcov-reporter',
          quiet: true,
          instrument: true,
          output: 'coverage/lcov.info'
        }
      },
      'html-cov': {
        options: {
          reporter: 'html-cov',
          output: 'coverage/index.html'
        }
      }
    },

    bump: {
      options: {
        files: [
          'package.json',
          'bower.json'
        ],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: [
          'package.json',
          'bower.json',
          dist,
          min,
          map
        ],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },

    umd: {
      main: {
        src: '<%= pkg.main %>',
        dest: umd,
        indent: '  ',
        deps: {
          amd: ['lodash'],
          cjs: ['lodash'],
          global: ['_']
        }
      }
    },

    concat: {
      main: {
        src: umd,
        dest: dist,
        options: {
          banner: BANNER
        }
      }
    },

    uglify: {
      options: {
        banner: BANNER,
        sourceMap: true
      },
      dist: {
        src: dist,
        dest: min
      }
    },

    devUpdate: {
      main: {
        options: {
          updateType: 'prompt',
          semver: false
        }
      }
    },

    jscs: {
      main: {
        src: 'lib/**/*.js'
      }
    },

    jsdox: {
      main: {
        src: 'lib/**',
        dest: __dirname
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('test', [
    'jshint',
    'jscs'
    //'mochacov:main',
    //'mochacov:lcov'
  ]);
  grunt.registerTask('html-cov', ['mochacov:html-cov']);

  grunt.registerTask('release', function (target) {
    grunt.task.run('bump-only:' + target);
    grunt.task.run('build');
    grunt.task.run('bump-commit');
  });

  grunt.registerTask('build', [
    'umd',
    'concat',
    'uglify'
  ]);
  grunt.registerTask('default', ['test']);

};
