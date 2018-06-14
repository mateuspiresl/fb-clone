/**
 * Create a logger the prints a tag.
 * The base tag is concatenated with the first argument of the logger function.
 * @param {string} base Tag base.
 * @param {boolean} enabled True if it should log when called, false otherwise.
 * @returns {function} The logger function.
 */
export function createLogger(base, enabled) {
  if (!enabled) return () => {}

  return (name, ...args) => {
    const tag = name.length > 0 ? `/${name}` : ''
    console.log(`${base}${tag}`, ...args)
  }
}

/**
 * An async map method.
 * This method performs a call to {@link map} and returns the result in a call
 * to {@link Promise.all}.
 * @param {function} fn The callback.
 * @returns {Promise} The promise for all calls to the callback.
 */
Array.prototype.mapAsync = function (fn) {
  return Promise.all(this.map((...args) => fn(...args)))
}

Array.prototype.remove = function (value) {
  return this.splice(this.indexOf(value), 1)[0]
}

Number.prototype.map = function (fn) {
  const max = parseInt(this)
  const result = []
  for (let i = 0; i < max; i++) result.push(fn(i))
  return result
}

Number.prototype.mapAsync = function (fn) {
  return Promise.all(this.map(fn))
}

Number.prototype.repeat = function (fn) {
  const max = parseInt(this)
  for (let i = 0; i < max; i++) fn(i)
}

Number.prototype.repeatAsync = async function (fn) {
  const max = parseInt(this)
  for (let i = 0; i < max; i++) await fn(i)
}
