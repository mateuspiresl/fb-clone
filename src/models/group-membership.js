import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/group-membership', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO group_membership (user_id, group_id) ' +
  'SELECT :requesterId, :groupId FROM dual ' +
  'WHERE EXISTS (' + 
    'SELECT * FROM `group` ' + 
    'WHERE creator_id=:acceptantId AND id=:groupId ' +
    'UNION ' +
    'SELECT * FROM group_membership ' +
    'WHERE user_id=:acceptantId AND group_id=:groupId AND is_admin=1 ' +
  ');'
)

const setAdminQuery = db.prepare(
  'UPDATE group_membership set ' + 
  'is_admin=:isAdmin;'
)

const removeQuery = db.prepare(
  'DELETE FROM group_membership WHERE user_id=:userId AND group_id=:groupId;'
)

const listQuery = db.prepare(
  'SELECT * FROM group_membership WHERE group_id=:groupId;'
)

export const name = 'group_membership'


/**
 * Creates a group membership.
 * @param {string} acceptantId The id of the membership request.
 * @param {string} requesterId The id of the membership request.
 * @param {string} groupId The id of the requested group.
 * @returns {Promise<boolean>} True if the request was successfuly created, false otherwise.
 */
export async function create(acceptantId, requesterId, groupId) {
  log('create group membership request', ...arguments)

  try {
    const params = { acceptantId, requesterId, groupId }
    const result = await db.query(createQuery(params))
    return result.info.insertId
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}


/**
 * Removes a group membership.
 * @param {string} userId The id of the member user.
 * @param {string} groupId The id of the group.
 * @returns {Promise<boolean>} True if the request was successfuly created, false otherwise.
 */
export async function remove(userId, groupId) {
  log('remove group membership', ...arguments)

  try {
    const params = { userId, groupId }
    const result = await db.query(removeQuery(params))
    return result.info.insertId
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}


/**
 * Lists all group memberships.
 * @param {string} groupId The id of the group.
 * @returns {Promise<Array<string>>} True if the request was successful.
 */
export async function list(groupId) {
  log('list group membership', ...arguments)
  
  try {
    return await db.query(listQuery({ groupId }))
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}


/**
 * Switch membership admin value.
 * @param {string} membershipId The id of the group membership.
 * @param {string} groupId The id of the group.
 * @returns {Promise<boolean>} True if the request was successful.
 */
export async function setAdminStatus(isAdmin) {
  log('list group membership', ...arguments)
  try {
    return await db.query(setAdminQuery({ isAdmin: (isAdmin ? 1 : 0) }))
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}
