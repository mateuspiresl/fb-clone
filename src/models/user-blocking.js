import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/user-blocking', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO user_blocking (blocker_id, blocked_id) ' +
  'VALUES (:blockerId, :blockedId);'
)

const findAllQuery = db.prepare(
  'SELECT u.id, u.name FROM user_blocking as b ' +
  'RIGHT JOIN user as u ON u.id=b.blocked_id ' +
  'WHERE b.blocker_id=:blockerId;'
)

const removeQuery = db.prepare(
  'DELETE FROM user_blocking ' +
  'WHERE blocker_id=:blockerId AND blocked_id=:blockedId;'
)

export const name = 'user_blocking'

/**
 * Creates a user blocking.
 * @param {string} blockerId The id of the blocker.
 * @param {string} blockedId The id of the blocked.
 * @returns {Promise<boolean>} True if the blocking was successfuly created, false otherwise.
 */
export async function create(blockerId, blockedId) {
  log('create', ...arguments)

  try {
    const params = { blockerId, blockedId }
    const result = await db.query(createQuery(params))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}

/**
 * Gets the blocked users of an user.
 * @param {string} blockerId The id of the blocker.
 * @returns {Promise<Array<object>>} The data of the blocked users.
 */
export async function findAll(blockerId) {
  log('findAll', ...arguments)
  return db.query(findAllQuery({ blockerId }))
}

/**
 * Removes a user blocking.
 * @param {string} blockerId The id of the blocker.
 * @param {string} blockedId The id of the blocked.
 * @returns {Promise<boolean>} True if the blocking was removed, false otherwise.
 */
export async function remove(blockerId, blockedId) {
  log('remove', ...arguments)

  const params = { blockerId, blockedId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
