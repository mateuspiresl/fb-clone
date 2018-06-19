import Database from '../database'
import { logAllowed } from '../config'
import { createLogger } from '../utils'

const db = new Database()
const log = createLogger('models/group-blocking', logAllowed.queries)


const createQuery = db.prepare(
  'INSERT INTO group_blocking (user_id, group_id) VALUES (:userId, :groupId);'
)


const findAllQuery = db.prepare(
  'SELECT u.id, u.name FROM group_blocking as b ' +
  'RIGHT JOIN user as u ON u.id=b.group_id ' +
  'WHERE b.group_id=:groupId;'
)


const unblockQuery = db.prepare(
  'DELETE FROM group_blocking WHERE user_id=:userId AND group_id=:groupId;'
)


export const name = 'group_blocking'


export async function create(userId, groupId) {
  log('create', ...arguments)

  try {
    const result = await db.query(createQuery({ userId, groupId }))
    return result.info.affectedRows == '1'
  }
  catch (error) {
    if (error.code === 1062) return false
    else throw error
  }
}


export async function findAllBlockedUsers(groupId) {
  log('findAll', ...arguments)
  return db.query(findAllQuery({ groupId }))
}


export async function unblock(userId, groupId) {
  log('unblock', ...arguments)
  // deletes user blocking status [IM]
  const result = await db.query(unblockQuery({ userId, groupId }))
  return result.info.affectedRows == '1'
}
