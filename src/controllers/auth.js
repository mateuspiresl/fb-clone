import jwt from 'jsonwebtoken'
import { Router } from 'express'

import { SECRET_TOKEN } from '../config'
import { create, matchCredencials } from '../models/user'
import { register, unregister } from '../auth'
import ApiError from '../api-error'
import user from './user';


function authenticate(res, userId) {
  const token = jwt.sign({ id: userId }, SECRET_TOKEN)
  register(token)
  res.json({ token, user: { id: userId } })
}

export default Router()

  .post('/register', async (req, res, next) => {
    console.log('controllers/auth/register', req.body)

    const { username, password, name } = req.body
    const userId = await create(username, password, name)

    if (userId) {
      authenticate(res, userId)
    }
    else {
      throw new ApiError(`The username ${username} is in use`, 400)
    }
  })

  .post('/login', async (req, res, next) => {
    console.log('controllers/auth/login', req.body)
    
    const { username, password } = req.body
    const userId = await matchCredencials(username, password)

    if (userId) {
      authenticate(res, userId)
    }
    else {
      throw new ApiError('Validation failure', 400)
    }
  })

  .get('/logout', async (req, res, next) => {
    console.log('controllers/auth/logout')
    unregister()
    res.send('')
  })
