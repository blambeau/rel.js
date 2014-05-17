"use strict";

module.exports = function(grunt) {
  
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    
    clean: ['dist'],
    
    jshint: {
      src: [
        'index.js',
        'lib/**/*.js'
      ],
      test: [
        'test/**/*.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    cucumberjs: {
      src: './features',
      options: {
        format: 'pretty',
        steps: 'features/step_definitions'
      }
    },

    mochaTest: {
      test: {
        src: ['test/**/*.js'],
        options: {
          reporter: 'spec',
        }
      }
    },

    watch: {
      jshint: {
        files: [
          'index.js',
          'lib/**/*.js',
          'test/**/*.js'
        ],
        tasks: [ 'jshint' ]
      },
      unitTesting: {
        files: ['lib/**/*.js', 'test/**/*.js'],
        tasks: ['test:unit']
      },
      // acceptanceTesting: {
      //   files: ['lib/**/*.js', 'features/**/*'],
      //   tasks: ['test:acceptance']
      // },
    },

    browserify: {
      main: {
        files: {
          'dist/rel.js': ['index.js']
        },
        options: {
          standalone: 'Rel',
          extensions: ['.js']
          //ignore:     ['./node_modules/**/*.*']
        }
      },
      tests: {
        files: {
          'dist/test_bundle.js': ['test/**/*.js']
        },
        options: {
        }
      }
    },

    uglify: {
      my_target: {
        files: {
          'dist/rel.min.js': ['dist/rel.js']
        }
      }
    }

  });

  grunt.registerTask('default',          ['test']);
  grunt.registerTask('compile',          ['browserify', 'uglify']);

  grunt.registerTask('test',             ['test:unit', 'test:acceptance']);
  grunt.registerTask('test:unit',        ['mochaTest']);
  grunt.registerTask('test:acceptance',  ['cucumberjs']);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-cucumber');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
