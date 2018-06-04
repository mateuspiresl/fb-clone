export function createLogger(base, enabled) {
  if (!enabled) return () => {}

  return (name, ...args) => {
    const tag = name.length > 0 ? `/${name}` : ''
    console.log(`${base}${tag}`, ...args)
  }
}

Array.prototype.mapAsync = function (fn) {
  return Promise.all(this.map((...args) => fn(...args)))
}
