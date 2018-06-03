import Database from '../database'


const db = new Database()

const createQuery = db.prepare(
  'INSERT INTO `user_friendship_request` (`requester_id`, `requested_id`) ' +
  'SELECT :requesterId, :requestedId FROM dual ' +
  'WHERE NOT EXISTS (' + 
    'SELECT * FROM `user_friendship_request` ' + 
    'WHERE `requester_id`=:requestedId AND `requested_id`=:requesterId' +
  ');'
)

const removeQuery = db.prepare(
  'DELETE FROM `user_friendship_request` ' +
  'WHERE `requester_id`=:requesterId AND `requested_id`=:requestedId;'
)

const findAllQuery = db.prepare(
  'SELECT `requester_id` FROM `user_friendship_request` ' +
  'WHERE `requested_id`=:requestedId;'
)


/**
 * Creates a friendship request.
 * If this request is already created of there is an existent request from the
 * current requested to the requester, the return value will be false.
 * @param {string} requesterId The id of the requester.
 * @param {string} requestedId The id of the requested.
 * @returns {Promise<boolean>} True if the request of successfuly created, false otherwise.
 */
export async function create(requesterId, requestedId) {
  try {
    const result = await db.query(createQuery({ requesterId, requestedId }))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}

export async function remove(requesterId, requestedId) {
  const params = { requesterId, requestedId }
  const result = await db.query(removeQuery(params))
  return result.info.affectedRows == '1'
}

/**
 * Returns the requesters of all friendship requests to an user.
 * @param {string} requestedId The id of the requested user.
 * @returns {Promise<Array<string>>} The ids of the requesters.
 */
export async function findAll(requestedId) {
  const result = await db.query(findAllQuery({ requestedId }))
  return result.map(request => request.requester_id)
}
