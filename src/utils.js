Array.prototype.mapAsync = function (fn) {
  return Promise.all(this.map((...args) => fn(...args)))
}