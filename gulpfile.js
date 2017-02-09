var gulp = require('gulp');
var concat = require('gulp-concat');
var wrapper = require('gulp-wrapper');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

var testem = require('testem');

var jsFiles = ['./src/*.js', './src/**/*.js'],  
    jsDest = 'dist';

var testFiles = [
    "test/testClass.js"
  ];

gulp.task('build-src', function() {  
    return gulp.src(jsFiles)
        .pipe(concat('JekyllAdminJS.js'))
        .pipe(wrapper(
        	{
				header: `class JekyllAdminJS extends AdminJS {
					constructor(settings = {}) {
						super(settings);
					}`,
				footer: '}'
			}
		))
        .pipe(babel({
            presets: ['es2015']
        }))
		.pipe(wrapper({
		header: `/**
 * AdminJS v0.1
 *
 * @link   https://github.com/bugra9/JekyllAdminJS
 * @author bugra9 https://github.com/bugra9
 * @license GPLv3
 */
` }))
        .pipe(gulp.dest(jsDest))
		.pipe(rename('JekyllAdminJS.min.js'))
        .pipe(uglify())
		.pipe(wrapper({ header: `/**
 * AdminJS v0.1
 *
 * @link   https://github.com/bugra9/JekyllAdminJS
 * @author bugra9 https://github.com/bugra9
 * @license GPLv3
 */
`}))
        .pipe(gulp.dest(jsDest));
});

gulp.task('build-test', function() { 
	return gulp.src(testFiles)
		.pipe(concat('test.js'))
		.pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

gulp.task('test-ci', function () {
	var testemOptions = {
		file: 'testem.json'
	};

	var t = new testem();
	return t.startCI(testemOptions);
});

gulp.task('build', ['build-src', 'build-test']);
gulp.task('test', ['build', 'test-ci']);

gulp.task('watch', function() {
	gulp.watch(jsFiles, ['build-src']);
	gulp.watch("test/*.js", ['build-test']);
});