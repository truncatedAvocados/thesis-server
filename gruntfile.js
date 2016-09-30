module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          timeout: 4000
        },
        src: ['test/unit/utilsTests.js',
              'test/unit/controllerTests.js',
              'test/unit/**/*.js'] } },
    karma: {
      unit: {
        configFile: 'karma.conf.js' } },
    exec: {
      deploy: {
        command: 'sudo -E npm start'
      }
    }
   });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('build', () => {
    grunt.task.run(['unit']);
  });

  //Todo: concat and minify client files here
  grunt.registerTask('deploy', () => {
    grunt.task.run(['exec:deploy']);
  });

  grunt.registerTask('unit', () => {
    grunt.task.run(['mochaTest']);
  });

  grunt.registerTask('integration', () => {
//  grunt.task.run(['karma']);
  });

  grunt.registerTask('converage', () => {

  });

  grunt.registerTask('end-to-end', () => {

  });
};
