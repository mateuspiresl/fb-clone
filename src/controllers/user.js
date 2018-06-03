import { Router } from 'express'
import * as User from '../models/user'
import ApiError from '../api-error'


export default Router()

  .get('/:id', async (req, res, next) => {
    console.log('controllers/user/:id', req.user, req.params)
    const user = await User.findById(req.user.id, req.params.id)

    if (user) {
      res.json(user)
    } else {
      throw new ApiError('User not found', 404)
    }
  })

  .get('/', async (req, res, next) => {
    console.log('controllers/user', req.user)
    const users = await User.findAll(req.user.id)

    if (users) {
      res.json(users)
    } else {
      throw new ApiError('Users not found', 404)
    }
  })

  .get('/friendship/', async (req, res, next) => {
    console.log('controllers/user', req.user)
    const { requestedId } = req.user

    await FriendshipRequest.create(selfId, requestedId)
    res.send()
  })
