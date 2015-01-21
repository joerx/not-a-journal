module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        MONGO_URI: 'mongodb://localhost/<%= pkg.name %>-test'
      },
      dev: {
        MONGO_URI: 'mongodb://localhost/<%= pkg.name %>-dev'
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
    exec: {
      server: {
        cmd: 'MONGO_URI=<%= env.dev.MONGO_URI %> node index.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', ['env:test', 'mochaTest:test']);
  grunt.registerTask('default', 'test');
}
