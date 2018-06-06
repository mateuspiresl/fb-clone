import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/comment-answer', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO comment_answer (user_id, comment_id, content) ' +
  'VALUES (:selfId, :commentId, :content);'
)

const findByIdQuery = db.prepare(
  'SELECT ca.*, u.name as user_name, u.photo as user_photo ' + 
  'FROM comment_answer as ca ' +
  'INNER JOIN user as u ON u.id=ca.user_id ' +
  'WHERE ca.id=:answerId;'
)

const removeQuery = db.prepare(
  'DELETE FROM comment_answer ' +
  'WHERE id=:answerId AND user_id=:selfId;'
)

export const name = 'comment_answer'

/**
 * Creates a comment in a comment.
 * @param {string} selfId The id of the author.
 * @param {string} commentId The id of the comment.
 * @param {string} content The content of the comment.
 * @returns {Promise<string>} The comment id.
 */
export async function create(selfId, commentId, content) {
  log('create', ...arguments)

  const params = { selfId, commentId, content }
  const result = await db.query(createQuery(params))
  
  if (result.info.insertId) return result.info.insertId
  throw new Error('Could not create the comment')
}

/**
 * Gets all the answers of a comment.
 * @param {string} answerId The id of the answer.
 * @returns {Promise<object>} The answer data.
 */
export async function findById(answerId) {
  log('findById', ...arguments)

  const answer = await db.query(findByIdQuery({ answerId }))
  return answer[0] || null
}

/**
 * Removes a comment answer from a comment.
 * @param {string} selfId The id of the author.
 * @param {string} answerId The id of the answer.
 * @returns {Promise<boolean>} True if the answer was removed, false otherwise.
 */
export async function remove(selfId, answerId) {
  log('remove', ...arguments)

  const params = { selfId, answerId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
