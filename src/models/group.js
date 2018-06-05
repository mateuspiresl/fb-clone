import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'

const db = new Database()
const log = createLogger('models/group', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO `group` (creator_id, name, description, picture) ' +
  'VALUES (:creatorId, :name, :description, :picture);'
)

const findAllByCreatorQuery = db.prepare(
  'SELECT * FROM `group` WHERE creator_id=:user_id;'
)

export const name = 'group'

/**
 * Creates a group.
 * @param {string} creatorId The id of the user creating the new group.
 * @returns {Promise<boolean>} True if the group was successfuly created,
 *  false otherwise.
 */
export async function create(creatorId, name, description, picture) {
  log('create', ...arguments)

  try {
    const params = {
        creatorId,
        name,
        description,
        picture
    }
    const result = await db.query(createQuery(params))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}


/**
 * Returns the groups created by an user.
 * @param {string} creatorId The id of the creator user.
 * @returns {Promise<Array<string>>} The ids of the groups created by this user.
 */
export async function findAllByCreator(creatorId) {
  log('findAllByCreator', ...arguments)

  const params = { user_id: creatorId }
  return await db.query(findAllByCreatorQuery(params))
}
