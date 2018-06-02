export default class ApiError extends Error {
  constructor(message, status) {
    super(message || 'Unknown error')
    this.status = status || 500
  }
}