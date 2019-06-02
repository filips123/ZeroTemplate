const vueify = require('vueify')

const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const gutil = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')

const sass = require('gulp-sass')
const minify = require('gulp-minify-css')
const concat = require('gulp-concat')

const path = require('path')
const { exec } = require('child_process')

const paths = {
  content: './src/content.json',
  entries: ['src/js/index.js'],
  src: {
    static: ['src/**/*', '!src/css/**/*.css', '!src/sass/**/*.sass', '!src/js/**/*.js', '!src/main.js'],
    styles: ['src/css/**/*.css', 'src/sass/**/*.sass'],
    scripts: ['src/js/**/*.js']
  },
  dist: {
    static: 'dist/',
    styles: 'dist/css/',
    scripts: 'dist/js/'
  }
}

gulp.task('static', function () {
  return gulp.src(paths.src.static)
    .pipe(gulp.dest(paths.dist.static))
})

gulp.task('styles', function () {
  return gulp.src(paths.src.styles)
    .pipe(sourcemaps.init())
    .pipe(sass({
      'includePaths': [
        'node_modules'
      ]
    }).on('error', sass.logError))
    .pipe(minify())
    .pipe(concat('all.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.styles))
})

gulp.task('scripts', function () {
  return browserify({
    basedir: '.',
    debug: true,
    entries: paths.entries,
    cache: {},
    packageCache: {},
    insertGlobals: true
  })
    .transform(vueify)
    .bundle()
    .pipe(source('all.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.scripts))
})

gulp.task('build', gulp.parallel('scripts', 'styles', 'static'))

gulp.task('watch', function () {
  gulp.watch(paths.src.scripts, gulp.series('scripts'))
  gulp.watch(paths.src.styles, gulp.series('styles'))
  gulp.watch(paths.src.static, gulp.series('static'))
})

gulp.task('deploy', gulp.series('build', function (done) {
  let silent = gutil.env.silent
  let zeronet = gutil.env.zeronet
  let privkey = gutil.env.privkey ? gutil.env.privkey : ''

  if (!zeronet) {
    throw new gutil.PluginError({
      plugin: 'deploy',
      message: 'Empty path for ZeroNet installation'
    })
  }

  let content = require(paths.content)
  let address = content.address

  let from = [ path.join(paths.dist.static, '**/*') ]
  let to = path.join(zeronet, 'data', address)

  gutil.log('Downloading site')

  let download = exec('python zeronet.py siteDownload ' + address, { cwd: zeronet })
  if (!silent) {
    download.stdout.pipe(process.stdout)
    download.stderr.pipe(process.stderr)
  }

  download.stderr.on('data', function (data) {
    if (data.indexOf('Error') >= 0) {
      throw new gutil.PluginError({
        plugin: 'deploy',
        message: 'Error while downloading'
      })
    }
  })

  download.on('exit', function (code, signal) {
    gutil.log('Downloading done')

    gulp.src(from)
      .pipe(gulp.dest(to))

    gutil.log('Signing site')

    let sign = exec('python zeronet.py siteSign ' + address + ' ' + privkey, { cwd: zeronet })
    if (!silent) {
      sign.stdout.pipe(process.stdout)
      sign.stderr.pipe(process.stderr)
    }

    sign.stderr.on('data', function (data) {
      if (data.indexOf('SignError') >= 0) {
        throw new gutil.PluginError({
          plugin: 'deploy',
          message: 'Private key invalid'
        })
      }
      if (data.indexOf('Error') >= 0) {
        throw new gutil.PluginError({
          plugin: 'deploy',
          message: 'Error while signing'
        })
      }
    })

    sign.on('exit', function (code, signal) {
      gutil.log('Signing done')

      gutil.log('Publishing site')

      let publish = exec('python zeronet.py sitePublish ' + address, { cwd: zeronet })
      if (!silent) {
        publish.stdout.pipe(process.stdout)
        publish.stderr.pipe(process.stderr)
      }

      publish.stderr.on('data', function (data) {
        if (data.indexOf('Error') >= 0) {
          throw new gutil.PluginError({
            plugin: 'deploy',
            message: 'Error while publishing'
          })
        }
      })

      publish.on('exit', function (code, signal) {
        gutil.log('Publishing done')
        done()
      })
    })
  })
}))

gulp.task('default', gulp.series('build'))
