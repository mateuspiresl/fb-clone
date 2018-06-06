import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/comment', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO comment (user_id, post_id, content) ' +
  'VALUES (:selfId, :postId, :content);'
)

const findByPostQuery = db.prepare(
  'SELECT c.*, u.name as user_name, u.photo as user_photo ' + 
  'FROM comment as c ' +
  'INNER JOIN user as u ON u.id=c.user_id ' +
  'WHERE c.post_id=:postId;'
)

const removeQuery = db.prepare(
  'DELETE FROM comment ' +
  'WHERE id=:commentId AND user_id=:selfId;'
)

export const name = 'comment'

/**
 * Creates a comment in a post.
 * @param {string} selfId The id of the author.
 * @param {string} postId The id of the post.
 * @param {string} content The content of the comment.
 * @returns {Promise<string>} The comment id.
 */
export async function create(selfId, postId, content) {
  log('create', ...arguments)

  const params = { selfId, postId, content }
  const result = await db.query(createQuery(params))
  
  if (result.info.insertId) return result.info.insertId
  throw new Error('Could not create the post')
}

/**
 * Gets all the comments from a post.
 * @param {string} postId The id of the post.
 * @returns {Promise<Array<object>>} The comments data.
 */
export async function findByPost(postId) {
  log('findByPost', ...arguments)
  return db.query(findByPostQuery({ postId }))
}

/**
 * Removes a comment from a post.
 * @param {string} selfId The id of the author.
 * @param {string} commentId The id of the comment.
 * @returns {Promise<boolean>} True if the comment was removed, false otherwise.
 */
export async function remove(selfId, commentId) {
  log('remove', ...arguments)

  const params = { selfId, commentId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
