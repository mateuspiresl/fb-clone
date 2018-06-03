import Database from '../src/database'
import * as User from '../src/models/user'
import * as FriendshipRequest from '../src/models/friendship-request'


const db = new Database()

before(async () => {
  await db.clear(FriendshipRequest.name)
  await db.clear(User.name)
})

after(() => db.close())