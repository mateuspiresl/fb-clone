import { Router } from 'express'
import * as FriendshipRequest from '../models/friendship-request'
import ApiError from '../api-error'


export default Router()

  .get('/friendship', async (req, res, next) => {
    console.log('controllers/user', req.user)
    const { requestedId } = req.user

    const requesters = await FriendshipRequest.findAll(selfId)
    res.json(requesters)
  })

  .post('/friendship', async (req, res, next) => {
    console.log('controllers/user', req.user)
    const { requestedId } = req.user

    await FriendshipRequest.create(selfId, requestedId)
    res.send()
  })
