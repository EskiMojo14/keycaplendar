export class Interval {
  intervalId;
  constructor(callback: (...args: any[]) => any, time: number) {
    this.intervalId = setInterval(callback, time);
  }
  clear() {
    clearTimeout(this.intervalId);
    console.log("clear");
  }
}
