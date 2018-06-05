import Database from '../src/database'
import * as User from '../src/models/user'
import * as Group from '../src/models/group'
import * as Friendship from '../src/models/friendship'
import * as FriendshipRequest from '../src/models/friendship-request'

import '../src/utils'


const db = new Database()

async function clearAll() {
  await db.clear(FriendshipRequest.name)
  await db.clear(Friendship.name)
  await db.clear(Group.name)
  await db.clear(User.name)
}

before(async () => {
  await clearAll()
})

after(async () => {
  await clearAll()
  db.close()
})
