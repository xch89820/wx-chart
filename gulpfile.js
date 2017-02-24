'use strict'
const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const rename = require('gulp-rename');
const jshint = require('gulp-jshint');
const replace = require('gulp-replace');
const insert = require('gulp-insert');
const template = require('gulp-template');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const collapse = require('bundle-collapser/plugin');
const gutil = require('gulp-util');
const streamify = require('gulp-streamify');
const concat = require('gulp-concat');

let pack = require('./package.json');
let header = "/*!\n" +
    " * wx-chart.js\n" +
    " * Chart for WeiXin application\n" +
    " * Version: {{ version }}\n" +
    " *\n" +
    " * Copyright 2016 Jone Casper\n" +
    " * Released under the MIT license\n" +
    " * https://github.com/xch89820/wx-chart/blob/master/LICENSE.md\n" +
    " */\n";

gulp.task('build',function(){
    // Bundled library
    let bundled = browserify('./src/wx-chart.js', { standalone: 'wxChart' })
        //.plugin(collapse)
        .bundle()
        .pipe(source('wx-chart.js'))
        .pipe(streamify(babel({
            presets: ['es2015', 'stage-3']
        })))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', pack.version)))

        //.pipe(streamify(jshint()))
        //.pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist'))
        .pipe(streamify(uglify()))

        .pipe(insert.prepend(header))
        .pipe(streamify(replace('{{ version }}', pack.version)))
        .pipe(streamify(concat('wx-chart.min.js')))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'))



    return bundled;
});

gulp.task('jshint',function(){
    return gulp.src('src/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('default',function(){
    gulp.watch('src/**/*.js',['js']);
});