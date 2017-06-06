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


var interface = {
	styl : 'interface/styl/',
	pluginsCss : 'interface/plugins/',
	pluginsJs : 'interface/plugins/',
	js : 'interface/js/',
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

/*------------------ stylus:interface --------------------*/

gulp.task('stylus:interface_plugins_css', function () {
	gulp.src(interface.styl + '*.styl')
		.pipe(stylus({
			'include css': true
		}))
		.on('error', gutil.log)
		.pipe(gulp.dest('interface/css'))
		.pipe(browserSync.stream({
			stream : true
		}));
});


gulp.task('stylus:interface', function () {
	gulp.src(interface.styl + '*.styl')
		.pipe(plumber())
		.on('error', gutil.log)
		.pipe(concat('plugins.css'))
		.pipe(header( getFileNames(interface.pluginsCss + '**/*.{css,styl,sass,scss}') ))
	    .pipe(gulp.dest( paths.to.css ))
    	.pipe(browserSync.stream({
			stream: true
    	}));
});

/*------------------ browser_sync --------------------*/

gulp.task('browser_sync', function() {
	browserSync.init({
	    server: {
	        baseDir: "interface/"
	    },
	    port: "7777",
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

	// stylus
	chokidar.watch(interface.styl + '**/*.styl').on('all', function(){
		gulp.start('stylus:interface');
	});

	// plugins css
	chokidar.watch([interface.pluginsCss + '**/*.{css,scss,styl,sass}']).on('all', function(){
		gulp.start('styles:interface_plugins_css');
	});

});


gulp.task('startup', function(cb){
	sequence(
		'watch:interface',
		'stylus:interface',
		'stylus:interface_plugins_css',
		'browser_sync'
	, cb);
});


gulp.task('default', ['startup']);