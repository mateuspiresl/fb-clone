import jwtMiddleware from 'express-jwt'


const SECRET_TOKEN = 'secret'
const sessions = new Set()

export function middleware() {
  return jwtMiddleware({
    secret: SECRET_TOKEN,
    getToken: (req) => {
      const token = extractToken(req)
      console.log('middlewares/auth/authenticate', token, sessions.has(token))
      return token
      // Session store disabled for development
      // return sessions.has(token) ? token : null
    }
  })
}

export function register(token) {
  console.log('middlewares/auth/register', token)
  sessions.add(token)
}

export function unregister() {
  return (req, res, next) => {
    const token = extractToken(req)
    console.log('middlewares/auth/logout', token)
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
