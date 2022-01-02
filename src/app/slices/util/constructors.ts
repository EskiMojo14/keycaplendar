export class Interval<Fn extends (...args: any[]) => any> {
  callback: Fn;
  time: number;
  intervalId;
  constructor(callback: Fn, time: number) {
    this.callback = callback;
    this.time = time;
    this.intervalId = setInterval(callback, time);
  }
  clear() {
    clearTimeout(this.intervalId);
  }
  changeTime(time: number) {
    this.time = time;
    clearTimeout(this.intervalId);
    this.intervalId = setInterval(this.callback, time);
  }
  changeFn(callback: Fn) {
    this.callback = callback;
    clearTimeout(this.intervalId);
    this.intervalId = setInterval(this.callback, this.time);
  }
}
