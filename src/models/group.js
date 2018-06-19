import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'
import * as GroupMembership from './group-membership'

const db = new Database()
const log = createLogger('models/group', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO `group` (creator_id, name, description, picture) ' +
  'VALUES (:creatorId, :name, :description, :picture);'
)

const removeQuery = db.prepare(
  'DELETE FROM `group` WHERE id=:group_id AND creator_id=:creator_id;'
)

const findAllByCreatorQuery = db.prepare(
  'SELECT * FROM `group` WHERE creator_id=:user_id;'
)

const findAllQuery = db.prepare(
  'SELECT * FROM `group`;'
)

const findByIdQuery = db.prepare(
  'SELECT * FROM `group` WHERE id=:groupId;'
)

export const name = 'group'

/**
 * Creates a group.
 * @param {string} creatorId The id of the user creating the new group.
 * @returns {Promise<boolean>} True if the group was successfuly created,
 *  false otherwise.
 */
export async function create(creatorId, { name, description, picture }) {
  log('create', ...arguments)

  const params = {
    creatorId,
    name,
    description,
    picture
  }

  try {
    const result = await db.query(createQuery(params))
    return result.info.insertId || null
  }
  catch (error) {
    if (error.code === 1062) return null
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

// export async function checkOwnership(creatorId, groupId) {
//   const result = await checkOwnershipQuery(groupId, creatorId)

//   const groups = findAll
// }


/**
 * Returns all the existent groups.
 * @returns {Promise<Array<string>>} The ids of all existent groups.
 */
export async function findAll() {
  log('findAll', ...arguments)
  return await db.query(findAllQuery())
}

/**
 * Returns a single group by its id.
 * @returns The queried group.
 */
export async function findById(groupId) {
  log('findAll', ...arguments)
  return await db.query(findByIdQuery({groupId}))
}

/**
 * Removes a group created by an User.
 * @param {string} creatorId The id of the group creator.
 * @param {string} groupId The id of the group.
 * @returns {Promise<boolean>} True if the group was removed, false otherwise.
 */
export async function remove(creatorId, groupId) {
  log('remove group created by an user', ...arguments)
  
  const params = {
    creator_id: creatorId,
    group_id: groupId
  }

  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}
