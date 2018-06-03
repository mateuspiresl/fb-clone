import express from 'express'
import 'express-async-errors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import Database from './database'
import { middleware as authenticate } from './auth'
import AuthController from './controllers/auth'
import UserController from './controllers/user'
import FriendshipController from './controllers/friendship'
import ApiError from './api-error'


const db = new Database()

export default express()

  .use(cookieParser())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))

  .use('/auth', AuthController)
  .use('/user', authenticate(), UserController)
  .use('/friendship', authenticate(), FriendshipController)

  .use(function (req, res, next) {
    const error = new ApiError('Not found')
    error.status = 404
    next(error)
  })
  
  .use(function (error, req, res, next) {
    if (error instanceof ApiError) {
      const status = error.status && ', status ' + error.status || ''
      console.error(`Error: ${error.message}${status}`)
    }
    else {
      console.error(error)
    }

    res.status(error.status || 500)
    res.send(error.message)
  })
