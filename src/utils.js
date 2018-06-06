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
