const gulp = require('gulp')
const ts = require('gulp-typescript')
const babel = require('gulp-babel')
const rm = require('gulp-rimraf')

const tsProject = ts.createProject('tsconfig.json')

gulp.task('clean', function(){
  retun gulp.src(['./dist/*', './es6/*']).pipe(rm())
})

gulp.task('compile', ['clean'], function(){
  const tsResult = tsProject.src()
  .pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('es6'))
});

gulp.task('babel', ['compile'], function(){
  return gulp.src('./es6/**/*.js')
  .pipe(babel({presets: ["es2015"]}))
  .pipe(gulp.dest('./dist'))
})

gulp.task('build', ['clean', 'compile', 'babel'])
