module.exports = (grunt) => {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        src: ['test/unit/*.js'] } },
    karma: {
      unit: {
        configFile: 'karma.conf.js' } } });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('build', () => {

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
