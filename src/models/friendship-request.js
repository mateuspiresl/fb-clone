import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/friendship-request', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO user_friendship_request (requester_id, requested_id) ' +
  'SELECT :requesterId, :requestedId FROM dual ' +
  'WHERE NOT EXISTS (' + 
    'SELECT * FROM user_friendship_request ' + 
    'WHERE requester_id=:requestedId AND requested_id=:requesterId ' +
    'UNION ' +
    'SELECT * FROM user_blocking ' +
    'WHERE blocked_id=:requesterId ' +
  ');'
)

const removeQuery = db.prepare(
  'DELETE FROM user_friendship_request ' +
  'WHERE requester_id=:requesterId AND requested_id=:requestedId;'
)

const findAllQuery = db.prepare(
  'SELECT u.id, u.name, u.photo FROM user_friendship_request as r ' +
  'RIGHT JOIN user as u ON u.id=r.requester_id ' +
  'WHERE requested_id=:requestedId;'
)

export const name = 'user_friendship_request'

/**
 * Creates a friendship request.
 * If this request is already created of there is an existent request from the
 * current requested to the requester, the return value will be false.
 * @param {string} requesterId The id of the requester.
 * @param {string} requestedId The id of the requested.
 * @returns {Promise<boolean>} True if the request was successfuly created, false otherwise.
 */
export async function create(requesterId, requestedId) {
  log('create', ...arguments)

  try {
    const result = await db.query(createQuery({ requesterId, requestedId }))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}

/**
 * Returns the requesters of all friendship requests to an user.
 * @param {string} requestedId The id of the requested user.
 * @returns {Promise<Array<object>>} The data of the requesters.
 */
export function findAll(requestedId) {
  log('findAll', ...arguments)
  return db.query(findAllQuery({ requestedId }))
}

/**
 * Removes a friendship request.
 * @param {string} requesterId The id of the requester.
 * @param {string} requestedId The id of the requested.
 * @returns {Promise<boolean>} True if the request was removed, false otherwise.
 */
export async function remove(requesterId, requestedId) {
  log('remove', ...arguments)

  const params = { requesterId, requestedId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
