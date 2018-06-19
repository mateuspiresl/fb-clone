import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'
import * as Post from './post'
import * as GroupMembership from './group-membership'


const db = new Database()
const log = createLogger('models/group-post', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO group_post (post_id, group_id) ' +
  'SELECT :postId, :groupId FROM dual ' +
  'WHERE EXISTS (' +
    'SELECT * FROM group_membership ' +
    'WHERE group_id=:groupId AND user_id=:selfId' +
  ');'
)

const findByGroupQuery = db.prepare(
  'SELECT p.*, gp.group_id, u.name as user_name, u.photo as user_photo ' + 
  'FROM group_post as gp ' +
  'INNER JOIN post as p ON p.id=post_id ' +
  'INNER JOIN user as u ON u.id=p.author_id ' +
  'WHERE group_id=:groupId;'
)

const removeQuery = db.prepare(
  'DELETE FROM group_post WHERE post_id=:postId;'
)

export const name = 'group_post'

/**
 * Creates a post.
 * @param {string} selfId The id of the author.
 * @param {string|null} content The content of the post.
 * @param {string|null} picture The picture of the post.
 * @param {boolean} isPublic Post privacy, public (true) by default.
 * @returns {Promise<string>} The post id.
 */
export async function create(selfId, groupId, { content=null, picture=null, isPublic=true }) {
  log('create', ...arguments)

  const postParams = { content, picture, isPublic: isPublic ? 1 : 0 }
  const postId = await Post.create(selfId, postParams)

  if (!postId) throw new Error('Could not create the post')

  try {
    const params = { selfId, postId, groupId }
    const result = await db.query(createQuery(params))
  
    if (result.info.affectedRows == '0') {
      throw new Error('Could not create the post group')
    }

    return postId
  } catch (error) {
    await Post.remove(selfId, postId)
    throw error
  }
}

/**
 * Gets all the posts from a group.
 * @param {string} groupId The id of the group.
 * @returns {Promise<Array<object>>} The data of the posts.
 */
export async function findByGroup(groupId) {
  log('findByGroup', ...arguments)
  return db.query(findByGroupQuery({ groupId }))
}

/**
 * Removes a post.
 * @param {string} selfId The id of the author.
 * @param {string} postId The id of the post.
 * @returns {Promise<boolean>} True if the post was removed, false otherwise.
 */
export async function remove(selfId, postId, groupId) {
  log('remove', ...arguments)

  const post = await Post.findById(selfId, postId)
  
  if (post.author_id != selfId) {
    const membership = await GroupMembership.findOneGroupMembership(selfId, groupId)
    if (membership.is_admin != '1') return false
  }
  
  return db.query(removeQuery({ selfId, postId }))
}
