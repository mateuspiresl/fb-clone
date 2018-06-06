import { Router } from 'express'
import * as User from '../models/user'
import * as UserBlocking from '../models/user-blocking'
import ApiError from '../api-error'
import { unregister } from '../auth'
import { logRequest } from '../middlewares/logger'
import { logAllowed } from '../config'


export default Router()

  /**
   * GET /user/me
   * Gets the authenticated user data.
   * @returns {Array<object>} The data.
   */
  .get('/me', logRequest(), async (req, res, next) => {
    const user = await User.findById(req.user.id, req.user.id)

    if (user) {
      res.json(user)
    } else {
      unregister()
      throw new ApiError('Unknown error')
    }
  })

  /**
   * GET /user/:id
   * Gets an user.
   * @param {string} id The user id.
   * @returns {Array<object>} The user data.
   */
  .get('/:id', logRequest(), async (req, res, next) => {
    const user = await User.findById(req.user.id, req.params.id)

    if (user) {
      res.json(user)
    } else {
      throw new ApiError('User not found', 404)
    }
  })

  /**
   * GET /user
   * Gets all the users.
   * The users who blocks the authenticated user are not included.
   * @param {string} id The user id.
   * @returns {Array<object>} The users data.
   */
  .get('/', logRequest(), async (req, res, next) => {
    res.json(await User.findAll(req.user.id))
  })

  /**
   * GET /user/block/:id
   * Blocks an user.
   * @param {string} id The id of the user to block.
   */
  .post('/block', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const blockedId = req.body.id
    const success = await UserBlocking.create(selfId, blockedId)

    res.status(204).send(
      success ? 'User blocked' : 'User already blocked')
  })

  /**
   * DELETE /user/block/:id
   * Unblocks an user.
   * @param {string} id The id of the user to unblock.
   */
  .delete('/block/:id', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const blockedId = req.params.id
    const success = await UserBlocking.remove(selfId, blockedId)

    res.status(204).send(
      success ? 'User unblocked' : 'User is not blocked')
  })
