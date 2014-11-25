'use strict';

module.exports = function (grunt) {
  var path = require('path'),
    _ = require('lodash'),
    pkg = grunt.file.readJSON('package.json'),
    bower = grunt.file.readJSON('bower.json'),

    banner = _.template('/*! <%= name %> - v<%= pkg.version %> - ' +
    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
    ' * Copyright (c) <%= today %> Decipher, Inc.;' +
    ' Licensed <%= pkg.license %>\n */\n'),

    modifyJsExt = function modifyJsExt(filepath, ext) {
      return path.basename(filepath, '.js') + ext;
    };

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: pkg,

    bower: bower,

    dist: {
      main: bower.main,
      min: modifyJsExt(bower.main, '.min.js'),
      map: modifyJsExt(bower.main, '.min.js.map'),
      ngMain: 'ng-' + bower.main,
      ngMin: modifyJsExt('ng-' + bower.main, '.min.js'),
      ngMap: modifyJsExt('ng-' + bower.main, '.min.js.map')
    },

    build: {
      main: pkg.main,
      ng: path.join('build', 'ng-' + bower.main),
      ngSrc: path.join('lib', 'ng-' + bower.main)
    },

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
          '<%= dist.main %>',
          '<%= dist.min %>',
          '<%= dist.map %>',
          '<%= dist.ngMain %>',
          '<%= dist.ngMin %>',
          '<%= dist.ngMap %>'
        ],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },

    clean: ['build/**'],

    umd: {
      options: {
        indent: '  '
      },
      main: {
        src: '<%= pkg.main %>',
        dest: '<%= dist.main %>',
        deps: {
          amd: ['../lib/lodash'],
          cjs: ['lodash'],
          global: ['_'],
          'default': ['_']
        }
      },
      angular: {
        src: '<%= build.ng %>',
        dest: '<%= dist.ngMain %>',
        deps: {
          amd: [
            '../lib/lodash',
            'angular'
          ],
          cjs: [
            'lodash',
            'angular-node'
          ],
          global: [
            '_',
            'angular'
          ],
          'default': [
            '_',
            'angular'
          ]
        }
      }
    },

    concat: {
      angular: {
        src: [
          '<%= build.main %>',
          '<%= build.ngSrc %>'
        ],
        dest: '<%= build.ng %>'
      }
    },

    usebanner: {
      options: {},
      main: {
        files: {
          src: [
            '<%= dist.main %>',
            '<%= dist.min %>'
          ]
        },
        options: {
          banner: banner({
            today: grunt.template.today("yyyy"),
            name: pkg.name,
            pkg: pkg
          })
        }
      },
      ng: {
        files: {
          src: [
            '<%= dist.ngMain %>',
            '<%= dist.ngMin %>'
          ]
        },
        options: {
          banner: banner({
            today: grunt.template.today("yyyy"),
            name: 'ng-lodash-decipher',
            pkg: pkg
          })
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= usebanner.options.banner %>',
        sourceMap: true
      },
      main: {
        src: '<%= dist.main %>',
        dest: '<%= dist.min %>'
      },
      ng: {
        src: '<%= dist.ngMain %>',
        dest: '<%= dist.ngMin %>'
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
        src: ['lib/**/*.js', 'Gruntfile.js']
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
    'clean',
    'concat',
    'umd',
    'usebanner',
    'uglify'
  ]);
  grunt.registerTask('default', ['test']);

};
