module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mocha: {
      test: {
        sre: ['test/unit/*.sj'] } },
    karma: {
      unit: {
        configFile: 'karma.conf.js' } } });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('test', () => {
//    grunt.task.run(['karma']);
    grunt.task.run(['mocha']);
  });
};
