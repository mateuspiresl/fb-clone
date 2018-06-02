import express from 'express'
import 'express-async-errors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import Database from './database'
import { middleware as authenticate } from './auth'
import AuthController from './controllers/auth'
import UserController from './controllers/user'


const db = new Database()

export default express()

  .use(cookieParser())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))

  .use('/auth', AuthController)
  .use('/user', authenticate(), UserController)

  .use(function (req, res, next) {
    const error = new Error('Not found')
    error.status = 404
    next(error)
  })
  
  .use(function (error, req, res, next) {
    console.error(error)
    res.status(error.status || 500)
    res.send(error.message)
  })

  .listen(5000, () => {
    console.log('App on localhost:5000')
  })
