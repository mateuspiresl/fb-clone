import { Router } from 'express'
import * as Friendship from '../models/friendship'
import * as FriendshipRequest from '../models/friendship-request'
import ApiError from '../api-error'
import { logRequest } from '../middlewares/logger'


export default Router()

  /**
   * GET /friendship
   * Gets all the friends of the authenticated user.
   * @returns {Array<object>} The data of the friends.
   */
  .get('/', logRequest(), async (req, res, next) => {
    res.json(await Friendship.findAll(req.user.id))
  })

  /**
   * GET /friendship/request
   * Gets all the users who requested friendship to the authenticated user.
   * @returns {Array<string>} The data of the requesters.
   */
  .get('/request', logRequest(), async (req, res, next) => {
    res.json(await FriendshipRequest.findAll(req.user.id))
  })

  /**
   * GET /friendship/request/:id/accept
   * Accepts a friendship request made to the authenticated user.
   * @param requesterId The user who requested the friendship.
   * @returns {Array<boolean>} True if the friendship was created, false otherwise.
   */
  .get('/request/:requesterId/accept', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const requesterId = req.params.requesterId

    const requestRemoved = await FriendshipRequest.remove(requesterId, selfId)
    if (!requestRemoved) {
      throw new ApiError('Friendship request not found', 404)
    }
    
    const friendshipCreated = await Friendship.create(selfId, requesterId)
    if (!friendshipCreated) {
      throw new ApiError('Could not accept the friendship request')
    }
    
    res.status(204).send()
  })

  /**
   * GET /friendship/request/:id/reject
   * Rejects a friendship request made to the authenticated user.
   * @param requesterId The user who requested the friendship.
   * @returns {Array<boolean>} True if the friendship was removed, false otherwise.
   */
  .get('/request/:requesterId/reject', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const requesterId = req.params.requesterId
    const success = await FriendshipRequest.remove(requesterId, selfId)

    if (success) {
      res.status(204).send()
    } else {
      throw new ApiError('Friendship request not found', 404)
    }
  })

  /**
   * POST /friendship/request
   * Creates a friendship request from the authenticated user to another.
   * @param requestedId The user to request the friendship.
   */
  .post('/request', logRequest(), async (req, res, next) => {
    const requesterId = req.user.id
    const requestedId = req.body.requestedId
    const success = await FriendshipRequest.create(requesterId, requestedId)

    if (success) {
      res.status(204).send()
    } else {
      throw new ApiError('Could not create the friendship request')
    }
  })

  /**
   * DELETE /friendship/request
   * Cancels a friendship request from the authenticated user to another.
   * @param requestedId The user requested.
   */
  .delete('/request/:requestedId', logRequest(), async (req, res, next) => {
    const requesterId = req.user.id
    const requestedId = req.params.requestedId
    const success = await FriendshipRequest.remove(requesterId, requestedId)

    if (success) {
      res.status(204).send()
    } else {
      throw new ApiError('Friendship request not found', 404)
    }
  })
