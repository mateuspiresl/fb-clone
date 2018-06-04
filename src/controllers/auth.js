import jwt from 'jsonwebtoken'
import { Router } from 'express'

import { SECRET_TOKEN } from '../config'
import { create, matchCredencials } from '../models/user'
import { register, unregister } from '../auth'
import ApiError from '../api-error'
import user from './user';
import { logRequest } from '../middlewares/logger'


function authenticate(res, userId) {
  const token = jwt.sign({ id: userId }, SECRET_TOKEN)
  register(token)
  res.json({ token, user: { id: userId } })
}

export default Router()

  .post('/register', logRequest(), async (req, res, next) => {
    const { username, password, name } = req.body
    const userId = await create(username, password, name)

    if (userId) {
      authenticate(res, userId)
    }
    else {
      throw new ApiError(`The username ${username} is in use`, 400)
    }
  })

  .post('/login', logRequest(), async (req, res, next) => {
    const { username, password } = req.body
    const userId = await matchCredencials(username, password)

    if (userId) {
      authenticate(res, userId)
    }
    else {
      throw new ApiError('Validation failure', 400)
    }
  })

  .get('/logout', logRequest(), async (req, res, next) => {
    unregister()
    res.send('')
  })
