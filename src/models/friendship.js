import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/friendship', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO user_friendship (user_a_id, user_b_id) ' +
  'SELECT :user_a_id, :user_b_id FROM dual ' +
  'WHERE NOT EXISTS (' + 
    'SELECT * FROM user_friendship ' + 
    'WHERE user_a_id=:user_b_id AND user_b_id=:user_a_id' +
  ');'
)

const findAllQuery = db.prepare(
  'SELECT u.id, u.name, u.photo FROM ( ' +
    'SELECT user_a_id as id FROM user_friendship WHERE user_b_id=:user_id ' +
    'UNION ' +
    'SELECT user_b_id as id FROM user_friendship WHERE user_a_id=:user_id ' +
  ') f INNER JOIN user AS u ON u.id=f.id;'
)

const removeQuery = db.prepare(
  'DELETE FROM user_friendship ' +
  'WHERE (user_a_id=:user_a_id AND user_b_id=:user_b_id) ' +
    'OR (user_a_id=:user_b_id AND user_b_id=:user_a_id);'
)

export const name = 'user_friendship'

/**
 * Creates friendship.
 * @param {string} selfId The id of the user accepting the friendship request.
 * @param {string} friendId The id of the user who requested the friendship.
 * @returns {Promise<boolean>} True if the friendship was successfuly created,
 *  false otherwise.
 */
export async function create(selfId, friendId) {
  log('create', ...arguments)

  try {
    const params = { user_a_id: selfId, user_b_id: friendId }
    const result = await db.query(createQuery(params))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}

/**
 * Returns the friends of an user.
 * @param {string} selfId The id of the user.
 * @returns {Promise<Array<string>>} The ids of the friends.
 */
export async function findAll(selfId) {
  log('findAll', ...arguments)

  const params = { user_id: selfId }
  return await db.query(findAllQuery(params))
}

/**
 * Removes friendship.
 * @param {string} selfId The id of the user removing the friendship.
 * @param {string} friendId The id of the user been removed.
 * @returns {Promise<boolean>} True if the friendship was removed, false otherwise.
 */
export async function remove(selfId, friendId) {
  log('remove', ...arguments)

  const params = { user_a_id: selfId, user_b_id: friendId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
