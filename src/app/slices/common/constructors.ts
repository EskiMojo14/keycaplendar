export class Interval {
  intervalId;
  constructor(callback: () => void, time: number) {
    this.intervalId = setInterval(callback, time);
  }
  clear() {
    clearTimeout(this.intervalId);
    console.log("clear");
  }
}
