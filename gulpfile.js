const { src, dest, watch, series, parallel } = require('gulp')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const fileInclude = require('gulp-file-include')
const terser = require('gulp-terser')
const concat = require('gulp-concat')
const imagemin = require('gulp-imagemin')
const avif  = require('gulp-avif')
const webp  = require('gulp-webp')
const newer = require('gulp-newer')
const ttf2woff2 = require('gulp-ttf2woff2')
const fonter = require('gulp-fonter-2')
const clean = require('gulp-clean')
const ghPages = require('gulp-gh-pages')

const SRC_ASSETS = './src/assets/'
const DIST_ASSETS = './docs/assets/'

function serve(){
  browserSync.init({
    server: {
      baseDir: './docs/'
    }
  })
  
  watch(SRC_ASSETS+'scss/**/*.scss', buildStyles)
  watch(SRC_ASSETS+'js/*.js', buildScripts)
  watch(SRC_ASSETS+'js/pages/*.js', buildPageScripts)
  watch(SRC_ASSETS+'images/*', modernImages)
  watch('./src/**/*.html', buildHTML)
}

function buildStyles() {
  return src(SRC_ASSETS+'scss/**/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer({
      grid:true,
      flex:true,
      overrideBrowserslist:["last 5 versions"],
      cascade: true
    }))
    .pipe(dest(DIST_ASSETS+'css/'))
    .pipe(browserSync.stream())
}

function buildHTML(){
  return src('src/*.html')
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest('docs'))
    .pipe(browserSync.stream())
}

function buildScripts(){
  return src(SRC_ASSETS+'js/*.js')
    .pipe(concat('all.js'))
    .pipe(terser())
    .pipe(rename('all.min.js'))
    .pipe(dest(DIST_ASSETS+'js/'))
    .pipe(browserSync.stream())
}

function buildPageScripts(){
  return src(SRC_ASSETS+'js/pages/*.js')
    .pipe(terser())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(DIST_ASSETS+'js/'))
    .pipe(browserSync.stream())
}

function modernImages(){
  return src([SRC_ASSETS+'images/*.*', '!'+SRC_ASSETS+'images/*.svg'])
    .pipe(newer(DIST_ASSETS+'images/'))
    .pipe(avif({ quality: 50 }))
    .pipe(src([SRC_ASSETS+'images/*.*', '!'+SRC_ASSETS+'images/*.svg']))
    .pipe(newer(DIST_ASSETS+'images/'))
    .pipe(webp())
    .pipe(src(SRC_ASSETS+'images/*.*'))
    .pipe(newer(DIST_ASSETS+'images/'))
    .pipe(imagemin())
    .pipe(dest(DIST_ASSETS+'images/'))
}

function convertFonts(){
  return src(SRC_ASSETS+'fonts/**/*.*')
    .pipe(fonter({ formats: ['woff', 'ttf'] }))
    .pipe(src(SRC_ASSETS+'fonts/**/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest(DIST_ASSETS+'fonts/'))
}

function cleanDist(){
  return src('./docs/*')
    .pipe(clean({force: true}))
}

function moveFavicon(){
  return src('./src/favicon/*')
    .pipe(dest('./docs/favicon/'))
}

function movePlugins(){
  return src(SRC_ASSETS+'plugins/**/*')
    .pipe(dest(DIST_ASSETS+'plugins/'))
}

/*
https://medium.com/superhighfives/deploying-to-github-pages-with-gulp-c06efc527de8
Deploy is available only after build
*/
function deploy(){
  return src('./docs/**/*')
    .pipe(ghPages());
}

const move = parallel(moveFavicon, movePlugins)

const build = series(cleanDist, parallel(buildHTML, buildStyles, buildScripts, buildPageScripts, modernImages, convertFonts, move))

exports.serve = serve
exports.buildStyles = buildStyles
exports.buildHTML = buildHTML
exports.buildScripts = buildScripts
exports.buildPageScripts = buildPageScripts
exports.modernImages = modernImages
exports.convertFonts = convertFonts
exports.cleanDist = cleanDist
exports.move = move
exports.build = build
exports.deploy = deploy

exports.dev = series(build, serve)