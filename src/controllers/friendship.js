import { Router } from 'express'
import * as FriendshipRequest from '../models/friendship-request'


function log(tag, ...args) {
  console.log(`controllers/friendship/${tag}`, ...args)
}

export default Router()

  /**
   * GET /friendship/request
   * Gets all the friendship requests made to the authenticated user.
   * @returns {Array<string>} The ids of the requesters.
   */
  .get('/request', async (req, res, next) => {
    log('request', req.user.id)

    res.json(await FriendshipRequest.findAll(req.user.id))
  })

  /**
   * POST /friendship/request
   * Creates a friendship request from the authenticated user to another.
   * @param requestedId The user to request the friendship.
   */
  .post('/request', async (req, res, next) => {
    log('request.post', req.user.id, req.body.requestedId)

    const requesterId = req.user.id
    const requestedId = req.body.requestedId
    res.json(await FriendshipRequest.create(requesterId, requestedId))
  })

  /**
   * DELETE /friendship/request
   * Cancels a friendship request from the authenticated user to another.
   * @param requestedId The user requested.
   */
  .delete('/request/:id', async (req, res, next) => {
    log('request.delete', req.user.id, req.params.id)

    const requesterId = req.user.id
    const requestedId = req.params.id
    res.json(await FriendshipRequest.remove(requesterId, requestedId))
  })
