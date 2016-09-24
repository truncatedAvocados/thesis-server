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

  grunt.registerTask('unit', () => {

  });

  grunt.registerTask('integration', () => {

  });

  grunt.registerTask('converage', () => {

  });


  grunt.registerTask('end-to-end', () => {

  });
};
