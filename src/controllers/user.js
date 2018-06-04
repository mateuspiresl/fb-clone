import { Router } from 'express'
import * as User from '../models/user'
import ApiError from '../api-error'
import { unregister } from '../auth'
import { logRequest } from '../middlewares/logger'
import { logAllowed } from '../config'


export default Router()

  .get('/me', logRequest(), async (req, res, next) => {
    const user = await User.findById(req.user.id, req.user.id)

    if (user) {
      res.json(user)
    } else {
      unregister()
      throw new ApiError('Unknown error')
    }
  })

  .get('/:id', logRequest(), async (req, res, next) => {
    const user = await User.findById(req.user.id, req.params.id)

    if (user) {
      res.json(user)
    } else {
      throw new ApiError('User not found', 404)
    }
  })

  .get('/', logRequest(), async (req, res, next) => {
    res.json(await User.findAll(req.user.id))
  })
