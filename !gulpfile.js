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
    chmod = require('gulp-chmod'),
    watchify = require('watchify'),
    through2 = require('through2'),
    imagemin = require('gulp-imagemin'),
    //pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    _ = require('lodash'),
    del = require('del'),
    glob = require('glob'),
    minimist = require('minimist'),
    plumber = require('gulp-plumber'),
    path = require('path'),
    autoprefixer = require('autoprefixer'),
    es = require('event-stream'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    gStreamify = require('gulp-streamify'),
    cssnano = require('gulp-cssnano'),
    gulpIf = require('gulp-if'),
    elseIf = require('gulp-if-else'),
    filter = require('gulp-filter'),
    print = require('gulp-print'),
    lazypipe = require('lazypipe'),
    foreach = require('gulp-foreach'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    runSequence = require('run-sequence'),
    useref = require('gulp-useref'),
    changed = require('gulp-changed'),
    filesCreate = require('gulp-style-inject'),
    concat = require('gulp-concat'),
    gitChanged = require('gulp-git-changed'),
    gitStatus = require('gulp-git-status');

// CLI options
var knownOptions = {
  string: [
    'env',
    'cli_folder',
    'cli_file',
    'cli_path',
    'chmod'
  ],
  boolean: [
    'production',
    'excludes',
    'watch',
    'initial_bundle',
    'backup',
    'commonjs',
    'bundling',
    'jsx',
    'coffee',
    'sass',
    'compress',
    'beautify',
    'clean_all'
  ],
  alias: {
    'e': 'env',
    'prod': 'production',
    'exc': 'excludes',
    'dir': 'cli_folder',
    'f': 'cli_file',
    'p': 'cli_path',
    'w': 'watch',
    'ib': 'initial_bundle',
    'bu': 'backup',
    'cjs': 'commonjs',
    'bd': 'bundling',
    'cff': 'coffee',
    'min': 'compress',
    'btf': 'beautify',
    'cla': 'clean_all'
  },
  default: {
    'env': process.env.NODE_ENV || 'development',
    'production': false,
    'excludes': true,
    'watch': false,
    'initial_bundle': true,
    'backup': false,
    'chmod': 755,
    'commonjs': true,
    'bundling': true,
    'jsx': true,
    'coffee': false,
    'sass': true,
    'compress': false,
    'beautify': false,
    'clean_all': false
  }
};
var options = minimist(process.argv.slice(2), knownOptions);
console.log('\nACTIVE OPTIONS');
console.log('options.env = ' + options.e);
console.log('options.production = ' + options.prod);
console.log('options.excludes = ' + options.exc);
console.log('options.cli_folder = ' + options.dir);
console.log('options.cli_file = ' + options.f);
console.log('options.cli_path = ' + options.p);
console.log('options.watch = ' + options.w);
console.log('options.initial_bundle = ' + options.ib);
console.log('options.backup = ' + options.bu);
console.log('options.chmod = ' + options.chmod);
console.log('options.commonjs = ' + options.cjs);
console.log('options.bundling = ' + options.bd);
console.log('options.jsx = ' + options.jsx);
console.log('options.coffee = ' + options.cff);
console.log('options.sass = ' + options.sass);
console.log('options.compress = ' + options.min);
console.log('options.beautify = ' + options.btf);
console.log('options.clean_all = ' + options.cla);
console.log('\n');

// Global config variables
var thisPath = path.resolve(),
  templatesRelPath = './theconscience/templates/',
  staticRelPath = './theconscience/static/',
  devRelPath = './theconscience/static/source/',
  buildRelPath = './theconscience/static/build/',
  staticDevAbsPath = path.resolve(thisPath, staticRelPath),
  staticBuildAbsPath = path.resolve(thisPath, staticRelPath);

// Excluded folders:
var excludedAppsFolders = '';
if (options.excludes) excludedAppsFolders = '+(admin|rest_framework)/**/*';
var excludedFrontendFolders = '+(node_modules|bower_components|backup)/**/*';



/* JS tasks */

// JS config variables    
var sourceJsFile = './theconscience/static/source/js/jsx/app.cmnjs.jsx',
    sourceJsFiles = ['./theconscience/static/source/js/testjs/jsx/app.cmnjs.jsx', './theconscience/static/source/js/testjs/text.js'],
    destJsFolder = './theconscience/static/source/js/',
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

gulp.task('watchify:single_flow', function() {
  var bundles = sourceJsFiles;
  function buildScripts(files) {
    console.log(buildScripts);
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
var sourceJsFiles2 = './theconscience/static/source/js/testjs/jsx/app**.jsx';
var runContinuously = true;
var isProduction = false;

gulp.task('watchify:parallel', function (runContinuously) {
  var doWhere = sourceJsFiles2;
  
  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + 'app**.jsx';
  } else if (options.cli_file) {
    doWhere = 'js/testjs/jsx/' + options.cli_file;
  }

  console.log('task glob is: ' + doWhere);

  var files = glob.sync(doWhere);
  var tasks = files.map(function(entry) {
    /* Этот блок нужен для обработки различных расширений
    - смены расширений
    - смены папок
    - изменение суб-расширений.
      Что мы потенциально можем обрабатывать:
      case '.jsx':
      case '.scss':
      case '.commonjs':
      case '.bundle':
      case '.concat':
      case '.btf':
      case '.beautified':
    */
    var entryDirName = path.dirname(entry);
    var entryBaseName = path.basename(entry);
    var entryExt = path.extname(entry);
    // понадобятся в случае переименования
    var entryNewDirName = '';
    var entryNewBaseName = '';
    var entryNewExt = '';
    
    console.log('\n*********');
    console.log('entryExt = ' + entryExt);

    /* Добавляем / удаляем суб-экстеншены, обновляя базовое имя файла: */
    // если есть расширение .commonjs
    if (entryBaseName.toLowerCase().indexOf('.commonjs') > -1) {
      console.log('!!! Remove .commonjs suffix');
      if (!entryNewBaseName) {
        entryNewBaseName = removeExtNameFromBaseName(entryBaseName, '.commonjs');
      } else {
        entryNewBaseName = removeExtNameFromBaseName(entryNewBaseName, '.commonjs');
      }
    }
    // если нет расширения .bundle
    if (entryBaseName.toLowerCase().indexOf('.bundle') === -1) {
      console.log('!!! Add .bundle suffix');
      if (!entryNewBaseName) {
        entryNewBaseName = addExtNameToBaseName(entryBaseName, '.bundle');
      } else {
        entryNewBaseName = addExtNameToBaseName(entryNewBaseName, '.bundle');
      }
    }
    // если базовое имя не изменилось - присваиваем переменной entryNewBaseName 
    // первоначальное  значение entryBaseName, иначе - оповещаем
    console.log('============');
    if (!entryNewBaseName) {
      entryNewBaseName = entryBaseName;
      console.log('Базовое имя файла не изменилось: entryNewBaseName = entryBaseName = ' + entryNewBaseName);
    } else {
      console.log('Базовое имя файла ( entryNewBaseName ) изменилось: ' + entryBaseName + ' -> ' + entryNewBaseName);
    }
    console.log('============');

    /* Обрабатываем различные вариации экстеншенов:
     * - распределяем по папкам [ jsx/*.jsx -> ^1 | coffee/*.coffee -> ^1 ] 
     * - меняем, если надо, расширения [.jsx -> .js ]
     */
    // получаем список вложенных папок, в которых лежит файл
    // для дальнейшего перераспределения по папкам
    var entryPathContents = entry.split(path.sep);
    // определяем имя родительской папки
    var entryParentFolder = entryPathContents[entryPathContents.length - 2];
    console.log('entryPathContents = ' + entryPathContents);
    console.log('entryFolder = ' + entryParentFolder);
    // выполняем различные манипуляции, в зависимости от расширения файла
    switch (entryExt) {
      case '.jsx':
        if (entryParentFolder === 'jsx') {
          // если файл в папке /jsx/ то перекладываем его на одну (-2) папку выше
          entryNewDirName = entryPathContents.slice(0,-2).join(path.sep);
          console.log('Новый путь ( entryNewDirName) для jsx/*.jsx : ' + entryNewDirName);
        }
        entryNewExt = '.js';
        break;
      case '.js':
        break;
      case '.coffee':
        if (entryParentFolder === 'coffee') {
          // если файл в папке /jsx/ то перекладываем его на одну (-2) папку выше
          entryNewDirName = entryPathContents.slice(0,-2).join(path.sep);
          console.log('Новый путь ( entryNewDirName) для coffee/*.coffee : ' + entryNewDirName);
        }
        // сменой расширений займётся препроцессор coffee
        break;
      default:
    }
    // если папка не изменилась - присваиваем переменной entryNewDirName
    // первоначальное значение entryDirName, иначе - оповещаем
    console.log('============');
    if (!entryNewDirName) {
      entryNewDirName = entryDirName;
      console.log('Расположение файла не изменилось: entryNewDirName = entryDirName = ' + entryNewDirName);
    } else {
      console.log('Расположение файла ( entryNewDirName ) изменилось : ' + entryDirName + ' -> ' + entryNewDirName);
    }
    console.log('============');

    // если расширение не изменилось - присваиваем переменной entryNewExt
    // первоначальное значение entryExt, иначе - оповещаем
    console.log('============');
    if (!entryNewExt) {
      entryNewExt = entryExt;
      console.log('Расширение файла не изменилось: entryNewExt = entryExt = ' + entryNewExt);
    } else {
      console.log('Расширение файла ( entryNewExt ) изменилось : ' + entryExt + ' -> ' + entryNewExt);
    }
    console.log('============');

    // нужны для правильного переноса файлов с DEV на PROD
    var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
    var devPath = path.resolve(devRelPath, endOfEntryPath);
    var buildPath = path.resolve(buildRelPath, endOfEntryPath);

    console.log('entry = ' + entry);
    console.log('entry new ending path = ' + endOfEntryPath);
    console.log('entry new dir name = ' + entryNewDirName);
    console.log('entry new base name = ' + entryNewBaseName);
    console.log('entry new extension = ' + entryNewExt);
    console.log('going to write result to: ' + devPath);
    console.log('going to write minifyed result to: ' + buildPath);
    console.log('*********\n');

    /* Настраиваем Browserify: */

    var browserifyOptions = {
      entries: [path.join(process.cwd(), entry)],
      debug: !isProduction,
      detectGlobals: false,
      plugin: ['browserify-bower'],
      transform: [['babelify', { 'presets': ['react'] }]]
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
        .pipe(source(entryBaseName))
        .pipe(plumber())
        .pipe(rename(entryNewBaseName))
        .pipe(rename({extname: entryNewExt}))
        //.pipe(gulpIf(isProduction, gStreamify(uglify({mangle: false}))))
        .pipe(gulp.dest(devPath))
        // минифицируем, добавляем суффикс, и отправляем в production папку
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



/* 4. Browserify all commonjs once
 *
 *
 */
gulp.task('do:brsrf_commonjs_all', function() {
  var doWhere = '**/*.commonjs.*(js|jsx)';

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + '*.commonjs.*(js|jsx)';
  } else if (options.cli_file) {
    doWhere = '**/' + options.cli_file;
  }

  var ignoredAppsFolders = '';
  var ignoredFrontendFolders = '';
  if (excludedAppsFolders) {
    ignoredAppsFolders = devRelPath + excludedAppsFolders;
  }
  if (excludedFrontendFolders) {
    ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  }

  console.log('task glob is: ' + devRelPath + doWhere);
  console.log('glob ignores: ' + ignoredAppsFolders + ' ' + ignoredFrontendFolders);
  
  var files = glob.sync(devRelPath + doWhere, { ignore: [ignoredAppsFolders, ignoredFrontendFolders]} );
  var tasks = files.map(function(entry) {
    /* 
      case '.jsx':
      case '.commonjs':
      case '.bundle':
    */
    var entryDirName = path.dirname(entry);
    var entryBaseName = path.basename(entry);
    var entryExt = path.extname(entry);
    var entryNewDirName = '';
    var entryNewBaseName = '';
    var entryNewExt = '';

    if (entryBaseName.toLowerCase().indexOf('.commonjs') > -1) {
      if (!entryNewBaseName) {
        entryNewBaseName = removeExtNameFromBaseName(entryBaseName, '.commonjs');
      } else {
        entryNewBaseName = removeExtNameFromBaseName(entryNewBaseName, '.commonjs');
      }
    }

    if (entryBaseName.toLowerCase().indexOf('.bundle') === -1) {
      if (!entryNewBaseName) {
        entryNewBaseName = addExtNameToBaseName(entryBaseName, '.bundle');
      } else {
        entryNewBaseName = addExtNameToBaseName(entryNewBaseName, '.bundle');
      }
    }
    if (!entryNewBaseName) {
      entryNewBaseName = entryBaseName;
    }

    var entryPathContents = entry.split(path.sep);
    var entryParentFolder = entryPathContents[entryPathContents.length - 2];

    switch (entryExt) {
      case '.jsx':
        if (entryParentFolder === 'jsx') {
          entryNewDirName = entryPathContents.slice(0,-2).join(path.sep);
        }
        entryNewExt = '.js';
    }
    if (!entryNewDirName) {
      entryNewDirName = entryDirName;
    }
    if (!entryNewExt) {
      entryNewExt = entryExt;
    }

    var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
    var devPath = path.resolve(devRelPath, endOfEntryPath);

    console.log('entry = ' + entry);
    console.log('entry new ending path = ' + endOfEntryPath);
    console.log('entry new dir name = ' + entryNewDirName);
    console.log('entry new base name = ' + entryNewBaseName);
    console.log('entry new extension = ' + entryNewExt);
    console.log('going to write result to: ' + devPath);
    console.log('*********\n');

    var browserifyOptions = {
      entries: [path.join(process.cwd(), entry)],
      debug: !isProduction,
      detectGlobals: false,
      plugin: ['browserify-bower'],
      transform: [['babelify', { 'presets': ['react'] }]]
    };

    var browserifySetup = browserify(browserifyOptions);

    function bundleScripts(setup) {
      return setup.bundle()
        .pipe(source(entryBaseName))
        .pipe(plumber())
        .pipe(rename(entryNewBaseName))
        .pipe(rename({extname: entryNewExt}))
        .pipe(gulp.dest(devPath));
    }

    var browserifiedTask = bundleScripts(browserifySetup);

    browserifySetup.on('log', function(log) {
      gutil.log("Browserify successful '" + gutil.colors.cyan(entry) + "'");
      gutil.log(log);
    });

    return browserifiedTask;
  });

  console.log('going to merge ' + files.length + ' streams\n');
  return es.merge.apply(null, tasks);
});



/* 5. Browserify main
 *
 *
 */
gulp.task('browserify', function() {

  var ext = '';
  var subext = '';

  if (options.jsx && !options.coffee) {
    ext = '.*(js|jsx)';
  } else if (options.jsx && options.coffee) {
    ext = '.*(js|jsx|coffee)';
  } else if (!options.jsx && options.coffee) {
    ext = '.coffee'; 
  }

  if (options.commonjs) {
    subext = '*.commonjs';
  } else {
    subext = '*';
  }

  var doWhere = '**/' + subext + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + subext + ext;
  } else if (options.cli_file) {
    doWhere = '**/' + options.cli_file;
  }

  var ignoredAppsFolders = '';
  var ignoredFrontendFolders = '';
  if (excludedAppsFolders) {
    ignoredAppsFolders = devRelPath + excludedAppsFolders;
  }
  if (excludedFrontendFolders) {
    ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  }

  console.log('task glob is: ' + devRelPath + doWhere);
  console.log('glob ignores: ' + ignoredAppsFolders + ' ' + ignoredFrontendFolders);
  
  var files = glob.sync(devRelPath + doWhere, { ignore: [ignoredAppsFolders, ignoredFrontendFolders]} );
  console.log('FILES IS: \n' + files);
  var tasks = files.map(function(entry) {

    var entryDirName = path.dirname(entry);
    var entryBaseName = path.basename(entry);
    var entryExt = path.extname(entry);
    var entryNewDirName = '';
    var entryNewBaseName = '';
    var entryNewExt = '';
    // если надо - бэкапим изменяемые файлы
    if (options.backup) {
      gulp.src(entry)
        .pipe(chmod(parseInt(options.chmod)))
        .pipe(gulp.dest(entryDirName + '/backup/'));
    }
    // меняем субэкстеншены, где нужно
    if (entryBaseName.toLowerCase().indexOf('.commonjs') > -1 && options.commonjs) {
      if (!entryNewBaseName) {
        entryNewBaseName = removeExtNameFromBaseName(entryBaseName, '.commonjs');
      } else {
        entryNewBaseName = removeExtNameFromBaseName(entryNewBaseName, '.commonjs');
      }
    }
    if (entryBaseName.toLowerCase().indexOf('.bundle') === -1 && options.bundling) {
      if (!entryNewBaseName) {
        entryNewBaseName = addExtNameToBaseName(entryBaseName, '.bundle');
      } else {
        entryNewBaseName = addExtNameToBaseName(entryNewBaseName, '.bundle');
      }
    }
    if (!entryNewBaseName) {
      entryNewBaseName = entryBaseName;
    }
    
    var entryPathContents = entry.split(path.sep);
    var entryParentFolder = entryPathContents[entryPathContents.length - 2];
    // перекладываем в другие папки, где нужно
    switch (entryExt) {
      case '.jsx':
        if (options.jsx) {
          if (entryParentFolder === 'jsx') {
            entryNewDirName = entryPathContents.slice(0,-2).join(path.sep);
          }
          entryNewExt = '.js';
        }
      case '.coffee':
        if (options.coffee) {
          if (entryParentFolder === 'coffee') {
            entryNewDirName = entryPathContents.slice(0,-2).join(path.sep);
          }
          // new ext will be done by coffee preprocessor
        }
    }
    if (!entryNewDirName) {
      entryNewDirName = entryDirName;
    }
    if (!entryNewExt) {
      entryNewExt = entryExt;
    }

    var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
    var devPath = path.resolve(devRelPath, endOfEntryPath);
    var buildPath = path.resolve(buildRelPath, endOfEntryPath);

    console.log('entry = ' + entry);
    console.log('entry new ending path = ' + endOfEntryPath);
    console.log('entry new dir name = ' + entryNewDirName);
    console.log('entry new base name = ' + entryNewBaseName);
    console.log('entry new extension = ' + entryNewExt);
    console.log('going to write result to: ' + devPath);
    if (options.production) console.log('going to write minifyed result to: ' + buildPath);
    console.log('*********\n');

    /* browserify config*/

    var browserifyOptions = {
      entries: [path.join(process.cwd(), entry)],
      debug: !isProduction,
      detectGlobals: false,
      plugin: ['browserify-bower'],
      transform: [['babelify', { 'presets': ['react'] }]]
    };

    if (options.watch) {
      _.extend(browserifyOptions, watchify.args);
    }

    var browserifySetup = browserify(browserifyOptions);

    if (options.watch) {
      browserifySetup = watchify(browserifySetup);
    }

    //var excludedFoldersFilter = filter(excludedFolders);

    function bundleScripts(setup) {
      return setup.bundle()
        .pipe(source(entryBaseName))
        .pipe(plumber())
        .pipe(rename(entryNewBaseName))
        .pipe(rename({extname: entryNewExt}))
        .pipe(gulp.dest(devPath))
        // отправляем в канал продакшена или минификации
        .pipe(gulpIf(options.production && !options.compress, productionChannel()))
        .pipe(gulpIf(!options.production && options.compress, minifyingChannel()))
        .pipe(gulpIf(options.production && options.compress, productionMinifyingChannel()));
    }

    var productionChannel = lazypipe()
        .pipe(gStreamify, uglify())
        //.pipe(gutil.log, 'gonna minify files to production')
        .pipe(rename, {suffix: minJsFileSuffix})
        .pipe(gulp.dest, buildPath);

    var minifyingChannel = lazypipe()
        .pipe(gStreamify, uglify())
        //.pipe(gutil.log, 'gonna minify files on dev')
        .pipe(rename, {suffix: minJsFileSuffix})
        .pipe(gulp.dest, devPath);

    var productionMinifyingChannel = lazypipe()
        .pipe(gStreamify, uglify())
        //.pipe(gutil.log, 'gonna minify files on dev and copy to production')
        .pipe(rename, {suffix: minJsFileSuffix})
        .pipe(gulp.dest, devPath)
        .pipe(gulp.dest, buildPath);

    if (options.initial_bundle) {
      var browserifiedTask = bundleScripts(browserifySetup);
    }

    if (options.watch) {
      browserifySetup.on('update', function() {
        bundleScripts(browserifySetup);
      });
    }

    browserifySetup.on('log', function(log) {
      gutil.log("Browserify successful '" + gutil.colors.cyan(entry) + "'");
      gutil.log(log);
    });

    if (options.watch && options.initial_bundle) {
      browserifiedTask.on('error', function(err) {
        console.log(err.toString());
        this.emit('end');
      });
    }

    if (options.initial_bundle) {
      return browserifiedTask;
    } else {
      return gulp.src(entry)
        .pipe(gulp.dest(path.dirname(entry) + '/backup/'));
    }
  });

  console.log('going to merge ' + files.length + ' streams\n');
  return es.merge.apply(null, tasks);
});




/* 6. JS build
 * minifying .js files, and then copy all *.min.js to /build/ folder.
 *
 */
gulp.task('build:js', function() {
  // jsx и coffe не нужны на боевом, так что - берём только чистые .js
  var ext = '.js';
  // берём все файлы кроме .commonjs и .browserify - мы не хотим чтобы файлы с директивой require() попали на боевой!
  var subext = '!(*\.commonjs|*\.browserify)';  // '!(*\.commonjs)?(.min)' - но это по сути тоже самое что '!(*\.commonjs)'
  var doWhere = '**/' + subext + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + subext + ext;
  } else if (options.cli_file) {
    doWhere = '**/' + options.cli_file;
  }

  var ignoredAppsFolders = '';
  var ignoredFrontendFolders = '';
  if (excludedAppsFolders) {
    ignoredAppsFolders = devRelPath + excludedAppsFolders;
  }
  if (excludedFrontendFolders) {
    ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  }

  console.log('task glob is: ' + devRelPath + doWhere);
  console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  var files = glob.sync(devRelPath + doWhere, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function jsBuild() {
    var tasks = files.map(function(entry) {

      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/'));
      }

      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }

      var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('entry new dir name = ' + entryNewDirName);
      console.log('going to write result to: ' + devPath);
      console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      var alreadyMinifyedFilter = filter('**/*.min.js', {restore: true});
      var nonMinifyedFilter = filter('**/!(*\.min).js', {restore: true});

      var copyChannel = lazypipe()
          .pipe(print, function(filepath) {
            return 'going to copy already minifyed JS file ' + filepath + ' to build dir.';
          })
          .pipe(chmod, parseInt(options.chmod))
          .pipe(gulp.dest, buildPath);

      var minifyChannel = lazypipe()
          .pipe(print, function(filepath) {
            return 'going to minify JS file ' + filepath + ' add .min suffix, and copy to build dir.';
          })
          .pipe(gStreamify, uglify())
          .pipe(rename, {suffix: minJsFileSuffix})
          .pipe(chmod, parseInt(options.chmod))
          .pipe(gulp.dest, devPath);

      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          .pipe(print())
          // отправляем в канал продакшена или минификации
          .pipe(nonMinifyedFilter)
          .pipe(minifyChannel())
          .pipe(nonMinifyedFilter.restore)
          .pipe(alreadyMinifyedFilter)
          .pipe(copyChannel())
          .pipe(alreadyMinifyedFilter.restore)
          .pipe(print(function(filepath) {return 'end of pipe with file ' + filepath;}));
      }
      return gulp.src(entry)
        .pipe(nonMinifyedFilter)
        .pipe(print(function(filepath) {return 'nonMinifyedFilter returns ' + filepath + ' sending to minifyChannel()';}))
        .pipe(minifyChannel())
        .pipe(nonMinifyedFilter.restore)
        .pipe(print(function(filepath) {return 'nonMinifyedFilter after restore ' + filepath;}))
        .pipe(alreadyMinifyedFilter)
        .pipe(print(function(filepath) {return 'alreadyMinifyedFilter returns ' + filepath + ' sending to copyChannel()';}))
        .pipe(copyChannel())
        .pipe(alreadyMinifyedFilter.restore)
        .pipe(print(function(filepath) {return 'alreadyMinifyedFilter after restore ' + filepath;}))
        .pipe(print(function(filepath) {return 'end of pipe with file ' + filepath;}));
    });
    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }
  jsBuild();
});



/* Всякая херня: */

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
    './theconscience/static/source/**/*.scss',
    './theconscience/static/source/martial/css/sass/*.scss'//,
    //'./theconscience/static/another_app/css/sass/*.scss'
  ],
  sassConfig = { outputStyle: 'expanded', errLogToConsole: true };
  //destSassFolder = './theconscience/static/source/css/',
  //destBuildSassFolder = './theconscience/static/build/css/',
  //destSassFile = 'app.css';


// SASS tasks
// $ gulp sass [--w] [--dir (имя папки)] [--f (имя файла)] [--p (всё сразу, т.е. как --dir + --f)]
gulp.task('sass', function() {
  var ext = '*.scss';

  if (options.sass) {
    ext = '*.scss';
  }

  var doWhere = '**/' + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + ext;
  } else if (options.cli_file) {
    doWhere = '**/' + options.cli_file;
  }

  var ignoredAppsFolders = '';
  var ignoredFrontendFolders = '';
  if (excludedAppsFolders) {
    ignoredAppsFolders = devRelPath + excludedAppsFolders;
  }
  if (excludedFrontendFolders) {
    ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  }

  console.log('task glob is: ' + devRelPath + doWhere);
  console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  var files = glob.sync(devRelPath + doWhere, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function compileSass() {
    var tasks = files.map(function(entry) {
      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/', {mode: '0777'}));
      }

      var entryPathContents = entry.split(path.sep);
      var entryParentFolder = entryPathContents[entryPathContents.length - 2];

      switch (entryExt) {
        case '.scss':
          if (options.sass) {
            if (entryParentFolder === 'sass') {
              entryNewDirName = entryPathContents.slice(0,-2).join(path.sep);
            }
            // new ext will be done by sass preprocessor
          }
      }
      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }

      var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('entry new dir name = ' + entryNewDirName);
      console.log('going to write result to: ' + devPath);
      if (options.production) console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      var productionChannel = lazypipe()
          .pipe(cssnano)
          .pipe(rename, {suffix: minCssFileSuffix})
          .pipe(gulp.dest, buildPath);

      var minifyingChannel = lazypipe()
          .pipe(cssnano)
          .pipe(rename, {suffix: minCssFileSuffix})
          .pipe(gulp.dest, devPath);

      var productionMinifyingChannel = lazypipe()
          .pipe(cssnano)
          .pipe(rename, {suffix: minCssFileSuffix})
          .pipe(gulp.dest, devPath)
          .pipe(gulp.dest, buildPath);

      /* Раскомментить если хотим препроцессить каждый файл отдельно, а не весь банч
      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          .pipe(sass(sassConfig).on('error', sass.logError))
          .pipe(gulp.dest(devPath))
          // отправляем в канал продакшена или минификации
          .pipe(gulpIf(options.production && !options.compress, productionChannel()))
          .pipe(gulpIf(!options.production && options.compress, minifyingChannel()))
          .pipe(gulpIf(options.production && options.compress, productionMinifyingChannel()));
      }*/
      return gulp.src(entry)
        .pipe(sass(sassConfig).on('error', sass.logError))
        .on('end', function() { console.log(entry + ' preprocessed by SASS'); })
        .pipe(gulp.dest(devPath))
        // отправляем в канал продакшена или минификации
        .pipe(gulpIf(options.production && !options.compress, productionChannel()))
        .pipe(gulpIf(!options.production && options.compress, minifyingChannel()))
        .pipe(gulpIf(options.production && options.compress, productionMinifyingChannel()));
    });

    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }

  if (options.watch) {  // комментируем, если не хотим препроцессить весь банч
    var watcher = gulp.watch(files);
    watcher.on('change', function() { compileSass(); });
  } else {
    compileSass();
  }

});


/* работает, но слишком примитивен.
// вместо этого используем: 
// $ gulp sass --w [--dir (имя папки), --f (имя файла), --p (всё сразу, т.е. как --dir + --f)]
gulp.task('watch:sass',function() {
  gulp.watch(sourceSassFiles, ['sass']);
});
*/


// CSS config variables
var minCssFileSuffix = '.min', 
  sourceCssFiles = [
    './theconscience/static/source/css/*.css',
    './theconscience/static/source/martial/css/*.css'//,
    //'./theconscience/static/another_app/css/*.css'
  ];
  //destCssFolder = './theconscience/static/source/css/',
  //destBuildCssFolder = './theconscience/static/build/css/',
  //destCssFile = 'style.css',
  
/* Работает, но примитивно, и уже не нужно.
// CSS tasks
gulp.task('css', function() {
  return gulp.src(sourceCssFiles)
    .pipe(concat(destCssFile))
    .pipe(gulp.dest(destCssFolder));
});

gulp.task('watch:css', function() {
  gulp.watch(sourceCssFiles,['css']);
});
*/


gulp.task('build:css', function() {
  var ext = '.css';
  var subext = '*?(.min)';
  var doWhere = '**/' + subext + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + subext + ext;
  } else if (options.cli_file) {
    doWhere = '**/' + options.cli_file;
  }

  var ignoredAppsFolders = '';
  var ignoredFrontendFolders = '';
  if (excludedAppsFolders) {
    ignoredAppsFolders = devRelPath + excludedAppsFolders;
  }
  if (excludedFrontendFolders) {
    ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  }

  console.log('task glob is: ' + devRelPath + doWhere);
  console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  // эта штуковина не работает на отслеживание, если мы добавляем в папку новый файл.
  // т.е. она следит только за теми, которые на этапе запуска были выбраны
  var files = glob.sync(devRelPath + doWhere, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function cssBuild() {
    var tasks = files.map(function(entry) {

      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/'));
      }

      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }

      var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('entry new dir name = ' + entryNewDirName);
      console.log('going to write result to: ' + devPath);
      console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      var alreadyMinifyedFilter = filter('**/*.min.css', {restore: true});
      var nonMinifyedFilter = filter('**/!(*\.min).css', {restore: true});

      var copyChannel = lazypipe()
          .pipe(print, function(filepath) {
            return 'going to copy already minifyed file ' + filepath + ' to build dir.';
          })
          .pipe(chmod, parseInt(options.chmod))
          .pipe(gulp.dest, buildPath);

      var minifyChannel = lazypipe()
          .pipe(print, function(filepath) {
            return 'going to minify file ' + filepath + ' rename, and copy to build dir.';
          })
          .pipe(cssnano)
          .pipe(rename, {suffix: minCssFileSuffix})
          .pipe(chmod, parseInt(options.chmod))
          .pipe(gulp.dest, devPath);

      ///* Закомментить если хотим препроцессить не каждый файл отдельно, весь банч
      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          .pipe(print())
          // отправляем в канал продакшена или минификации
          .pipe(nonMinifyedFilter)
          .pipe(minifyChannel())
          .pipe(nonMinifyedFilter.restore)
          .pipe(alreadyMinifyedFilter)
          .pipe(copyChannel())
          .pipe(alreadyMinifyedFilter.restore)
          .pipe(print(function(filepath) {return 'end of pipe with file ' + filepath;}));
      }//*/
      return gulp.src(entry)
        .pipe(nonMinifyedFilter)
        .pipe(print(function(filepath) {return 'nonMinifyedFilter returns ' + filepath + ' sending to minifyChannel()';}))
        .pipe(minifyChannel())
        .pipe(nonMinifyedFilter.restore)
        .pipe(print(function(filepath) {return 'nonMinifyedFilter after restore ' + filepath;}))
        .pipe(alreadyMinifyedFilter)
        .pipe(print(function(filepath) {return 'alreadyMinifyedFilter returns ' + filepath + ' sending to copyChannel()';}))
        .pipe(copyChannel())
        .pipe(alreadyMinifyedFilter.restore)
        .pipe(print(function(filepath) {return 'alreadyMinifyedFilter after restore ' + filepath;}))
        .pipe(print(function(filepath) {return 'end of pipe with file ' + filepath;}));
    });
    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }
  /* раскомментируем, если хотим при изменении каждого файла - заново минимизить все
  if (options.watch) {
    var watcher = gulp.watch(files);
    watcher.on('change', function() { cssBuild(); });
  } else {*/
  cssBuild();
  //}
});

// Styles tasks build
/*
gulp.task('watch:styles', ['sass', 'css'], function() {
  gulp.watch(sourceSassFiles, ['sass']);
  gulp.watch(sourceCssFiles, ['css']);
});
*/




/* Full styles build*/
gulp.task('build:styles', function(callback) {
  console.log('Preprocessing SASS and build styles...');
  runSequence(
    'sass',
    ['build:css'],
    callback
  ); 
});




/* Images tasks*/

// Images config variables
var sourceImagesStaticFiles = './theconscience/static/source/img/**/*.+(png|jpg|jpeg|gif|svg)',
  sourceImagesMediaFiles = './theconscience/media/**/*.+(png|jpg|jpeg|gif|svg)',
  destBuildImagesFolder = './theconscience/static/build/img/',
  destMediaImagesFolder = './theconscience/media/min/';

gulp.task('build:images', function(){
  var ext = '*.+(png|jpg|JPG|gif|svg|ico)';
  var doWhere = '**/' + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + ext;
  } else if (options.cli_file) {
    doWhere = '**/' + options.cli_file;
  }

  var ignoredAppsFolders = '';
  var ignoredFrontendFolders = '';
  if (excludedAppsFolders) {
    ignoredAppsFolders = devRelPath + excludedAppsFolders;
  }
  if (excludedFrontendFolders) {
    ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  }

  console.log('task glob is: ' + devRelPath + doWhere);
  console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  var files = glob.sync(devRelPath + doWhere, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function doImageMin() {
    var tasks = files.map(function(entry) {
      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/'));
      }

      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }

      var endOfEntryPath = entryNewDirName.slice(devRelPath.length);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          // Caching images that ran through imagemin
          .pipe(cache(imagemin({
            interlaced: true,
            progressive: true
            /*svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ],
            use: [pngquant({quality: '65-80', speed: 4})]*/
          })))
          .pipe(gulp.dest(buildPath));
      }
      return gulp.src(entry)
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({ interlaced: true })))
        .pipe(gulp.dest(buildPath));
    });
    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }
  doImageMin();
});

/* Clear cache task (for imagemin) */
gulp.task('images_cache:clear', function (callback) {
  return cache.clearAll(callback);
});

gulp.task('images:media', function(){
  return gulp.src(sourceImagesMediaFiles)
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({ interlaced: true })))
  .pipe(gulp.dest(destMediaImagesFolder));
});




/* Fonts tasks */

// Fonts config variables
var sourceFontsFiles = './theconscience/static/source/fonts/**/*',
  destBuildFontsFolder = './theconscience/static/build/fonts/';

gulp.task('build:fonts', function() {
  return gulp.src(sourceFontsFiles)
    .pipe(gulp.dest(destBuildFontsFolder));
});




/* Final static build */
gulp.task('build:static', ['build:css', 'build:js', 'build:images', 'build:fonts']);




/* Clean build directory task */
// если будем использовать gulp-changed то зачистка будет нужна не всегда
gulp.task('build:clean', function() {
  var ignoredAppsFolders = '',
      ignoredAppsFiles = '';
  if (!options.clean_all) {
    if (excludedAppsFolders) {
      // тут косяк с названиями, надо везде исправить excludedAppsFolders На excludedAppsFiles.
      // а excludedAppsFolders создать, и приравнять '+(admin|rest_framework)' или со слэшом на конце...
      ignoredAppsFiles = buildRelPath + excludedAppsFolders;
      ignoredAppsFolders = buildRelPath + '+(admin|rest_framework)';
    }
  }
  // из-за особенности работы del приходится указывать в игнорах не только файлы, но и их папки
  return del.sync(buildRelPath + '**/*', { ignore: [ignoredAppsFolders, ignoredAppsFiles]} );
});




/* Copy external apps folders to build */
// если будем использовать gulp-changed то зачистка будет нужна не всегда
gulp.task('build:get_external_apps', function() {
  return gulp.src(devRelPath + excludedAppsFolders)
    .pipe(gulp.dest(buildRelPath));
});




/* Template tasks */

// Create concatenated css/js from Html link/script bundles

gulp.task('concat:from_html', function() {
  var ext = '.html',
      subext = '*+(_links|_scripts)';

  var doWhere = '**/+(scripts|links)/' + subext + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + subext + ext;
  } else if (options.cli_file) {
    doWhere = '**/+(scripts|links)/' + options.cli_file;
  }

  // var ignoredAppsFolders = '';
  // var ignoredFrontendFolders = '';
  // if (excludedAppsFolders) {
  //   ignoredAppsFolders = devRelPath + excludedAppsFolders;
  // }
  // if (excludedFrontendFolders) {
  //   ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  // }

  console.log('task glob is: ' + templatesRelPath + doWhere);
  //console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  var files = glob.sync(templatesRelPath + doWhere);//, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function concatFilesFromHtml() {
    var tasks = files.map(function(entry) {
      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/'));
      }

      var entryPathContents = entry.split(path.sep);
      var entryParentFolder = entryPathContents[entryPathContents.length - 2];

      switch (entryExt) {
        case '.html':
          if (entryParentFolder === 'links' && entryBaseName.indexOf('_links') !== -1) {
            console.log('got links!');
            entryNewDirName = entryPathContents.slice(0,-2).join(path.sep) + '/css';
            entryNewExt = '.css';
          } else if (entryParentFolder === 'scripts' && entryBaseName.indexOf('_scripts') !== -1) {
            console.log('got scripts!');
            entryNewDirName = entryPathContents.slice(0,-2).join(path.sep) + '/js';
            entryNewExt = '.js';
          }
      }
      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }
      if (!entryNewExt) {
        entryNewExt = entryExt;
      }

      var endOfEntryPath = entryNewDirName.slice(templatesRelPath.length);
      var templatesPath = path.resolve(templatesRelPath, endOfEntryPath);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('templatesPath = ' + templatesPath);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('entry new dir name = ' + entryNewDirName);
      console.log('entry new ext name = ' + entryNewExt);
      console.log('going to write result to: ' + devPath);
      
      //if (options.production) console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          .pipe(filesCreate({static_url_path: devRelPath}))
          .pipe(rename({suffix: '.concated', extname: entryNewExt}))
          .pipe(gulp.dest(devPath));
      }

      return gulp.src(entry)
        .pipe(filesCreate({static_url_path: devRelPath}))
        .pipe(rename({suffix: '.concated', extname: entryNewExt}))
        .pipe(gulp.dest(devPath));
    });

    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }
  /*
  if (options.watch) {  // комментируем, если не хотим препроцессить весь банч
    var watcher = gulp.watch(files);
    watcher.on('change', function() { concatFilesFromHtml(); });
  } else {*/
    concatFilesFromHtml();
  //}
});



gulp.task('concat:links', function() {
  var ext = '.html',
      subext = '*_links';

  var doWhere = '**/links/' + subext + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + subext + ext;
  } else if (options.cli_file) {
    doWhere = '**/links/' + options.cli_file;
  }

  // var ignoredAppsFolders = '';
  // var ignoredFrontendFolders = '';
  // if (excludedAppsFolders) {
  //   ignoredAppsFolders = devRelPath + excludedAppsFolders;
  // }
  // if (excludedFrontendFolders) {
  //   ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  // }

  console.log('task glob is: ' + templatesRelPath + doWhere);
  //console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  var files = glob.sync(templatesRelPath + doWhere);//, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function concatCssFromHtml() {
    var tasks = files.map(function(entry) {
      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/'));
      }

      var entryPathContents = entry.split(path.sep);
      var entryParentFolder = entryPathContents[entryPathContents.length - 2];

      switch (entryExt) {
        case '.html':
          if (entryParentFolder === 'links' && entryBaseName.indexOf('_links') !== -1) {
            console.log('got links!');
            entryNewDirName = entryPathContents.slice(0,-2).join(path.sep) + '/css';
            entryNewExt = '.css';
          }
      }
      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }
      if (!entryNewExt) {
        entryNewExt = entryExt;
      }

      var endOfEntryPath = entryNewDirName.slice(templatesRelPath.length);
      var templatesPath = path.resolve(templatesRelPath, endOfEntryPath);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('templatesPath = ' + templatesPath);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('entry new dir name = ' + entryNewDirName);
      console.log('entry new ext name = ' + entryNewExt);
      console.log('going to write result to: ' + devPath);
      
      //if (options.production) console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          .pipe(filesCreate({static_url_path: devRelPath}))
          .pipe(rename({suffix: '.concated', extname: entryNewExt}))
          .pipe(gulp.dest(devPath));
      }

      return gulp.src(entry)
        .pipe(filesCreate({static_url_path: devRelPath}))
        .pipe(rename({suffix: '.concated', extname: entryNewExt}))
        .pipe(gulp.dest(devPath));
    });

    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }
  /*
  if (options.watch) {  // комментируем, если не хотим препроцессить весь банч
    var watcher = gulp.watch(files);
    watcher.on('change', function() { concatCssFromHtml(); });
  } else {*/
    concatCssFromHtml();
  //}
});




gulp.task('concat:scripts', function() {
  var ext = '.html',
      subext = '*_scripts';

  var doWhere = '**/scripts/' + subext + ext;

  if (options.cli_path) {
    doWhere = options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    doWhere = options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    doWhere = options.cli_folder + subext + ext;
  } else if (options.cli_file) {
    doWhere = '**/scripts/' + options.cli_file;
  }

  // var ignoredAppsFolders = '';
  // var ignoredFrontendFolders = '';
  // if (excludedAppsFolders) {
  //   ignoredAppsFolders = devRelPath + excludedAppsFolders;
  // }
  // if (excludedFrontendFolders) {
  //   ignoredFrontendFolders = devRelPath + '**/' + excludedFrontendFolders;
  // }

  console.log('task glob is: ' + templatesRelPath + doWhere);
  //console.log('glob ignores: \n' + ignoredAppsFolders + '\n' + ignoredFrontendFolders);
  
  var files = glob.sync(templatesRelPath + doWhere);//, {ignore: [ignoredAppsFolders, ignoredFrontendFolders]});
  console.log('FILES IS: \n' + files);

  function concatJsFromHtml() {
    var tasks = files.map(function(entry) {
      var entryDirName = path.dirname(entry);
      var entryBaseName = path.basename(entry);
      var entryExt = path.extname(entry);
      var entryNewDirName = '';
      var entryNewBaseName = '';
      var entryNewExt = '';

      // если надо - бэкапим изменяемые файлы
      if (options.backup) {
        gulp.src(entry)
          .pipe(chmod(parseInt(options.chmod)))
          .pipe(gulp.dest(entryDirName + '/backup/'));
      }

      var entryPathContents = entry.split(path.sep);
      var entryParentFolder = entryPathContents[entryPathContents.length - 2];

      switch (entryExt) {
        case '.html':
          if (entryParentFolder === 'scripts' && entryBaseName.indexOf('_scripts') !== -1) {
            console.log('got scripts!');
            entryNewDirName = entryPathContents.slice(0,-2).join(path.sep) + '/js';
            entryNewExt = '.js';
          }
      }
      if (!entryNewDirName) {
        entryNewDirName = entryDirName;
      }
      if (!entryNewExt) {
        entryNewExt = entryExt;
      }

      var endOfEntryPath = entryNewDirName.slice(templatesRelPath.length);
      var templatesPath = path.resolve(templatesRelPath, endOfEntryPath);
      var devPath = path.resolve(devRelPath, endOfEntryPath);
      var buildPath = path.resolve(buildRelPath, endOfEntryPath);

      console.log('entry = ' + entry);
      console.log('templatesPath = ' + templatesPath);
      console.log('entry new ending path = ' + endOfEntryPath);
      console.log('entry new dir name = ' + entryNewDirName);
      console.log('entry new ext name = ' + entryNewExt);
      console.log('going to write result to: ' + devPath);
      
      //if (options.production) console.log('going to write minifyed result to: ' + buildPath);
      console.log('*********\n');

      if (options.watch) {
        return gulp.src(entry)
          .pipe(watch(entry))
          .pipe(plumber())
          .pipe(filesCreate({static_url_path: devRelPath}))
          .pipe(rename({suffix: '.concated', extname: entryNewExt}))
          .pipe(gulp.dest(devPath));
      }

      return gulp.src(entry)
        .pipe(filesCreate({static_url_path: devRelPath}))
        .pipe(rename({suffix: '.concated', extname: entryNewExt}))
        .pipe(gulp.dest(devPath));
    });

    console.log('going to merge ' + files.length + ' streams\n');
    return es.merge.apply(null, tasks);
  }
  /*
  if (options.watch) {  // комментируем, если не хотим препроцессить весь банч
    var watcher = gulp.watch(files);
    watcher.on('change', function() { concatJsFromHtml(); });
  } else {*/
    concatJsFromHtml();
  //}
});



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

gulp.task('build:html', function() {
  console.log('No html files to minify and copy');
});




/* final tasks-bulilds */

gulp.task('default', ['js', 'watch']);

gulp.task('watch', [], function() {
  // ... watchers
});

gulp.task('build', function(callback) {
  console.log('Building files...');
  runSequence(
    'build:clean',  // очищаем папку билда
    // сюда можно добавить копирование статики сторонних django аппов
    [ 'sass', 'browserify'],  // выполняем препроцессинг и компиляцию метаязыков
    'concat:from_html',  // склеиваем css и js файлы для представлений
    // здесь можно поставить бьютификацию
    ['build:css', 'build:js', 'build:images', 'build:fonts'],  // минимизируем статику и копируем в Build
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


/*var configurator = function() {
  var extList = [];

  return {
    'extList': this.extList,
    'generateExtNamesList': this.generateExtNamesList,
    'generatePathFromList': this.generatePathFromList,
    'addExtNameToList': this.addExtNameToList,
    'removeExtNameFromList': this.removeExtNameFromList,
    'addExtNameToPath': this.addExtNameToPath,
    'removeExtNameFromPath': this.removeExtNameFromPath,
    'getSubExtTypes': this,getSubExtTypes,
    'isExtInList': this.isExtInList
    }

};*/

/* Функции для работы с расширениями файлов */

// Создаём список extensions файла
function generateExtNamesList(pathstring) {
  var extList = [];

  function saveExtNamesToList(somepathstring, extlist) {
    var lastExt = path.extname(somepathstring);
    extlist.push(lastExt);
    var lastBaseName = path.parse(somepathstring).name;
    if (lastBaseName.indexOf('.') !== -1) {
      saveExtNamesToList(lastBaseName, extlist);
    } else {
      console.log('final extlist is: ' + extlist);
      console.log('clean file name is: ' + lastBaseName);
      extlist.push(lastBaseName);
    }
  }

  saveExtNamesToList(pathstring, extList);
  return extList;
}

// формирует новый путь и имя файла, из старого пути, и списка расширений
function generatePathFromList(pathstring, extlist) {
  console.log('------ generatePathFromList() { ----');
  console.log('pathstring = ' + pathstring);
  var fileName = extlist.pop();
  console.log('fileName = ' + fileName);
  var dirName = path.dirname(pathstring);
  console.log('dirName = ' + dirName);
  var newExtQuery = extlist.reverse().join('');
  console.log('newExtQuery = ' + newExtQuery);
  extlist.reverse();
  var newBaseName = fileName + newExtQuery;
  console.log('newBaseName = ' + newBaseName);
  var newPath = path.join(dirName, newBaseName);
  console.log('newPath = ' + newPath);
  console.log('----------------------------- }');
  return newPath;
}

// формирует новое базовое имя файла, из старого имени, и списка расширений
function generatePathFromBaseName(basename, extlist) {
  console.log('------ generatePathFromBaseName() { ----');
  console.log('basename = ' + basename);
  var fileName = extlist.pop();
  console.log('fileName = ' + fileName);
  var newExtQuery = extlist.reverse().join('');
  console.log('newExtQuery = ' + newExtQuery);
  extlist.reverse();
  var newBaseName = fileName + newExtQuery;
  console.log('!!!!!!!!!!!!!!');
  console.log('newBaseName = ' + newBaseName);
  console.log('!!!!!!!!!!!!!!\n---------- }');
  return newBaseName;
}

function addExtNameToList(extlist, extname) {
  extlist.splice((extlist.length - 1), 0, extname);
  console.log('item added to extlist: ' + extname);
  console.log('extlist become: ' + extlist);
}

function removeExtNameFromList(extlist, extname) {
  extlist.splice(extlist.indexOf(extname), 1);
  console.log('removed item from extlist: ' + extname);
  console.log('extlist become: ' + extlist);
}

function addExtNameToPath(pathstring, extname, extlist) {
  var list = extlist || generateExtNamesList(pathstring);
  console.log('list before adding item = ' + list);
  addExtNameToList(list, extname);
  console.log('list after adding item = ' + list);
  var changedPath = generatePathFromList(pathstring, list);
  return changedPath;
}

function removeExtNameFromPath(pathstring, extname, extlist) {
  var list = extlist || generateExtNamesList(pathstring);
  console.log('list before removing item = ' + list);
  removeExtNameFromList(list, extname);
  console.log('list after removing item = ' + list);
  var changedPath = generatePathFromList(pathstring, list);
  return changedPath;
}

function addExtNameToBaseName(basename, extname, extlist) {
  var list = extlist || generateExtNamesList(basename);
  console.log('list before adding item = ' + list);
  addExtNameToList(list, extname);
  console.log('list after adding item = ' + list);
  var changedBaseName = generatePathFromBaseName(basename, list);
  return changedBaseName;
}

function removeExtNameFromBaseName(basename, extname, extlist) {
  var list = extlist || generateExtNamesList(basename);
  console.log('list before removing item = ' + list);
  removeExtNameFromList(list, extname);
  console.log('list after removing item = ' + list);
  var changedBaseName = generatePathFromBaseName(basename, list);
  return changedBaseName;
}

// Возвращает список проверок, на наличие типов в списке. ??? зачем это нужно ??
function getSubExtTypes(extlist) {
  var subExtTypes = {};
  if (extlist.indexOf('.commonjs')) {
    subExtTypes['commonjs'] = true;
  }
  if (extlist.indexOf('.bundle')) {
    subExtTypes['bundle'] = true;
  }
  if (extlist.indexOf('.concat')) {
    subExtTypes['concat'] = true;
  }
  return subExtTypes;
}

function isExtInList(extlist, extname) {
  if (extlist.indexOf(extname)) {
    return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////