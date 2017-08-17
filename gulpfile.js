'use strict';

		var gulp = require( "gulp" ),
 		  concat = require( "gulp-concat" ),
 		  uglify = require( "gulp-uglify" ),
 		  rename = require( "gulp-rename" ),
  		    sass = require( "gulp-sass" ),
       uglifycss = require( "gulp-uglifycss" ),
    autoprefixer = require( "gulp-autoprefixer" ),
   			 del = require( "del" ),
     browserSync = require( "browser-sync" ),
           babel = require( "gulp-babel" ),
	 	  reload = browserSync.reload;

//==========================================
//Browser Sync
//==========================================
gulp.task( "browserSync", function() {
  browserSync({
    server: {
      baseDir: "./"
    },
    port: 8080,
    open: true,
    notify: false
  });
});

//==========================================
//JS
//==========================================
gulp.task( "buildScripts", function() {
	return gulp.src( [
		"lib_sparkliner/js/sparkliner-es5.min.js",
		"src/js/index.js"
	] )
	.pipe( concat("temp.js") )
	.pipe( uglify() )
	.pipe( rename( "bundle.min.js" ) )
	.pipe( gulp.dest( "dist/" ) )
	.pipe( reload( {stream:true} ) );
});

//==========================================
//CSS
//==========================================
gulp.task( "compileSass", function() {
	return gulp.src( [
		"src/scss/index.scss" 
	])
	.pipe( sass() )
	.pipe( autoprefixer({
		browsers: [ "last 3 versions" ],
		cascade: false
	}))
	.pipe( uglifycss() )
	.pipe( rename( "bundle.min.css" ) )
	.pipe( gulp.dest( "dist/" ) )
	.pipe( reload( {stream:true} ) );
});

//==========================================
//Build sparkLiner lib files
//==========================================
gulp.task( "buildSparklinerCSS", function() {
    return gulp.src( "lib_sparkliner/css/sparkliner.css" )
    .pipe( autoprefixer({
		browsers: [ "last 3 versions" ],
		cascade: false
    }))
    .pipe( uglifycss() )
	.pipe( rename( "sparkliner.min.css" ) )
	.pipe( gulp.dest( "lib_sparkliner/css/" ) );
} );

gulp.task( "buildSparklinerJS", function() {
    return gulp.src( "lib_sparkliner/js/sparkliner-es6.js" )
    .pipe( babel({
        presets: ["es2015"]
    }) )
    .pipe( uglify() )
    .pipe( rename( "sparkliner-es5.min.js" ) )
	.pipe( gulp.dest( "lib_sparkliner/js/" ) );
} );

gulp.task( "buildSparkliner", ["buildSparklinerCSS", "buildSparklinerJS"]);


//==========================================
//CLEAN (delete dist files)
//==========================================
gulp.task( "clean" , function() {
	del([
		"dist/"
		]);
});

//==========================================
//BUILD <- [JS,SASS] once
//==========================================
gulp.task( "build", [ "buildScripts", "compileSass"] );

//==========================================
//WATCHER
//==========================================
gulp.task( "watchFiles", function() {
	gulp.watch( [ "src/scss/index.scss", "src/scss/**/*.scss" ] , [ "compileSass" ] );
    gulp.watch( "src/js/index.js", [ "buildScripts" ] );
});

//==========================================
//SERVE
//==========================================
gulp.task( "serve", [ "browserSync", "watchFiles" ] );




