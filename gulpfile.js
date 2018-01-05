const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel')

const tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
  const tsResult = tsProject.src()
  .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('es6'));
});

gulp.task('babel', function(){
  return gulp.src('./es6/**/*.js')
  .pipe(babel({presets: ["es2015"]}))
  .pipe(gulp.dest('./dist'))
})

gulp.task('build', ['compile', 'babel'])
