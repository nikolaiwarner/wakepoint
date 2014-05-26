var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var haml = require('gulp-haml');
var less = require('gulp-less');

var coffee_path = './src/coffee';
var less_path = './src/less';
var haml_path = './src/haml';
var on_error = function (err) { console.error(err.message); };

gulp.task('coffee', function() {
  gulp.src(coffee_path + '/**/*.coffee')
    .pipe(coffee({bare: true})).on('error', on_error)
    .pipe(gulp.dest('./'))
});

gulp.task('haml', function () {
  gulp.src(haml_path + '/**/*.haml')
    .pipe(haml())
    .pipe(gulp.dest('./'));
});

gulp.task('less', function () {
  gulp.src(less_path + '/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch([coffee_path + '/**/*.coffee'], ['coffee']);
  gulp.watch([haml_path + '/**/*.haml'], ['haml']);
  gulp.watch([less_path + '/**/*.less'], ['less']);
});

gulp.task('default', ['watch']);
