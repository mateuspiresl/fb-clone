import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'


const db = new Database()
const log = createLogger('models/user', logAllowed.queries)

const createQuery = db.prepare(
  'INSERT INTO user (username, password, name, birthdate, photo) ' +
  'VALUES (:username, :password, :name, :birthdate, :photo);'
)

const updateQuery = db.prepare(
  'UPDATE user SET ' +
  'name=IF(:name IS NULL, name, :name), ' +
  'birthdate=IF(:birthdate IS NULL, birthdate, :birthdate), ' +
  'photo=IF(:photo IS NULL, photo, :photo) ' +
  'WHERE id=:selfId'
)

const matchCredencialsQuery = db.prepare(
  'SELECT id FROM user ' +
  'WHERE username=:username AND password=:password;'
)

const findByIdQuery = db.prepare(
  'SELECT u.id, u.username, u.name, ' +
  'CASE WHEN EXISTS (SELECT * FROM user_friendship WHERE ' +
    'user_a_id=:selfId AND user_b_id=:userId OR ' +
    'user_a_id=:userId AND user_b_id=:selfId ' +
  ') THEN 1 ELSE 0 END AS is_friend, ' +
  'CASE WHEN EXISTS (SELECT * FROM user_blocking WHERE ' +
    'blocker_id=:selfId AND blocked_id=:userId ' +
  ') THEN 1 ELSE 0 END AS is_blocked, ' +
  'CASE WHEN EXISTS (SELECT * FROM user_friendship_request WHERE ' +
    'requester_id=:selfId AND requested_id=:userId ' +
  ') THEN 1 ELSE 0 END AS is_friendship_requester, ' +
  'CASE WHEN EXISTS (SELECT * FROM user_friendship_request WHERE ' +
    'requester_id=:userId AND requested_id=:selfId ' +
  ') THEN 1 ELSE 0 END AS is_friendship_requested ' +
  'FROM user AS u ' +
  'LEFT JOIN user_blocking AS ub ON u.id=ub.blocker_id ' +
  'WHERE u.id=:userId AND (ub.blocker_id IS NULL OR ub.blocked_id!=:selfId);'
)

const findAllQuery = db.prepare(
  'SELECT u.id, u.username, u.name FROM user as u ' +
  'LEFT JOIN user_blocking as ub ON u.id=ub.blocker_id ' +
  'WHERE u.id!=:selfId AND (ub.blocker_id IS NULL OR ub.blocked_id!=:selfId);'
)

export const name = 'user'

/**
 * Creates an user.
 * @param {string} username The username.
 * @param {string} password The password.
 * @param {string} name The user name.
 * @param {string} birthdate The user birthdate.
 * @param {string} photo The user photo.
 * @returns {Promise<string>} The user id if the user was created, or null,
 *  otherwise.
 */
export async function create(username, password, name, birthdate, photo) {
  log('create', ...arguments)

  const params = {
    username, password, name, birthdate, photo
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
 * Updates an user.
 * @param {string} selfId The name.
 * @param {object} data The object with the name, birthdate and photo.
 * @returns {Promise<object>} The user updated data if the user exists, or null,
 *  otherwise.
 */
export async function update(selfId, data) {
  log('update', selfId, JSON.stringify(data))

  const result = await db.query(updateQuery({ selfId, ...data }))
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
  log('matchCredencials', ...arguments)

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
  const user = result.length > 0 && result[0] || null

  if (user) {
    user.is_friend = user.is_friend === '1'
    user.is_blocker = user.is_blocker === '1'
    user.is_friendship_requester = user.is_friendship_requester === '1'
    user.is_friendship_requested = user.is_friendship_requested === '1'
  }

  return user
}

/**
 * Returns the data of all users.
 * The users who blocks the user searching won't be included in the results.
 * @param {String} selfId The id of the user who is searching.
 * @returns {Promise<Array<object>>} The users data.
 */
export async function findAll(selfId) {
  log('findAll', selfId)
  return db.query(findAllQuery({ selfId }))
}
