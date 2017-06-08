var gulp = require('gulp');
var glob = require('glob');
var path = require("path");
var	browserSync = require('browser-sync').create();
var stylus = require('gulp-stylus');
var gutil = require('gulp-util');
var chokidar = require('chokidar');
var sequence = require('run-sequence');
var concat = require("gulp-concat");
var plumber = require("gulp-plumber");
var del = require('del');
var gcmq = require('gulp-group-css-media-queries');
var header = require('gulp-header');
var pug = require('gulp-pug');
var prettify = require("gulp-prettify");
var	beml = require("gulp-beml");
var rename = require("gulp-rename");
var babel = require("gulp-babel");


var interface = {
	styl : 'interface/styl/',
	pug : 'interface/pug/',
	plugins : 'interface/plugins/',
	js : 'interface/js/',
	jsAssets : 'interface/js_assets',
	css : 'interface/css/',
	html : 'interface/'
};

function getFileNames( paths ) {

	var filesArray = [];

	glob.sync( paths )
	.forEach(function(f) {
	    filesArray.push(path.basename(f));
	});

	return '/*\n' + 'This file contained:\n\n' + filesArray.toString().replace(/,/g, '\n') + '\n\n*/ \n \n \n';
}

/*------------------ interface --------------------*/

gulp.task('stylus:interface', function () {
	return gulp.src(interface.styl + '*.styl')
		.pipe(plumber())
		.pipe(stylus({
			'include css': true
		}))
		.on('error', gutil.log)
		.pipe(gulp.dest(interface.css))
		.pipe(gcmq())
		.pipe(browserSync.stream({
			stream : true
		}));
});


gulp.task('stylus:interface_plugins', function () {
	return gulp.src(interface.plugins + '**/*.{css,styl,sass,scss}')
		.pipe(plumber())
		.on('error', gutil.log)
		.pipe(stylus({
			'include css': true
		}))
		.pipe(concat('blockster_plugins.css'))
		.pipe(header( getFileNames(interface.plugins + '**/*.{css,styl,sass,scss}') ))
	    .pipe(gulp.dest(interface.css))
    	.pipe(browserSync.stream({
			stream: true
    	}));
});


gulp.task('pug:interface', function (done) {
	return gulp.src([interface.pug + '*.pug'])
    	.pipe(plumber())
    	.pipe(pug())
        .pipe(beml({
			elemPrefix: '__',
			modPrefix: '--',
			modDlmtr: '-'
        }))
        .pipe(prettify({
        	indent_size: 4
        }))
        .pipe(rename({
			extname: ".html"
        }))
        .pipe( gulp.dest(interface.html) )
        .on('end', browserSync.reload);
});


gulp.task('js_concat:interface', function(){
	return gulp.src( interface.plugins + '**/*.js')
		.pipe(plumber())
		.pipe(concat('blockster_plugins.js'))
		/*
		.pipe(babel({
            presets: ['es2015']
        }))
        */
		.pipe(header( getFileNames(interface.plugins + '**/*.js') ))
		.pipe(gulp.dest(interface.js))
});

gulp.task('js_assets:interface', function(){
	return gulp.src( interface.jsAssets + '**/*.js')
		.pipe(plumber())
		.pipe(babel({
            presets: ['es2015']
        }))
		.pipe(concat('blockster_app.js'))
		.pipe(gulp.dest(interface.js))
});

/*------------------ browser_sync --------------------*/

gulp.task('browser_sync', function() {
	browserSync.init({
	    server: {
	        baseDir: "interface/"
	    },
	    port: "8080",
		ui : false,
		ghostMode: false,
	    injectChanges: false,
	    codeSync: true,
	    directory: true,
		https: false
	});
});

/*------------------ watch:interface --------------------*/

gulp.task('watch:interface', function(){

	// pug
	chokidar.watch(interface.pug + '**/*.pug').on('all', function(){
		gulp.start('pug:interface');
	});

	// stylus
	chokidar.watch(interface.styl + '**/*.styl').on('all', function(){
		gulp.start('stylus:interface');
	});

	// js
	chokidar.watch(interface.js + '**/*.js').on('all', function(){
		gulp.start('pug:interface');
	});

	chokidar.watch(interface.jsAssets + '**/*.js').on('all', function(){
		gulp.start('js_assets:interface');
	});

	// plugins css
	chokidar.watch([interface.plugins + '**/*.{css,scss,styl,sass}']).on('all', function(){
		gulp.start('stylus:interface_plugins');
	});

	// plugins js
	chokidar.watch( interface.plugins + '**/*.js' ).on('all', function(){
		gulp.start('js_concat:interface')
		.on('end', function() {
			gulp.start('pug:interface');
		});
	});

});


gulp.task('startup', function(cb){
	sequence(
		'watch:interface',
		'stylus:interface',
		'stylus:interface_plugins',
		'pug:interface',
		'js_concat:interface',
		'js_assets:interface',
		'browser_sync'
	, cb);
});


gulp.task('default', ['startup']);