
let poject_folder = require("path").basename('calendar'); 
let source_folder = "app";

let fs = require('fs'); // if need to connect fonts

let path = {
  build: {
    html: poject_folder + "/",
    css: poject_folder + "/css/",
    js: poject_folder + "/js/",
    img: poject_folder + "/img/",
    fonts: poject_folder + "/fonts/",
    vendorCss: poject_folder + "/css/",
    vendorJs: poject_folder + "/js/"
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/**/**.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
    vendorCss: source_folder + "/css/**.css",
    vendorJs:source_folder + "/vendorJS/**.js",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    vendorCss: source_folder + "/css/**.css",
    vendorJs: source_folder + "/vendorJS/**.js",
  },
  clean: "./" + poject_folder + "/"
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify-es').default,
    // babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webpHTML = require('gulp-webp-html'),
    // webpcss = require("gulp-webpcss");
    webpCss = require('gulp-webp-css'),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');

function browserSync(params) {
  browsersync.init({
    server: {
        baseDir: "./" + poject_folder + "/"
    }, 
    port: 3000,
    notify: false
  });
}

function vendorStyle() {
  return src(path.src.vendorCss)
    
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}
function vendorScript() {
  return src(path.src.vendorJs)
    
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webpHTML())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css(){
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(webpCss())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    // .pipe(babel())
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 75
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{
              removeViewBox: true
        }],
        interlaced: true,
        optimizationLevel: 5 // 0-7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

// make sprite
// gulp svgSprite
gulp.task('svgSprite', function(){
  return gulp.src([source_folder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
      mode:{
        stack:{
          sprite: "../icons/icons.svg", // sprite file name
          example: true // made example to use
        }
      }
    }))
    .pipe(dest(path.build.img))
})

function fonts(){
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

// for fonts with ext .otf, using gulp-fonter to convert to ext .ttf , will put in app/fonts (!!!)
//  gulp otf2ttf
gulp.task('otf2ttf', function(){
  return gulp.src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(source_folder + '/fonts/'))
})

// pre-create fonts.scss in /scss folder and connect to main style.scss
function fontsStyle( ){
  let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function cb( ){}

function watchFiles( ){
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
  gulp.watch([path.watch.vendorCss], vendorStyle);
  gulp.watch([path.watch.vendorJs], vendorScript);
}

function clean () {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css,images, html, fonts, vendorStyle, vendorScript), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.vendorScript = vendorScript;
exports.vendorStyle = vendorStyle;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;