import jwtMiddleware from 'express-jwt'
import { logAllowed } from './config'
import { createLogger } from './utils'


const SECRET_TOKEN = 'secret'
const sessions = new Set()
const log = createLogger('auth', logAllowed.auth)

export function middleware() {
  return jwtMiddleware({
    secret: SECRET_TOKEN,
    
    getToken(req) {
      const token = extractToken(req)
      log('authenticate', token, sessions.has(token))
      return token
      // Session store disabled for development
      // return sessions.has(token) ? token : null
    }
  })
}

export function register(token) {
  log('register', token)
  sessions.add(token)
}

export function unregister() {
  return (req, res, next) => {
    const token = extractToken(req)
    log('logout', token)
    sessions.delete(token)
  }
}

function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  }
  else if (req.query && req.query.token) {
    return req.query.token
  }
  else if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }

  return null
}
