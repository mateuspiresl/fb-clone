import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'
import * as Post from './post'
import * as Friendship from './friendship'


const db = new Database()
const log = createLogger('models/feed-post', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO feed_post (post_id, user_id) ' +
  'VALUES (:postId, :userId);'
)

const findByOwnerQuery = db.prepare(
  'SELECT p.*, fp.user_id as owner_id, u.name as user_name, u.photo as user_photo ' + 
  'FROM feed_post as fp ' +
  'INNER JOIN post as p ON p.id=fp.post_id ' +
  'INNER JOIN user as u ON u.id=p.author_id ' +
  'LEFT JOIN user_friendship as uf ON u.id=uf.user_a_id OR u.id=uf.user_b_id ' +
  'WHERE fp.user_id=:userId AND (' +
    'p.author_id=:selfId OR p.is_public=1 OR ' +
    '(uf.user_a_id=:selfId AND uf.user_b_id=:userId) OR ' +
    '(uf.user_a_id=:userId AND uf.user_b_id=:selfId) ' +
  ');'
)

const removeQuery = db.prepare(
  'DELETE FROM feed_post as fp ' +
  'INNER JOIN post as p ON p.id=fp.post_id ' +
  'WHERE fp.post_id=:postId AND (fp.user_id=:selfId OR p.author_id=:selfId);'
)

export const name = 'feed_post'

/**
 * Creates a post for an user.
 * @param {string} selfId The id of the author.
 * @param {string} userId The id of the owner.
 * @param {string|null} content The content of the post.
 * @param {string|null} picture The picture of the post.
 * @param {boolean} isPublic Post privacy, public (true) by default.
 * @returns {Promise<string|null>} The post id.
 */
export async function create(selfId, userId, { content=null, picture=null, isPublic=true }) {
  log('create', ...arguments)

  if (selfId !== userId && !(await Friendship.exists(selfId, userId)))
    return null

  const postParams = { content, picture, isPublic: isPublic ? 1 : 0 }
  const postId = await Post.create(selfId, postParams)

  if (!postId) throw new Error('Could not create the post')

  try {
    const params = { selfId, userId, postId }
    const result = await db.query(createQuery(params))
  
    if (result.info.affectedRows == '0') {
      throw new Error('Could not create the post feed')
    }

    return postId
  } catch (error) {
    await Post.remove(selfId, postId)
    throw error
  }
}

/**
 * Gets all the posts from a feed.
 * @param {string} selfId The id of the viewer.
 * @param {string} userId The id of the owner.
 * @returns {Promise<Array<object>>} The posts.
 */
export async function findByOwner(selfId, userId) {
  log('findByOwner', ...arguments)
  return db.query(findByOwnerQuery({ selfId, userId }))
}

/**
 * Removes a post.
 * @param {string} userId The id of the author or owner.
 * @param {string} postId The id of the post.
 * @returns {Promise<boolean>} True if the post was removed, false otherwise.
 */
export async function remove(selfId, postId) {
  log('remove', ...arguments)
  return db.query(removeQuery({ selfId, postId }))
}
