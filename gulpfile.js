var gulp = require('gulp');

var deploy = require('gulp-gh-pages');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');
var vinylPaths = require('vinyl-paths');

var runSequence = require('run-sequence');

gulp.task('build', function () {
  var result = browserify({
        entries:['./src/game.js']
      }).on('error', function () {
        console.log('There was an error');
        console.log(arguments);
        this.emit('end');
      })

  return result
    .bundle(function (err,buf){
      if (err){
        console.log('Bundle failure');
        console.log(err);
      }
    })
    .on('error', function () {
      console.log('There was an error');
      console.log(arguments);
      this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./'));
});
gulp.task('assets',  function () {
  return gulp.src(['assets/**/*'])
    .pipe(gulp.dest('dist/assets/'));
});
gulp.task('levels',  function () {
  return gulp.src('levels/*')
    .pipe(gulp.dest('dist/levels/'));
});
gulp.task('plugins',  function () {
  return gulp.src('plugins/*')
    .pipe(gulp.dest('dist/plugins/'));
});
///node_modules/depot/depot.js"
gulp.task('depot',  function () {
  return gulp.src('./node_modules/depot/depot.js')
    .pipe(gulp.dest('dist/node_modules/depot/'));
});
gulp.task('phaser',  function () {
  return gulp.src('./node_modules/phaser/build/phaser.js')
    .pipe(gulp.dest('dist/node_modules/phaser/build/'));
});
gulp.task('root', function () {
  return gulp.src(['./*.png', './bundle.js', './index.html', './gamecontroller.js', 'browserconfig.xml'])
    .pipe(gulp.dest('dist'));
})
gulp.task('dist', ['assets', 'build','levels', 'plugins', 'phaser', 'depot'], function () {
  return gulp.src(['./*.png', './bundle.js', './index.html', './gamecontroller.js', 'browserconfig.xml'])
    .pipe(gulp.dest('dist'));
});
gulp.task('publish', function () {
  return gulp.src('./dist/**/*')
        .pipe(deploy())
});
gulp.task('deploy', function(cb) {
  runSequence('build',
              ['assets', 'levels', 'plugins', 'phaser', 'depot', 'root'],
              'publish',
              'clean',
              cb);
});

gulp.task('clean', function (cb) {
  del(['dist'], cb);
});
