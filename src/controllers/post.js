import { Router } from 'express'
import * as Post from '../models/post'
import ApiError from '../api-error'
import { logRequest } from '../middlewares/logger'


export default Router()

  /**
   * GET /:id
   * Gets a post by its id.
   * @param id The id of the post.
   * @returns {object} The post data.
   */
  .get('/:id', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const postId = req.params.id
    const post = await Post.findById(selfId, postId)

    if (post) res.json(post)
    else throw new ApiError('Post not found', 404)
  })

  /**
   * GET /me
   * Gets all the posts of the authenticated user.
   * @returns {Array<object>} The posts data.
   */
  .get('/', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    return Post.findByAuthor(selfId, selfId)
  })

  /**
   * GET /?author
   * Gets all the posts of an user.
   * @param author The id of the author.
   * @returns {Array<object>} The data of the friends.
   */
  .get('/', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const authorId = req.query.author
    res.json(await Post.findByAuthor(selfId, authorId))
  })

  /**
   * POST /post
   * Creates a post.
   * @param {string} content The content of the post.
   * @param {string} picture The picture of the post.
   * @param {boolean} isPublic The privacy, true for public (default), false for private.
   * @returns {object} The post data.
   */
  .post('/', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const postId = await Post.create(selfId, req.body)
    const post = await Post.findById(selfId, postId)

    if (post) res.json(post)
    else throw new ApiError('Could not retrieve created post')
  })

  /**
   * DELETE /post
   * Removes a post.
   * @param id The post id.
   */
  .delete('/:id', logRequest(), async (req, res, next) => {
    const selfId = req.user.id
    const postId = req.params.id
    const success = await Post.remove(selfId, postId)

    if (success) {
      res.status(204).send()
    } else {
      throw new ApiError('Post request not found', 404)
    }
  })
