import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/post', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO post (author_id, content, picture, is_public) ' +
  'VALUES (:selfId, :content, :picture, :isPublic);'
)

const findByIdQuery = db.prepare(
  'SELECT p.*, u.name as user_name, u.photo as user_photo ' + 
  'FROM post as p ' +
  'INNER JOIN user as u ON u.id=p.author_id ' +
  'WHERE p.id=:postId AND (p.is_public=1 OR p.author_id=:selfId);'
)

const findByAuthorQuery = db.prepare(
  'SELECT p.*, u.name as user_name, u.photo as user_photo ' + 
  'FROM post as p ' +
  'LEFT JOIN group_post as gp ON gp.post_id=p.id ' +
  'INNER JOIN user as u ON u.id=p.author_id ' +
  'WHERE gp.post_id IS NULL AND p.author_id=:authorId ' +
    'AND (p.is_public=1 OR p.author_id=:selfId);'
)

const removeQuery = db.prepare(
  'DELETE FROM post ' +
  'WHERE id=:postId AND author_id=:selfId;'
)

export const name = 'post'

/**
 * Creates a post.
 * @param {string} selfId The id of the author.
 * @param {string|null} content The content of the post.
 * @param {string|null} picture The picture of the post.
 * @param {boolean} isPublic Post privacy, public (true) by default.
 * @returns {Promise<string>} The post id.
 */
export async function create(selfId, { content=null, picture=null, isPublic=true }) {
  log('create', ...arguments)

  const params = { selfId, content, picture, isPublic: isPublic ? 1 : 0 }
  const result = await db.query(createQuery(params))
  
  if (result.info.insertId) return result.info.insertId
  throw new Error('Could not create the post')
}

/**
 * Gets a post.
 * @param {string} selfId The id of the user requesting the post.
 * @param {string} postId The id of the post.
 * @returns {Promise<object>} The data of the post.
 */
export async function findById(selfId, postId) {
  log('findById', ...arguments)

  const result = await db.query(findByIdQuery({ selfId, postId }))
  return result[0] || null
}

/**
 * Gets all the posts from an author.
 * @param {string} selfId The id of the user requesting the posts.
 * @param {string} authorId The id of the author.
 * @returns {Promise<Array<object>>} The data of the posts.
 */
export async function findByAuthor(selfId, authorId) {
  log('findByAuthor', ...arguments)
  return db.query(findByAuthorQuery({ selfId, authorId }))
}

/**
 * Removes a post.
 * @param {string} selfId The id of the author.
 * @param {string} postId The id of the post.
 * @returns {Promise<boolean>} True if the post was removed, false otherwise.
 */
export async function remove(selfId, postId) {
  log('remove', ...arguments)

  const params = { selfId, postId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
