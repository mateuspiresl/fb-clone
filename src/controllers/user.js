import { Router } from 'express'
import * as User from '../models/user'
import ApiError from '../api-error'
import { unregister } from '../auth'


export default Router()

  .get('/me', async (req, res, next) => {
    console.log('controllers/user/me', req.user.id)
    const user = await User.findById(req.user.id, req.user.id)

    if (user) {
      res.json(user)
    } else {
      unregister()
      throw new ApiError('Unknown error')
    }
  })

  .get('/:id', async (req, res, next) => {
    console.log('controllers/user/:id', req.user.id, req.params.id)
    const user = await User.findById(req.user.id, req.params.id)

    if (user) {
      res.json(user)
    } else {
      throw new ApiError('User not found', 404)
    }
  })

  .get('/', async (req, res, next) => {
    console.log('controllers/user', req.user.id)
    const users = await User.findAll(req.user.id)

    if (users) {
      res.json(users)
    } else {
      throw new ApiError('Users not found', 404)
    }
  })
