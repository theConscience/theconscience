'use strict';

// packages imports
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('browserify'),
    browserifyBower = require('browserify-bower'),
    source = require('vinyl-source-stream'),
    vbuffer = require('vinyl-buffer'),
    transform = require('vinyl-transform'),
    rename = require('gulp-rename'),
    watchify = require('watchify'),
    through2 = require('through2'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    _ = require('lodash'),
    del = require('del'),
    glob = require('glob'),
    plumber = require('gulp-plumber'),
    path = require('path'),
    autoprefixer = require('autoprefixer'),
    es = require('event-stream'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    gStreamify = require('gulp-streamify'),
    cssnano = require('cssnano'),
    gulpIf = require('gulp-if'),
    gulpFilter = require('gulp-filter'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    runSequence = require('run-sequence'),
    useref = require('gulp-useref'),
    concat = require('gulp-concat');

// Global config variables
var thisPath = path.resolve(),
  prodRelPath = './theconscience/static/',
  buildRelPath = './theconscience/static/build/',
  prodFullPath = path.resolve(thisPath, prodRelPath),
  buildFullPath = path.resolve(thisPath, buildRelPath);



/* JS tasks */

// babelify = require("babelify"),
// browserify().transform(babelify, {presets: ["es2015", "react"]});
// или
// browserify().transform(babelify.configure({
//    presets: ["es2015", "react"]
// }));

/*
// add custom browserify options here
var customOpts = {
  entries: [sourceJsFile],
  debug: true,
  plugin: ['browserify-bower'],
  transform:[["babelify", { "presets": ["react"] }]]
  //transform: ['babelify', {presets: ['react']}],
};
var opts = _.assign({}, watchify.args, customOpts);
// or like that:
var b = watchify( browserify(sourceJsFile).plugin('browserify-bower').transform("babelify", {presets: ["react"]}) );
*/

// JS config variables    
var sourceJsFile = './theconscience/static/js/app.browserify.jsx',
    sourceJsFiles = ['./theconscience/static/js/testjs/app.browserify.jsx', './theconscience/static/js/testjs/text.js'],
    destJsFolder = './theconscience/static/js/',
    destBuildJsFolder = './theconscience/static/build/js/',
    destJsFile = 'bundle.js',
    destJsMultiFile = 'multibundle.js',
    minJsFileSuffix = '.min';


// 1. JS task with Watchify (###!!! РАБОТАЕТ !!!###)
// принимает только 1 файл, но в нём может быть много зависимостей, которые подтянутся
// через require;
// обёртку wrapPipe вокруг bundle можно убрать, вместе с параметрами success, error
// и методом .on('error', error),  если будет не нужен Дебаггинг.
var b = browserify(sourceJsFile)
          .plugin('browserify-bower')
          .transform("babelify", {presets: ["react"]});
b = watchify(b);

gulp.task('watchify:single', wrapPipe(function(success, error) { bundle(success, error); }));
b.on('update', wrapPipe(function(success, error) { bundle(success, error); }));
//gulp.task('watchify:js', bundle);
//b.on('update', bundle);
b.on('log', gutil.log);

function bundle(success, error) {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(destJsFile).on('error', error))
    // optional, remove if you don't need to buffer file contents
    .pipe(vbuffer().on('error', error))
    // optional, remove if you dont want sourcemaps
    //.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(gulp.dest(destJsFolder).on('error', error))
    .pipe(uglify().on('error', error))
    .pipe(rename({suffix: minJsFileSuffix}).on('error', error))
    //.pipe(rename({dirname: ''}))
    //.pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest(destJsFolder))
    .pipe(gulp.dest(destBuildJsFolder));
    //.pipe(gutil.env.type === 'production' ? exit() : gutil.noop());
}


/* 2. JS task with Watchify and gulp.src (###!!! РАБОТАЕТ !!!###)
 * Принимает много файлов
 * Все файлы собираются в один поток
 *
 * !!! Успешно срабатывает, но после первого срабатывания - ничего не логирует
 *
 * Если меняется один из нескольких файлов, то потом бандл собирается только 
 * из него одного, а значит он затирает содержимое, которое было при склейке
 */

var cachedBundles = {};

function bundleEntry(onUpdate) {
  var transformation = through2.obj(function(file, enc, next) {
    var filename = file.path;
    var config = {
      entries: [filename],
      plugin: ["browserify-bower"],
      transform: [["babelify", { "presets": ["react"] }]]
    };

    var shouldWatch = true;

    function onBundleCB(err, res) {
      if (err) {
        return next(err);
      }
      file.contents = res;
      next(null, file);
    }

    // Watchify configs
    if (shouldWatch) {
      if (cachedBundles[filename]) {
        // Already created a watched bundle, just rebundle
        return cachedBundles[filename].bundle(onBundleCB);
      } else {
        config.cache = {};
        config.packageCache = {};
        config.debug = true;
      }
    }

    var b = browserify(config);
    // var b = browserify(filename).plugin('browserify-bower').transform("babelify", {presets: ["react"]});
    // b.on('error', handleError); // No idea if this is needed (just calls this.end)
    b.on('error', gutil.log.bind(gutil, 'Browserify Error'));

    if (shouldWatch) {
      b = watchify(b);
      cachedBundles[filename] = b;
      b.on('update', function() {
        onUpdate(filename);
      });
    }
    b.bundle(onBundleCB);
  });
  return transformation;
}

gulp.task('watchify:parallel', function() {
  var bundles = sourceJsFiles;
  function buildScripts(files) {
    return gulp.src(files)
    // тут можно делать проверку js или что-то до browserify
    .pipe(bundleEntry(buildScripts))
    //.pipe(plumber())
    .pipe(vbuffer())
    //.pipe($.if(minify, $.uglify({preserveComments: $.uglifySaveLicense}).on('error', handleError)))
    .pipe(gulp.dest(destJsFolder))
    .pipe(concat(destJsMultiFile))
    .pipe(gulp.dest(destJsFolder))
    .pipe(uglify())
    .pipe(rename({suffix: minJsFileSuffix}))
    .pipe(gulp.dest(destJsFolder))
    .pipe(gulp.dest(destBuildJsFolder));
  }
  var scripts = buildScripts(bundles);
  return scripts;
});


/* 3. Watchify task with glob   (###!!! РАБОТАЕТ !!!###) 
 * Самый лучший вариант, не позволяет манипулирувать файлами до попадания в 
 * browserify, зато нормально и Быстро работает watchify
 *
 * Каждый файл в своём потоке
 *
 * + создаёт для каждого файла внутри папки билдов правильный каталог,
 * с таким же путём как был от /static/, и туда сохраняет минифицированный вариант
 * 
 * .jsx переименовывает в .js
 */
var sourceJsFiles2 = './theconscience/static/js/testjs/app**.jsx';
var runContinuously = true;
var isProduction = false;

gulp.task('watchify:js_multi_2', function (runContinuously) {
  var files = glob.sync(sourceJsFiles2);
  var tasks = files.map(function(entry) {
    var endOfEntryPath = path.dirname(entry).slice(prodRelPath.length);
    var prodPath = path.resolve(prodRelPath, endOfEntryPath);
    var buildPath = path.resolve(buildRelPath, endOfEntryPath);

    console.log('\n*********');
    console.log('entry = ' + entry);
    console.log('entry ending path = ' + endOfEntryPath);
    console.log('going to write result to: ' + prodPath);
    console.log('going to write minifyed result to: ' + buildPath);
    console.log('*********\n');

    var browserifyOptions = {
      entries: [path.join(process.cwd(), entry)],
      debug: !isProduction,
      detectGlobals: false,
      plugin: ['browserify-bower'],
      transform: [['babelify', { 'presets': ['react'] }]]
      /*
      outfile: [ (function() {
        switch (path.parse(entry).ext) {
          case '.jsx':
            return path.parse(entry).name + '.js'; 
          default:
            return path.basename(entry);
        }
        // if (path.parse(entry).ext === '.jsx') { 
        //   return path.parse(entry).name + '.js'; 
        // } else {
        //   return path.basename(entry);
        // } 
      })()],
      */
      //extensions: config.client.app.extensions,
    };

    if (runContinuously) {
      _.extend(browserifyOptions, watchify.args);
    }

    var browserifySetup = browserify(browserifyOptions);
    if (runContinuously) {
      browserifySetup = watchify(browserifySetup);
    }

    function bundleScripts(setup) {
      return setup.bundle()
        .pipe(source(path.basename(entry)))
        .pipe(plumber())
        .pipe(gulpIf(
          path.extname(entry) === '.jsx',
          rename({extname: '.js'})
        ))
        //.pipe(gulpIf(isProduction, gStreamify(uglify({mangle: false}))))
        .pipe(gulp.dest(prodPath))
        .pipe(gStreamify(uglify()))
        .pipe(rename({suffix: minJsFileSuffix}))
        .pipe(gulp.dest(buildPath));
    }

    var browserifiedTask = bundleScripts(browserifySetup);

    if (runContinuously) {
      browserifySetup.on('update', function() {
        bundleScripts(browserifySetup);
      });
    }

    browserifySetup.on('log', function(log) {
      gutil.log("Browserify successful '" + gutil.colors.cyan(entry) + "'");
      gutil.log(log);
    });

    if (runContinuously) {
      browserifiedTask.on('error', function(err) {
        console.log(err.toString());
        this.emit('end');
      });
    }

    return browserifiedTask;
  });
  console.log('going to merge ' + files.length + ' streams\n');
  return es.merge.apply(null, tasks);
});


/* к сожалению vinyl-transform больше не работает нормально.
// 4. JS tasks with gulp.watch
gulp.task('js', function() {
  var browserified = transform(function(filename) {
    var b = browserify(filename)
        .plugin('browserify-bower')
        .transform("babelify", {presets: ["react"]});
    return b.bundle();
  });

  return gulp.src(sourceJsFile) 
      .pipe(browserified)
      .pipe(uglify())
      .pipe(gulp.dest(destJsFolder));
});

gulp.task('watch:js',function() {
  gulp.watch(sourceJsFile, ['js']);
});
*/

/* not working
// 5. JS task with glob
var sourceJsFiles2 = './theconscience/static/js/testjs/app**.jsx';
// принимает много файлов. 
gulp.task('js_multi', function(done) {
  glob(sourceJsFiles2, function(err, files) {
    if(err) done(err);

    var tasks = files.map(function(entry) {
      var bundler = function() {
        var b = browserify({ 
          entries: [entry],
          cache: {},
          packageCache: {},
          plugin: [watchify, browserifyBower],
          transform: [['babelify', { 'presets': ['react'] }]] 
          })
          .bundle()
          .pipe(source(entry))
          .pipe(vbuffer())
          .pipe(gulp.dest(destJsFolder))
          //.pipe(concat(destJsMultiFile))
          //.pipe(gulp.dest(destJsFolder))
          .pipe(uglify())
          .pipe(rename({suffix: minJsFileSuffix}))
          .pipe(gulp.dest(destJsFolder))
          .pipe(gulp.dest(destBuildJsFolder));
        return b;
      };
      bundler.on('update', bundler);
      bundler();
    });
    es.merge(tasks).on('end', done);
  });
});
*/

/*
// 6. JS task mix of 2-nd and 4-th
var sourceJsFiles2 = './theconscience/static/js/testjs/app**.jsx';
gulp.task('js_multi', function(done) {
  glob(sourceJsFiles2, function(err, files) {

    if(err) done(err);

    var tasks = files.map(function(entry) {

      var b = browserify(entry)
        .plugin('browserify-bower')
        .transform("babelify", {presets: ["react"]});
      b = watchify(b);

      gulp.task('watchify:js_single', bundle);
      b.on('update', bundle);
      //gulp.task('watchify:js', bundle);
      //b.on('update', bundle);
      b.on('log', gutil.log);

      function bundle() {
        return b.bundle()
          // log errors if they happen
          .on('error', gutil.log.bind(gutil, 'Browserify Error'))
          .pipe(source(destJsFile))
          // optional, remove if you don't need to buffer file contents
          .pipe(vbuffer().on('error', error))
          // optional, remove if you dont want sourcemaps
          //.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
          // Add transformation tasks to the pipeline here.
          .pipe(gulp.dest(destJsFolder))
          .pipe(uglify())
          .pipe(rename({suffix: minJsFileSuffix}))
          //.pipe(rename({dirname: ''}))
          //.pipe(sourcemaps.write('./')) // writes .map file
          .pipe(gulp.dest(destJsFolder))
          .pipe(gulp.dest(destBuildJsFolder));
          //.pipe(gutil.env.type === 'production' ? exit() : gutil.noop());
      }

      return b;
    });
    es.merge(tasks).on('end', done);
  });
});
*/

/* 7. это нужно проверить.
gulp.task('js', function() {
    return browserify(sourceJsFile)
        .plugin('browserify-bower')
        .transform("babelify", {presets: ["react"]})
        .bundle()
        .on('error', function(e) {
            gutil.log(e);
        })
        .pipe(source(destJsFile))
        .pipe(gulp.dest(destJsFolder))
});

gulp.task('watch', function() {
    var bundler = watchify(sourceFile);
    bundler.on('update', rebundle);

    function rebundle() {
        return bundler.bundle()
            .pipe(source(destJsFile))
            .pipe(gulp.dest(destJsFolder));
    }

    return rebundle();
});
*/



/* Styles tasks */

// SASS config variables
var sourceSassFiles = [
    './theconscience/static/css/sass/*.scss',
    './theconscience/static/martial/css/sass/*.scss'//,
    //'./theconscience/static/another_app/css/sass/*.scss'
  ],
  sassConfig = { outputStyle: 'expanded', errLogToConsole: true },
  destSassFolder = './theconscience/static/css/',
  destBuildSassFolder = './theconscience/static/build/css/',
  destSassFile = 'app.css';

// SASS tasks
gulp.task('sass', function() {
  return gulp.src(sourceSassFiles)
    .pipe(sass(sassConfig).on('error', sass.logError))
    .pipe(gulp.dest(destSassFolder));
});

gulp.task('watch:sass',function() {
  gulp.watch(sourceSassFiles,['sass']);
});


// CSS config variables
var sourceCssFiles = [
    './theconscience/static/css/*.css',
    './theconscience/static/martial/css/*.css'//,
    //'./theconscience/static/another_app/css/*.css'
  ],
  destCssFolder = './theconscience/static/css/',
  destBuildCssFolder = './theconscience/static/build/css/',
  destCssFile = 'style.css',
  minCssFileSuffix = '.min';

// CSS tasks
gulp.task('css', function() {
  return gulp.src(sourceCssFiles)
    .pipe(concat(destCssFile))
    .pipe(gulp.dest(destCssFolder));
});

gulp.task('watch:css', function() {
  gulp.watch(sourceCssFiles,['css']);
});


// Styles tasks build
gulp.task('watch:styles', ['sass', 'css'], function() {
  gulp.watch(sourceSassFiles, ['sass']);
  gulp.watch(sourceCssFiles, ['css']);
});
//gulp.task('watch:styles',['watch:sass', 'watch:css']);




/* Useref task:
// Ищет в html файлах разметку
  // <!--build:css css/styles.min.css-->
  // ...styles...
  // <!--endbuild-->
// или / и 
  // <!--build:js js/main.min.js -->
  // ...scripts...
  // <!-- endbuild -->
// файлы склеивает и переименовывает, копирует в указанную папку
// затем в html заменяет содержимое этого блока на один получившийся скрипт/стиль
// полученный в OS файл минифицируем, если js - то через uglify()
// если css - то через cssnano()
// */
gulp.task('useref', function() {
  return gulp.src('app/*.html')
    .pipe(gulp.dest('build'))
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('build'));
});




/* HTML tasks*/
// HTML config variables
var sourceHtmlFiles = [],
  destHTMLFolder = '',
  destBuildHTMLFolder = '',
  destHTMLFile = '',
  minHTMLFileSuffix = '.min';

gulp.task('html', function() {
  return gulp.src()
    .pipe(gulp.dest(destBuildHTMLFolder));
});



/* Images tasks*/

// Images config variables
var sourceImagesStaticFiles = './theconscience/static/images/**/*.+(png|jpg|jpeg|gif|svg)',
  sourceImagesMediaFiles = './theconscience/static/images/**/*.+(png|jpg|jpeg|gif|svg)',
  destBuildImagesFolder = './theconscience/static/build/images/',
  destMediaImagesFolder = './theconscience/media/';

gulp.task('images:static', function(){
  return gulp.src(sourceImagesStaticFiles)
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({ interlaced: true })))
  .pipe(gulp.dest(destBuildImagesFolder));
});

gulp.task('images:media', function(){
  return gulp.src(sourceImagesMediaFiles)
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({ interlaced: true })))
  .pipe(gulp.dest(destMediaImagesFolder));
});

/* Clear cache task (for imagemin) */
gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback);
});




/* Fonts tasks */

// Fonts config variables
var sourceFontsFiles = './theconscience/static/fonts/**/*',
  destBuildFontsFolder = './theconscience/static/build/fonts/';

gulp.task('fonts', function() {
  return gulp.src(sourceFontsFiles)
  .pipe(gulp.dest(destBuildFontsFolder));
});




/* Clean build directory task */
gulp.task('clean:build', function() {
  return del.sync(buildFolder);
});




/* final tasks-bulilds */

gulp.task('default', ['js', 'watch']);

gulp.task('watch', [], function() {

  // ... watchers
});

gulp.task('build', function(callback) {
  console.log('Building files...');
  runSequence(
    'clean:build',
    [ 'sass', 'css', ''],
    callback
  ); 
});



////////////////////////////////////////////////////////////////////////////////
// Additional functions

/**  Вспомогательная функция wrapPipe(), её Не нужно использовать с системами тестирования 
 **  Mocha, в остальных случаях - помогает отследить ошибки изнутри пайплайна...
 *
 * Wrap gulp streams into fail-safe function for better error reporting
 * Usage 1:
 * gulp.task('less', wrapPipe(function(success, error) {
 *   return gulp.src('less/*.less')
 *      .pipe(less().on('error', error))
 *      .pipe(gulp.dest('app/css'));
 * }));
 * Usage 2:
 * gulp.task('styles', wrapPipe(function(success, error) {
 *   return gulp.src('less/*.less')
 *     .pipe(less().on('error', error))
 *     .pipe(autoprefixer().on('error', error))
 *     .pipe(minifyCss().on('error', error))
 *     .pipe(gulp.dest('app/css'));
 *}));
 */
function wrapPipe(taskFn) {
  return function(done) {
    var onSuccess = function() {
      done();
    };
    var onError = function(err) {
      done(err);
    };
    var outStream = taskFn(onSuccess, onError);
    if(outStream && typeof outStream.on === 'function') {
      outStream.on('end', onSuccess);
    }
  };
}

////////////////////////////////////////////////////////////////////////////////