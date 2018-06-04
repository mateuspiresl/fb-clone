import { logAllowed } from '../config'


export function logRequest() {
  return (req, res, next) => {
    if (!logAllowed.requests) return next()

    const params = JSON.stringify({
      ...req.params,
      ...req.query,
      ...req.body
    })
    
    console.log(`~${req.method} ${req.originalUrl.substr(1)}`,
      req.user.id, params)
    next()
  }
}