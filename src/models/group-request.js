import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/friendship-request', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO group_membership_request (user_id, group_id) ' +
  'VALUES (:requesterId, :groupId);'
)

const removeQuery = db.prepare(
  'DELETE FROM group_membership_request ' +
  'WHERE user_id=:userId AND group_id=:groupId;'
)

const findAllByRequesterQuery = db.prepare(
  'SELECT * FROM group_membership_request WHERE user_id=:user_id;'
)

const findAllByGroupQuery = db.prepare(
  'SELECT g.*, u.name as user_name, u.photo as user_photo ' +
  'FROM group_membership_request as g ' +
  'INNER JOIN user as u ON u.id=g.user_id ' +
  'WHERE g.group_id=:groupId;'
)

const findAllByUserQuery = db.prepare(
  'SELECT g.*, u.name as user_name, u.photo as user_photo ' +
  'FROM group_membership_request as g ' +
  'INNER JOIN user as u ON u.id=g.user_id ' +
  'WHERE g.user_id=:userId;'
)

const findOneQuery = db.prepare(
  'SELECT * FROM group_membership_request WHERE user_id=:userId AND group_id=:groupId;'
)

export const name = 'group_membership_request'

/**
 * Creates a group membership request.
 * @param {string} requesterId The id of the requester.
 * @param {string} groupId The id of the requested group.
 * @returns {Promise<boolean>} True if the request was successfuly created, false otherwise.
 */
export async function create(requesterId, groupId) {
  log('create group membership request', ...arguments)

  try {
    const params = { requesterId, groupId }
    const result = await db.query(createQuery(params))
    return result.info.insertId || null
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}

/**
 * Removes a group membership request.
 * @param {string} userId The id of the actual requester.
 * @param {string} groupId The id of the group.
 * @returns {Promise<boolean>} True if the request was removed, false otherwise.
 */
export async function remove(userId, groupId) {
  log('remove group request', ...arguments)

  const params = { userId, groupId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}

/**
 * Returns all membership requests to a group.
 * @param {string} groupId The id of the group.
 * @returns {Promise<Array<object>>} The data related to the existent membership requests.
 */
export function findAllByGroup(groupId) {
  log('findAll group memberships by creator', ...arguments)
  return db.query(findAllByGroupQuery({ groupId }))
}


export async function findOne(userId, groupId) {
  try {
    const result = await db.query(findOneQuery({ userId, groupId }))
    console.log('\n\n', result, '\n\n')
    return result.length > 0
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}

/**
 * Returns all membership requests created by a user.
 * @param {string} userId The id of the user.
 * @returns {Promise<Array<object>>} The data related to the existent membership requests.
 */
export function findAllByUser(userId) {
  log('findAll group memberships by creator', ...arguments)
  return db.query(findAllByUserQuery({ userId }))
}
