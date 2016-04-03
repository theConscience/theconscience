'use strict';

/*
 * Менеджер подключений
 */

// packages imports, все их сначала надо установить через:  npm install packagename --save-dev
var gulp = require('gulp'),  // импортирую галп
  path = require('path'),  // импортирую пакет для работы с путями файлов:  https://nodejs.org/docs/latest/api/path.html
  glob = require('glob'),  // импортирую пакет для обращения к файлам в операционной системе через регулярки:  https://www.npmjs.com/package/glob
  rename = require('gulp-rename'), // импортирую пакет для переименования:  https://www.npmjs.com/package/gulp-rename
  es = require('event-stream'),  // импортирую пакет для работы с потоками:  node.js https://www.npmjs.com/package/event-stream
  cssnano = require('gulp-cssnano'),  // минимизатор css:  https://www.npmjs.com/package/cssnano  http://cssnano.co/usage/
  uglify = require('gulp-uglify'),  // минимизатор js:  https://www.npmjs.com/package/gulp-uglify
  htmlmin = require('gulp-htmlmin'),  // минимизатор html:  https://www.npmjs.com/package/gulp-htmlmin  https://github.com/kangax/html-minifier  почитать про ignoreCustomFragments
  //htmlminifyer =require('gulp-html-minifier '),  // другой минимизатор html   тесты регулярок: http://scriptular.com/
  imagemin = require('gulp-imagemin'),  // минимизатор картинок: https://github.com/sindresorhus/gulp-imagemin  https://github.com/imagemin/imagemin
  //pngquant = require('imagemin-pngquant'),  // минимизатор png, работает как плагин для imagemin
  minimist = require('minimist'),  // импортирую пакет для вытаскивания значений флагов из введённой в консоли команды:  http://ricostacruz.com/cheatsheets/minimist.html  https://www.npmjs.com/package/minimist
  filter = require('gulp-filter'),  // импортирую пакет, который позволяет фильтровать файлы в потоке через регулярки:  https://www.npmjs.com/package/gulp-filter
  lazypipe = require('lazypipe'),  // импортирую пакет для создания независимых пайплайнов задач, в которые можно в любой момент переходить из основного:  https://www.npmjs.com/package/lazypipe
  chmod = require('gulp-chmod'),  // импортирую выставлялку прав на файлы:  https://www.npmjs.com/package/gulp-chmod
  gPrint = require('gulp-print'),  // импортирую вывод сообщений внутри gulp.pipe():  https://www.npmjs.com/package/gulp-print
  del = require('del'),  // импортирую пакет для удаления файлов:  https://www.npmjs.com/package/del
  gitStatus = require('gulp-git-status'),  // импортирую пакет для работы с гит-статусами файлов:  https://www.npmjs.com/package/gulp-git-status
  gulpIf = require('gulp-if'),  // условный оператор для использования внутри gulp.pipe():  https://www.npmjs.com/package/gulp-if
  changed = require('gulp-changed');  // пакет для сравнения файлов поимённо в двух различных расположениях, позволяющий отсеивать внутри .pipe() только различающиеся

/*
 * Настройки
 */

// CLI options | опции(флаги) шелла
// создаём объект, в котором описываем все наши опции-флаги, чтобы потом скормить его minimist'у (это взято из мануала minimist)
var knownOptions = {
  // закомментированные - пока не используются!
  string: [  // строковые консольные флаги
    'cli_folder',  // для указания папки, к которой применить команду  --cli_folder=somefolder/subfolder/
    'cli_file',  // для указания файла, к которому применить команду  --cli_file=somefile.ext
    'cli_path',  // для указания полного пути к файлу, к которому применить команду  --cli_path='./somefolder/subfolder/somefile.ext'
    'chmod'  // для указания прав на создаваемые файлы
  ],
  boolean: [  // булевы консольные флаги
    //'production',  // флаг для определения дев или продакшен, не знаю, может пригодиться...   --production / --no-production
    'excludes',  // флаг для обработки папок, которые в обычном режиме добавлены в исключения
    //'watch',  // флаг для установки watchera на таски  --watch / --no-watch
    //'backup',  // флаг для бэкапа  --backup / --no-backup
    //'compress',  // флаг для компрессии  --compress / --no-compress
    //'beautify',  // флаг для созданий файла с красивым кодом  --beautify / --no-beautify
    'git_modified_untracked',  // флаг для отслеживания файлов, у которых в Git репозитории статус 'modified'
    'git_modified_unchanged',
    'git_untracked_unchanged',
    'git_modified',  // флаг для отслеживания файлов, у которых в Git репозитории статус 'modified' или 'untracked' 
    'git_untracked',
    'git_unchanged',
    'is_changed'  // флаг для фильтрации поток, чтобы оставлять только файлы, которые различаются (различие проверяется через gulp-changed)
  ],
  alias: {  // алиасы, т.е. укороченные имена для флагов
    //'prod': 'production',
    'dir': 'cli_folder',
    'f': 'cli_file',
    'p': 'cli_path',
    'exc': 'excludes',
    'chm': 'chmod',
    //'w': 'watch',
    //'bu': 'backup',
    //'min': 'compress',
    //'btf': 'beautify',
    'gimut': 'git_modified_untracked',
    'gimuc': 'git_modified_unchanged',
    'giutuc': 'git_untracked_unchanged',
    'gim': 'git_modified',
    'giut': 'git_untracked',
    'giuc': 'git_unchanged',
    'isch': 'is_changed'
  },
  default: {  // дефолтные значения флагов
    //'production': false,
    'excludes': true,
    //'watch': false,
    //'backup': false,
    'chmod': 755,
    //'compress': false,
    //'beautify': false,
    'git_modified_untracked': false,
    'git_modified_unchanged': false,
    'git_untracked_unchanged': false,
    'git_modified': false,
    'git_untracked': false,
    'git_unchanged': false,
    'is_changed': false
  }
};

var options = minimist(process.argv.slice(2), knownOptions);  // записываем все наши опции в переменную

// Теперь можем к ним обращаться через options.optioname:
console.log('\nACTIVE OPTIONS');
//console.log('options.production = ' + options.prod);
console.log('options.cli_folder = ' + options.dir);
console.log('options.cli_file = ' + options.f);
console.log('options.cli_path = ' + options.p);
console.log('options.excludes = ' + options.exc);
//console.log('options.watch = ' + options.w);
//console.log('options.backup = ' + options.bu);
console.log('options.chmod = ' + options.chmod);
//console.log('options.compress = ' + options.min);
//console.log('options.beautify = ' + options.btf);
console.log('options.git_modified_untracked = ' + options.gimut);
console.log('options.git_modified_unchanged = ' + options.gimuc);
console.log('options.git_untracked_unchanged = ' + options.giutuc);
console.log('options.git_modified = ' + options.gim);
console.log('options.git_untracked = ' + options.giut);
console.log('options.git_unchanged = ' + options.giuc);
console.log('options.is_changed = ' + options.isch);
console.log('-------------------------------');

// Глобальные переменные путей
var thisPath = path.resolve(),  // возвращает строку с абсолютным путём к текущей папке, где лежит этот файл
  templatesPath = './theconscience/templates/',  // относительный путь к вашей папке темплейтов
  templatesDevRelPath = './theconscience/templates/source/',  // относительный путь к вашей папке темплейтов
  templatesBuildRelPath = './theconscience/templates/build/',  // относительный путь к вашей папке темплейтов для продакшена
  staticPath = './theconscience/static/',  // относительный путь к вашей папке статики
  devRelPath = './theconscience/static/source/',  // относительный путь к вашей папке статики для разработки
  buildRelPath = './theconscience/static/build/';  // относительный путь к вашей папке статики для продакшена

/* Учтём возможность необходимости исключать какие-либо папки из процесса */
// выбираем папки сторонних django-аппов,
var patternDjangoApps = '+(admin|rest_framework|appname3|appname4)';
var patternDjangoAppsFolders = '';
var patternDjangoAppsFiles = '';
if (options.excludes) {  // при желании их обработку можно будет отключить через флаг --no-exc в командной строке
  // в данном случае предполагается что аппы лежат в ./static/dev/_здесь_  - меняйте под свой проект.
  patternDjangoAppsFolders = devRelPath + patternDjangoApps;
  patternDjangoAppsFiles = devRelPath + patternDjangoApps + '/**/*';
}
// выбираем остальные расположения, которые будем исключать, и файлы в них 
var patternExcluded = '+(node_modules|bower_components|backup)';
var patternExcludedFolders = devRelPath + '**/*' + patternExcluded;
var patternExcludedFiles = patternExcludedFolders + '/**/*';  // другие папки, которые всегда нужно игнорировать на любых уровнях


/*
 * Gulp - таски 
 */

// Таск для минификации css, js, копирование в папку продакшена; c ключами
// --git-modified [--gim] или --git-modified-new [--gimu] будет обрабатывать только файлы c 
// соответствующим git status'ом и не трогать остальные
gulp.task('build:css_js', function() {
  // для начала опишем различные поисковые паттерны через регулярки:
  var patternFolder = '**/';  // ищем во всех вложенных папках
  var patternTempExcludes = '!(*\.commonjs|*\.browserify|*\.bundle|*\.concated)';  // временный паттерн для тестов на моём сервере.

  var patternFileCss = '*.css';  // ищем любые CSS файлы
  var patternFileJs = '*.js';  // ищем любые JS файлы
  var patternFileCssJs = patternTempExcludes + '.*(js|css)';  // ищем любые CSS или JS  файлы

  var patternFileCssNotMin = '!(*\.min).css';  // ищем любые неминифицированные CSS файлы
  var patternFileCssOnlyMin = '*.min.css'; // ищем только минифицированные CSS файлы
  var patternFileJsNotMin = '!(*\.min).js';  // ищем любые неминифицированные JS файлы
  var patternFileJsOnlyMin = '*.min.js'; // ищем только минифицированные JS файлы
  var patternFileCssJsNotMin = '!(*\.min).*(js|css)';  // любые CSS и JS без суффикса .min
  var patternFileCssJsOnlyMin = '*.min.*(css|js)';  // только .min.css или .min.js
  
  var patternCss = devRelPath + patternFolder + patternFileCss;  // выбираю все css-ники во всех папках внутри /static/dev/ (папка для разработки)
  var patternJs = devRelPath + patternFolder + patternFileJs;  // выбираю все js-ники во всех папках внутри /static/dev/
  var patternCssJs = devRelPath + patternFolder + patternFileCssJs;  // выбираю все css и js файлы внутри /static/dev/
  //var patternCssJsNotMin = devRelPath + patternFolder + patternFileCssJsNotMin;  // а вот так можно все css и js, если они без .min
  //var patternCssJsOnlyMin = devRelPath + patternFolder + patternFileCssJsOnlyMin;  // только .min.css и .min.js

  var patternDefault = patternCssJs;  // дефолтный паттерн, допустим тут дефолтным будет тот, который любые CSS или JS файлы выбирает
  var patternFinal = patternDefault;  // финальный паттерн, по которому будем искать файлы через Glob

  // тут добавляю учёт консольных флагов при отборе файлов:
  if (options.cli_path) {  // если передан полный путь то он полностью перебивает паттерн который у нас в этом таске
    patternFinal = devRelPath + options.cli_path;
  } else if (options.cli_folder && options.cli_file) {  // если передан отдельно путь к папке и отдельно файл
    patternFinal = devRelPath + options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {  // если передан только путь к папке 
    patternFinal = devRelPath + options.cli_folder + patternFileCssJs;  // тогда путь к файлу берём дефолтный, в данном случае - для css и js
  } else if (options.cli_file) {  // если передан только путь к файлу 
    patternFinal = devRelPath + patternFolder + options.cli_file;  // тогда путь к папке берём дефолтный
  }  // ну вот, вроде бы всё учли... 

  console.log('final pattern: ' + patternFinal);

  // получаю в переменную массив строк, каждая строка - путь к одному css или js файлу
  var files = glob.sync(patternFinal, {ignore: [patternDjangoAppsFiles, patternExcludedFiles]});  // вторым аргументом передаём массив строк с паттернами игнорируемых файлов
  console.log('Получившаяся выборка файлов:');
  for (var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }

  // записываю в переменную tasks результат выполнения метода .map (новый массив)
  var tasks = files.map(function(file) {  // этот метод Array.map пробегается по массиву files и к каждому элементу file применит функцию, в которой мы находимся:
    // формируем необходимые переменные
    var fileDirName = path.dirname(file);  // получаем строку, содержащую путь к папке конкретного файла (file)
    console.log('fileDirName ' + fileDirName);
    var fileBaseName = path.basename(file);  // получаем строку, содержащую только название файла
    var fileExtName = path.extname(file);  // получаем строку, содержащую расширение файла (в данном случае будет '.css')

    var endOfFilePath = fileDirName.slice(devRelPath.length);  // отрезаем от строки с путём к папке вот эту часть: './project/static/dev/'
    console.log('endOfFilePath ' + endOfFilePath);
    // таким образом у нас к примеру для папки './project/static/dev/hotels/css/' получится строка 'hotels/css/'

    // генерим абсолютный путь к этой папке в расположении для разработки (если нам это нужно)
    var devAbsPath = path.resolve(devRelPath, endOfFilePath);
    console.log('devAbsPath ' + devAbsPath);
    // генерим абсолютный путь к папке, в которой файл должен оказаться в продакшене
    var buildAbsPath = path.resolve(buildRelPath, endOfFilePath);
    console.log('buildAbsPath ' + buildAbsPath);
    // для того же примера: './project/static/build/' соединим с 'hotels/css/' и получим './project/static/build/hotels/css/'
    // Таким образом мы получили путь куда мы этот file будем перекладывать через gulp.dest()

    // Поскольку в files теперь попадают два разных типа файлов, да ещё могут быть уже минимизированные файлы каждого типа,
    // то для этих случаев нам нужно выполнить разную последовательность задач - для этого будем использовать lazipipe и gulp-filter 
    //

    // Пишем 3 фильтра - для неминифицированного CSS, неминифицированного JS и общий, для минифицированных CSS и JS,
    // второй аргумент фильтра означает, что он запоминает состояние потока до того как был применён,
    // и мы можем в любой момент его восстановить к этому состоянию.
    var nonMinifiedCssFilter = filter(patternFolder + patternFileCssNotMin, {restore: true});  // фильтр для не минифицированных CSS
    var nonMinifiedJsFilter = filter(patternFolder + patternFileJsNotMin, {restore: true});  // фильтр для не минифицированных JS
    var minifiedCssJsFilter = filter(patternFolder + patternFileCssJsOnlyMin, {restore: true});  // фильтр для минифицированных CSS и JS файлов

    // Пишем два независимых канала lazypipe, будем переходить в них из основного канала gulp.pipe(),
    // а по окончании, будем в него снова возвращаться. 
    // ВАЖНО: у lazypipe.pipe() чуть другой синтаксис, в отличии от gulp.pipe() 
    // он принимает первым аргументом функцию для выполнения, а вторым - аргумент этой функции

    // канал для минификации JS файлов
    var minifyJsChannel = lazypipe()
      .pipe(gPrint, function(filepath) { return 'going to minify JS file ' + filepath + ' rename, and copy to build dir.'; }) // принтим месседж
      .pipe(uglify)
      .pipe(rename, {suffix: '.min'})  // добавляем суффикс .min перед .js
      .pipe(chmod, parseInt(options.chmod))  // выставляем права на файлики
      .pipe(gulp.dest, devAbsPath);  // последние два .pipe - по желанию, если хотим сохранять минифицированные копии в дев-расположении

    // канал для минификации CSS файлов
    var minifyCssChannel = lazypipe()
      .pipe(gPrint, function(filepath) { return 'going to minify CSS file ' + filepath + ' rename, and copy to build dir.'; }) // принтим месседж
      .pipe(cssnano)
      .pipe(rename, {suffix: '.min'})  // добавляем суффикс .min перед .css
      .pipe(chmod, parseInt(options.chmod))  // выставляем права на файлики
      .pipe(gulp.dest, devAbsPath);  // последние два .pipe - по желанию, если хотим сохранять минифицированные копии в дев-расположении

    /*
    // канал для сравнения минифицированных файлов с одноимёнными файлами в папке продакшена, чтобы не копировать неизменные
    var checkChangesChannel = lazypipe()
      .pipe(gPrint, function() { return 'Check if it is changed...'; })
      .pipe(changed, buildAbsPath, {hasChanged: changed.compareSha1Digest})  // сравниваем файл с одноимённым файлом в папке buildAbsPath, если одинаковые, то выбрасываем из потока.
      .pipe(gPrint, function(filepath) { return 'File is changed: ' + filepath; });
    */

    // пока сюда попадают и обычные и минифицированные .css и .js файлы
    return gulp.src(file)  // пользуемся галпом как обычно, только у каждого файла будет свой gulp.dest
      .pipe(gulpIf(options.git_modified_untracked,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified'
        gitStatus({excludeStatus: 'unchanged'})  // true: исключаю неизменные файлы   ????
      ))
      .pipe(gulpIf(options.git_modified_unchanged,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified'
        gitStatus({excludeStatus: 'untracked'})  // true: исключаю неизменные файлы   ????
      ))
      .pipe(gulpIf(options.git_untracked_unchanged,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified'
        gitStatus({excludeStatus: 'modified'})  // true: исключаю неизменные файлы   ????
      ))
      .pipe(gulpIf(options.git_modified,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified' и 'untracked'
        gitStatus({excludeStatus: ['unchanged', 'untracked']})  // true: исключаю только неизменные файлы, новые и изменённые оставляю
      ))
      .pipe(gulpIf(options.git_untracked,
        gitStatus({excludeStatus: ['unchanged', 'modified']})
      ))
      .pipe(gulpIf(options.git_unchanged,
        gitStatus({excludeStatus: ['untracked', 'modified']})
      ))
      .pipe(nonMinifiedCssFilter)  // отфильтровываем только неминифицированный CSS
      .pipe(minifyCssChannel())  // переходим в канал для минификации CSS
      .pipe(nonMinifiedCssFilter.restore)  // по возвращении сбрасываем фильтр
      .pipe(nonMinifiedJsFilter)  // отфильтровываем только неминифицированный JS
      .pipe(minifyJsChannel())  // переходим в канал для минификации Js
      .pipe(nonMinifiedJsFilter.restore)  // по возвращении сбрасываем фильтр
      .pipe(minifiedCssJsFilter)  // отфильтровываем только минифицированные файлы
      .pipe(gPrint(function(filepath) { return 'Got minified file: ' + filepath + '  Copying to build dir...'; }))
      //.pipe(gulpIf(options.is_changed, checkChangesChannel()))  // если передан флаг --is-changed то переходим в канал проверки на изменение по файлам
      //.pipe(gPrint(function() { return 'Copying file to build dir...'; }))
      .pipe(gulp.dest(buildAbsPath));  // копируем все минифицированные файлы в продакшен
  });

  // объединяю все таски в единый поток(stream), это некая абстракция в node.js,
  // некий такой тип объекта, который метод gulp.task должен возвращать
  return es.merge.apply(null, tasks);  
});


// Таск для минификации html и копирования его в папку продакшена
gulp.task('build:html', function() {
  // поисковые паттерны (через регулярки):
  var patternFolder = '**/';  // ищем во всех вложенных папках

  var patternFileHtml = '*.html';  // ищем любые HTML файлы

  var patternFileHtmlNotMin = '!(*\.min).html';  // ищем любые неминифицированные HTML файлы
  var patternFileHtmlOnlyMin = '*.min.html'; // ищем только минифицированные HTML файлы
  
  var patternHtml = templatesDevRelPath + patternFolder + patternFileHtml;  // выбираю все html во всех папках внутри /static/dev/ (папка для разработки)
  //var patternHtmlNotMin = templatesDevRelPath + patternFolder + patternFileHtmlNotMin;  // все html, если они без .min
  //var patternHtmlOnlyMin = templatesDevRelPath + patternFolder + patternFileHtmlOnlyMin;  // только .min.html

  var patternDefault = patternHtml;  // дефолтный паттерн
  var patternFinal = patternDefault;  // финальный паттерн, по которому будем искать файлы через Glob

  // тут добавляю учёт консольных флагов при отборе файлов:
  if (options.cli_path) {
    patternFinal = templatesDevRelPath + options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    patternFinal = templatesDevRelPath + options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    patternFinal = templatesDevRelPath + options.cli_folder + patternFileHtml;
  } else if (options.cli_file) {
    patternFinal = templatesDevRelPath + patternFolder + options.cli_file;
  }

  console.log('final pattern: ' + patternFinal);

  var files = glob.sync(patternFinal, {ignore: [patternDjangoAppsFiles, patternExcludedFiles]});
  console.log('Получившаяся выборка файлов:');
  for (var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }

  var tasks = files.map(function(file) {
    var fileDirName = path.dirname(file);  // получаем строку, содержащую путь к папке конкретного файла (file)
    console.log('fileDirName', fileDirName);
    var fileBaseName = path.basename(file);  // получаем строку, содержащую только название файла
    var fileExtName = path.extname(file);  // получаем строку, содержащую расширение файла (в данном случае будет '.css')

    var endOfFilePath = fileDirName.slice(templatesDevRelPath.length);  // отрезаем от строки с путём к папке вот эту часть: './project/static/dev/'
    console.log('endOfFilePath', endOfFilePath);
    var templatesDevAbsPath = path.resolve(templatesDevRelPath, endOfFilePath);
    console.log('templatesDevAbsPath', templatesDevAbsPath);
    var templatesBuildAbsPath = path.resolve(templatesBuildRelPath, endOfFilePath);  
    console.log('templatesBuildAbsPath', templatesBuildAbsPath);

    var nonMinifiedHtmlFilter = filter(patternFolder + patternFileHtmlNotMin, {restore: true});  // фильтр для не минифицированных HTML
    var minifiedHtmlFilter = filter(patternFolder + patternFileHtmlOnlyMin, {restore: true});  // фильтр для минифицированных HTML файлов

    // канал для минификации HTML файлов
    var minifyHtmlChannel = lazypipe()
      .pipe(gPrint, function(filepath) { return 'going to minify HTML file ' + filepath + ' rename, and copy to build dir.'; }) // принтим месседж
      .pipe(htmlmin, {ignoreCustomFragments: [/{{\s*[\w\.]+\s*}}/g, /{%\s*.*?\s*%}/g, /{#\s*.*?\s*#}/g]});  // минифицирую html
      //.pipe(rename, {suffix: '.min'});  // добавляем суффикс .min перед .html

    // пока сюда попадают и обычные и минифицированные .html файлы
    return gulp.src(file)
      .pipe(gPrint(function(filepath) { return '1 html file is ' + filepath; }))
      // .pipe(gulpIf(options.git_modified_untracked,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified'
      //   gitStatus({excludeStatus: 'unchanged'}),  // true: исключаю неизменные файлы
      //   gitStatus({excludeStatus: 'untracked'})  // false: исключаю новые файлы, которым ещё не сделали git add
      // ))
      // .pipe(gPrint(function(filepath) { return '2 html file is ' + filepath; }))
      // .pipe(gulpIf(options.git_modified,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified' и 'untracked'
      //   gitStatus({excludeStatus: 'unchanged'})  // true: исключаю только неизменные файлы, новые и изменённые оставляю
      // ))
      .pipe(gPrint(function(filepath) { return '3 html file is ' + filepath; })) 
      .pipe(nonMinifiedHtmlFilter)  // отфильтровываем только неминифицированный HTML
      .pipe(minifyHtmlChannel())  // переходим в канал для минификации HTML
      .pipe(nonMinifiedHtmlFilter.restore)  // по возвращении сбрасываем фильтр
      .pipe(gPrint(function(filepath) { return '4 html or min html file' + filepath; }))
      //.pipe(minifiedHtmlFilter)  // отфильтровываем только минифицированные файлы
      .pipe(gulp.dest(templatesBuildAbsPath));  // копируем все минифицированные файлы в продакшен
  });

  return es.merge.apply(null, tasks);  
});


// Таск для минификации картинок и копирования в папку продакшена
gulp.task('build:images', function() {
  // поисковые паттерны (через регулярки):
  var patternFolder = '**/';  // ищем во всех вложенных папках

  var patternFileImage = '*.+(png|jpg|jpeg|gif|svg)';  // ищем любые картинки
  
  var patternImage = devRelPath + patternFolder + patternFileImage;  // выбираю все картинки во всех папках внутри /static/dev/ (папка для разработки)

  var patternFinal = patternImage;  // финальный паттерн, по которому будем искать файлы через Glob

  // тут добавляю учёт консольных флагов при отборе файлов:
  if (options.cli_path) {
    patternFinal = devRelPath + options.cli_path;
  } else if (options.cli_folder && options.cli_file) {
    patternFinal = devRelPath + options.cli_folder + options.cli_file;
  } else if (options.cli_folder) {
    patternFinal = devRelPath + options.cli_folder + patternFileImage;
  } else if (options.cli_file) {
    patternFinal = devRelPath + patternFolder + options.cli_file;
  }

  console.log('final pattern: ' + patternFinal);

  var files = glob.sync(patternFinal, {ignore: [patternDjangoAppsFiles, patternExcludedFiles]});
  console.log('Получившаяся выборка файлов:');
  for (var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }

  var tasks = files.map(function(file) {
    var fileDirName = path.dirname(file);  // получаем строку, содержащую путь к папке конкретного файла (file)
    console.log('fileDirName', fileDirName);
    var fileBaseName = path.basename(file);  // получаем строку, содержащую только название файла
    var fileExtName = path.extname(file);  // получаем строку, содержащую расширение файла (в данном случае будет '.css')

    var endOfFilePath = fileDirName.slice(devRelPath.length);  // отрезаем от строки с путём к папке вот эту часть: './project/static/dev/'
    console.log('endOfFilePath', endOfFilePath);
    var devAbsPath = path.resolve(devRelPath, endOfFilePath);
    console.log('devAbsPath', devAbsPath);
    var buildAbsPath = path.resolve(buildRelPath, endOfFilePath);  
    console.log('buildAbsPath', buildAbsPath);

    return gulp.src(file)
      .pipe(gPrint(function(filepath) { return 'Image file found: ' + filepath; }))
      .pipe(gulpIf(options.git_modified_untracked,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified'
        gitStatus({excludeStatus: 'untracked'})  // true: исключаю неизменные файлы
      ))
      .pipe(gPrint(function(filepath) { return '2 html file is ' + filepath; }))
      .pipe(gulpIf(options.git_modified,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified' и 'untracked'
        gitStatus({excludeStatus: 'unchanged'})  // true: исключаю только неизменные файлы, новые и изменённые оставляю
      ))
      .pipe(gPrint(function(filepath) { return '3 html file is ' + filepath; }))
      .pipe(gulpIf(options.git_untracked,  // если из консоли передана переменная для слежения за файлами с Git status = 'modified' и 'untracked'
        gitStatus({excludeStatus: 'modified'})  // true: исключаю только неизменные файлы, новые и изменённые оставляю
      ))
      .pipe(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [
            {removeViewBox: false},
            {cleanupIDs: false}
        ]
        //use: [pngquant({quality: '65-80'})]
      }))
      .pipe(gPrint(function(filepath) { return 'Image ' + filepath + ' is minified and copying to prod...'; })) 
      .pipe(gulp.dest(buildAbsPath));  // копируем все минифицированные файлы в продакшен
  });

  return es.merge.apply(null, tasks);  
});


// Таск для зачистки папки продакшена
gulp.task('build:clean', function() {
  // переопределяем значения паттернов для продакшена, эти переменные нужны, чтобы не зачищать там каждый раз папки наших джанго аппов
  if (options.excludes) {  // данная команда с ключём --no-excludes[--no-exc] зачистит также и папки сторонних django-приложений
    patternDjangoAppsFolders = buildRelPath + patternDjangoApps;
    patternDjangoAppsFiles = patternDjangoAppsFolders + '**/*';
  }
  // из-за особенности работы del.sync() в отличии от glob.sync() приходится указывать в игнорах не только файлы, но и папки в которых они лежат
  return del.sync(buildRelPath + '**/*', { ignore: [patternDjangoAppsFolders, patternDjangoAppsFiles]} );  // чистим статику продакшена кроме папок джанго-аппов 
});


// Таск для копирования сторонних джанго-аппов в продакшн
gulp.task('build:django_apps', function() {
  return gulp.src(patternDjangoAppsFiles)
    .pipe(gulp.dest(buildRelPath));
});


gulp.task('default', ['build:css_js']);  // дефолтный таск, запускается командой:  $ gulp