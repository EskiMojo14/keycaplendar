import gulp from "gulp";

export const task = () =>
  // example
  gulp.src("src/setupTests.js").pipe(gulp.dest("./test.js"));

export default task;
