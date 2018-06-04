import Database from '../src/database'
import * as User from '../src/models/user'
import * as Friendship from '../src/models/friendship'
import * as FriendshipRequest from '../src/models/friendship-request'
import '../src/utils'


const db = new Database()

before(async () => {
  await db.clear(FriendshipRequest.name)
  await db.clear(Friendship.name)
  await db.clear(User.name)
})

after(async () => {
  await db.clear(FriendshipRequest.name)
  await db.clear(Friendship.name)
  await db.clear(User.name)
  db.close()
})
