import Database from '../database'
import { logAllowed } from '../config'


const db = new Database()

const createQuery = db.prepare(
  'INSERT INTO `user` (`username`, `password`, `name`) ' +
  'VALUES (:username, :password, :name);'
)

const updateQuery = db.prepare(
  'UPDATE `user` SET ' +
  '`name`=IF(:name IS NULL, `name`, :name), ' +
  '`birthdate`=IF(:birthdate IS NULL, `birthdate`, :birthdate), ' +
  '`photo`=IF(:photo IS NULL, `photo`, :photo) ' +
  'WHERE `id`=:selfId'
)

const matchCredencialsQuery = db.prepare(
  'SELECT `id` FROM `user`' +
  'WHERE `username`=:username AND `password`=:password;'
)

const findByIdQuery = db.prepare(
  'SELECT u.`id`, u.`username`, u.`name` FROM `user` as u ' +
  'LEFT JOIN `user_blocking` as ub ON u.`id`=ub.`blocker_id` ' +
  'WHERE u.`id`=:userId AND (ub.`blocker_id` IS NULL OR ub.`blocked_id`!=:selfId);'
)

const findAllQuery = db.prepare(
  'SELECT u.`id`, u.`username`, u.`name` FROM `user` as u ' +
  'LEFT JOIN `user_blocking` as ub ON u.`id`=ub.`blocker_id` ' +
  'WHERE u.`id`!=:selfId AND (ub.`blocker_id` IS NULL OR ub.`blocked_id`!=:selfId);'
)

function log(name, ...args) {
  if (logAllowed.queries) {
    const tag = name.length > 0 ? `/${name}` : ''
    console.log(`models/user${tag}`, ...args)
  }
}

export const name = 'user'

/**
 * Creates an user.
 * @param {string} username The username.
 * @param {string} password The password.
 * @returns {Promise<string>} The user id if the user was created, or null,
 *  otherwise.
 */
export async function create(username, password, name) {
  log('create', ...arguments)

  try {
    const result = await db.query(createQuery({ username, password, name }))
    return result.info.insertId || null
  }
  catch (error) {
    if (error.code === 1062) return null
    else throw error
  }
}

/**
 * Updates an user.
 * @param {string} selfId The name.
 * @param {object} data The object with the name, birthdate and photo.
 * @returns {Promise<object>} The user updated data if the user exists, or null,
 *  otherwise.
 */
export async function update(selfId, data) {
  log('update', selfId, JSON.stringify(data))

  const result = await db.query(createQuery({ selfId, ...data }))
  return result.info.insertId || null
}

/**
 * Matches the credencials of a user and returns it's id if succeed. 
 * @param {String} username The username to find the user.
 * @param {String} password The password to match.
 * @returns {Promise<string>} The user id if the creadencials match, or null,
 *  otherwise.
 */
export async function matchCredencials(username, password) {
  log('update', ...arguments)

  const result = await db.query(matchCredencialsQuery({ username, password }))
  return result.length > 0 && result[0].id || null
}

/**
 * Returns the data of an user.
 * If the user who is searching is blocke by it, there won't be a result.
 * @param {String} selfId The id of the user who is searching.
 * @param {String} userId The id of the user to find.
 * @returns {Promise<object>} The user id if found, or null, otherwise.
 */
export async function findById(selfId, userId) {
  log('findById', selfId, userId)

  const result = await db.query(findByIdQuery({ selfId, userId }))
  return result.length > 0 && result[0] || null
}

/**
 * Returns the data of all users.
 * The users who blocks the user searching won't be included in the results.
 * @param {String} selfId The id of the user who is searching.
 * @returns {Promise<Array<object>>} The users data.
 */
export async function findAll(selfId) {
  log('', selfId)

  const result = await db.query(findAllQuery({ selfId }))
  return result
}
