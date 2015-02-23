module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        MONGO_URI: 'mongodb://localhost/<%= pkg.name %>-test'
      },
      dev: {
        MONGO_URI: 'mongodb://localhost/<%= pkg.name %>-dev',
        PORT: 3000
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      test: {
        src: ['spec/**/*-spec.js']
      }
    },
    sass: {
      css: {
        options: {
          style: 'compressed',
          compass: true
        },
        files: [{
          expand: true,
          cwd: 'public/assets/sass',
          src: ['*.scss'],
          dest: 'public/assets/css',
          ext: '.min.css'
        }]
      }
    },
    exec: {
      server: {
        cmd: [
          'MONGO_URI=<%= env.dev.MONGO_URI %>',
          'PORT=<%= env.dev.PORT %>',
          'node index.js'
        ].join(' ')
      }
    }
  });

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('test', ['env:test', 'mochaTest:test']);
  grunt.registerTask('server', ['exec:server']);
  grunt.registerTask('s', 'server');
  grunt.registerTask('default', 'test');
}
