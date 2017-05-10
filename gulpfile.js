'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');
var webserver = require('gulp-server-livereload');
var stylus = require('gulp-stylus');
var pug = require('gulp-pug');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var typograf = require('gulp-typograf');

var ts = Math.floor(Date.now()/1000);

//Build markup
gulp.task('html', function() {
  gulp.src(['src/pug/**/*.pug', '!src/pug/partials/**/*.pug', '!src/pug/404/404.pug'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
      locals: {timestamp: ts}
    }))
    .pipe(typograf({
      lang: 'ru',
      disable: ['ru/other/phone-number']
    }))
    .pipe(rename({
      basename: "index"
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build/'));
});

//Build 404 page
gulp.task('notfound', function() {
  gulp.src('src/pug/404/404.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build/'));
});

//Build styles
gulp.task('css', function() {
  gulp.src('src/stylus/style.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin())
    .pipe(gulp.dest('build/css/'));
});

//Build scripts
gulp.task('js', ['js.menu', 'js.home', 'js.configurator']);

//Build menu scripts
gulp.task('js.menu', function() {
  gulp.src('src/js/menu.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('build/js/'));
});

//Build home page scripts
gulp.task('js.home', function() {
  gulp.src('src/js/home/*.js')
    .pipe(plumber())
    .pipe(concat(
      'home.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js/'));
});

//Build configurator page scripts
gulp.task('js.configurator', function() {
  gulp.src('src/js/configurator/*.js')
    .pipe(plumber())
    .pipe(concat(
      'configurator.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('build/js/'));
});

//Run webserver with livereload
gulp.task('webserver', function() {
  gulp.src('build')
    .pipe(webserver({
      livereload: true,
      fallback: "index.html",
      port: 8080,
      open: true
    }));
});

//Clean build directory
gulp.task('clean', function() {
  return gulp.src('build', {
    read: false
  }).pipe(clean());
});

//Minify inline images
gulp.task('min-inline', function() {
  return gulp.src(['src/img/inline/**/*'])
    .pipe(imagemin())
    .pipe(gulp.dest('src/img/inline/'));
});

//Build & copy assets
gulp.task('assets', function() {
  //gulp.src('src/assets/fonts/*').pipe(gulp.dest('build/assets/fonts'));
  gulp.src(['src/img/**/*', '!src/img/inline/**/*', '!src/img/inline'])
    .pipe(imagemin())
    .pipe(gulp.dest('build/img/'));
});

//Copy reg documents
gulp.task('reg', function() {
  gulp.src(['src/reg/**/*'])
    .pipe(gulp.dest('build/reg/'));
});

//Copy instructions
gulp.task('instr', function() {
  gulp.src(['src/instr/**/*'])
    .pipe(gulp.dest('build/instr/'));
});

//Watch task
gulp.task('watch', function() {
  gulp.watch('src/stylus/**/*.styl', ['css']);
  gulp.watch('src/pug/**/*.pug', ['html']);
  gulp.watch('src/reg/**/*', ['reg']);
  //gulp.watch('src/pug/404/404.pug', ['notfound']);
  gulp.watch('src/js/**/*.js', ['js']);
});

//Development task
gulp.task('default', ['watch', 'webserver']);

//Build task
gulp.task('build', function() {
  runSequence('clean', 'min-inline', ['html', 'css', 'js', 'reg', 'instr', 'assets', 'notfound']);
});