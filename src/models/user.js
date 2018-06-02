import Database from '../database'


const db = new Database()

const createQuery = db.prepare(
    'INSERT INTO `user` (`username`, `password`) '
  + 'VALUES (:username, :password);'
)

const matchCredencialsQuery = db.prepare(
    'SELECT `id` FROM `user`'
  + 'WHERE `username`=:username AND `password`=:password;'
)

const findByIdQuery = db.prepare(
    'SELECT u.`id`, u.`username` FROM `user` as u '
  + 'LEFT JOIN `user_blocking` as ub ON u.`id`=ub.`blocker_id` '
  + 'WHERE u.`id`=:userId AND (ub.`blocker_id` IS NULL OR ub.`blocked_id`!=:selfId);'
)


/**
 * Creates a user.
 * @param {string} username The username.
 * @param {string} password The password.
 * @returns {Promise<string>} The user id if the user was created, or null, otherwise.
 */
export async function create(username, password) {
  try {
    const result = await db.query(createQuery({ username, password }))
    return result.info.insertId || null
  }
  catch (error) {
    if (error.code === 1062) return null
    else throw error
  }
}

/**
 * Matches the credencials of a user and returns it's id if succeed. 
 * @param {String} username The username to find the user.
 * @param {String} password The password to match.
 * @returns {Promise<string>} The user id if the creadencials match, or null,
 *  otherwise.
 */
export async function matchCredencials(username, password) {
  const result = await db.query(matchCredencialsQuery({ username, password }))
  return result.length > 0 && result[0].id || null
}

/**
 * Returns the data of an user if it is doesn't block the user who is searching.
 * @param {String} selfId The id of the user who is searching.
 * @param {String} userId The id of the user to find.
 * @returns {Promise<object>} The user id if the user was created, or null, otherwise.
 */
export async function findById(selfId, userId) {
  const result = await db.query(findByIdQuery({ selfId, userId }))
  return result.length > 0 && result[0] || null
}
