/* gulpfile.js */

// Load some modules which are installed through NPM.
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var brfs = require('brfs');
var sass = require('gulp-sass');
var babelify = require('babelify');
var runSequence = require('run-sequence');
var factor = require('factor-bundle');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var notify = require('gulp-notify');

// Setup CLI args
var argv = require('minimist')(process.argv.slice(2));
var env = argv.env || 'local';
var isLocal = (env === 'local');
var root = isLocal ? 'public' : 'build';
var devMode = argv.dev || isLocal;
var debug = argv.debug || isLocal;

// Define some paths
var paths = {
	src: 'assets',
	dest: root,
	dist: 'dist',
	sass: {
		base: 'assets/sass',
		dest: root,
		src: [
			'/*.scss'
		].map(function(path) {
			return 'assets/sass/' + path;
		})
	}
};

function jsxConfig() {
	// JSX source files. Any .jsx file in the components directory
	// is picked up as the top level jsx components
	var jsx_files = fs.readdirSync('./components').filter(function(name) {
		return path.extname(name) === '.jsx';
	});
	paths.jsx = {
		src: jsx_files.map(function(f) { return 'components/' + f; }),
		dest: jsx_files.map(function(f) { return root + '/components/' + f.replace(/x$/,''); }),
		framework: 'common.js'
	};
	return paths;
}
function browserifyTask(options) {
	paths = jsxConfig();
	var appBundler = browserify({
		entries: [paths.jsx.src], // Only need initial file, browserify finds the deps
		transform: [babelify, brfs], // We want to convert JSX to normal javascript
		debug: debug, // Gives us sourcemapping
		cache: {},
		packageCache: {},
		fullPaths: debug // Requirement of watchify
	});
	// If split is true, we run the stream through factor
	// bundle, which generates a separate .js file for each input.
	// Default: compress all react components into components.js
	if (options.split) {
		appBundler = appBundler.plugin(factor, {
			o: paths.jsx.dest
		});
	}

	// Rebundler - for development
	function rebundler() {
		var start = Date.now();
		return appBundler.bundle()
			.on('error', function(err) {
				console.error(err.message);
				this.emit('end');
			})
			.pipe(source(paths.jsx.framework))
			.pipe(notify(function() {
				console.log('JSX built in ' + (Date.now() - start) + 'ms');
			}));
	};

	// Fire up Watchify when developing
	if (options.watch) {
		appBundler = watchify(appBundler);
		appBundler.on('update', rebundler);
	}

	return rebundler();
};

gulp.task('browserify', function() {
	return browserifyTask({
		development: devMode,
		split: true
	});
});

gulp.task('sass', function () {
  return gulp.src('./assets/sass/**/*.scss')
    .pipe(sass({sourceComments: true}).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('deploy', function(done) {
	runSequence(['sass', 'browserify'] ,  done);
});

gulp.task('default', function(done) {
	runSequence(['sass', 'browserify'], done);
});
