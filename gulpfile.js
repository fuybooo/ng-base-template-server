var gulp = require('gulp');
var typescript = require('gulp-typescript');
var tsProject = typescript.createProject('tsconfig.json');
gulp.task('default', function () {
    return gulp.watch('**/*.ts', function () {
        console.log('watch file changed...');
        return tsProject.src().pipe(tsProject()).pipe(gulp.dest('dist'));
    });
});
// gulp.task('dg', function () {
//     return gulp.watch(['src/dao-gen/index.ts', 'src/test/dao/t-monster-menu-sql.ts'], function () {
//         console.log('watch file changed...');
//         return tsProject.src().pipe(tsProject()).pipe(gulp.dest('dist'));
//     });
// });