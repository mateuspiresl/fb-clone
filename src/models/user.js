import Database from '../database'


const db = new Database()

const matchCredencialsQuery = db.prepare(
    'SELECT `id` FROM `user`'
  + 'WHERE `username`=:username AND `password`=:password'
)

const findByIdQuery = db.prepare(
    'SELECT u.`id`, u.`username` FROM `user` as u '
  + 'LEFT JOIN `user_blocking` as ub ON u.`id`=ub.`blocker_id` '
  + 'WHERE u.`id`=:userId AND (ub.`blocker_id` IS NULL OR ub.`blocked_id`!=:selfId)'
)


/**
 * Matches the credencials of a user and returns it's id if succeed. 
 * @param {String} username The username to find the user.
 * @param {String} password The password to match.
 */
export async function matchCredencials(username, password) {
  const result = await db.query(matchCredencialsQuery({ username, password }))
  return result.length > 0 ? result[0].id : null
}

/**
 * Returns the data of an user if it is doesn't block the user who is searching.
 * @param {String} selfId The id of the user who is searching.
 * @param {String} userId The id of the user to find.
 */
export async function findById(selfId, userId) {
  const result = await db.query(findByIdQuery({ selfId, userId }))
  console.log('models/user/findById.result', result)
  return result.length > 0 ? result[0] : null
}