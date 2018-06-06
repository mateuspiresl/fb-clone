import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/group-membership', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO group_membership_request (user_id, group_id) ' +
  'VALUES (:requesterId, :groupId);'
)

export const name = 'group_membership_request'

/**
 * Creates a group membership.
 * @param {string} requesterId The id of the membership request.
 * @param {string} groupId The id of the requested group.
 * @returns {Promise<boolean>} True if the request was successfuly created, false otherwise.
 */
export async function create(requesterId, groupId) {
  log('create group membership request', ...arguments)

  try {
    const params = { requesterId, groupId }
    const result = await db.query(createQuery(params))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}
