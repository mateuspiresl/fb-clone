import Database from '../src/database'
import * as User from '../src/models/user'
import * as Group from '../src/models/group'
import * as UserBlocking from '../src/models/user-blocking'
import * as Friendship from '../src/models/friendship'
import * as FriendshipRequest from '../src/models/friendship-request'
import * as Post from '../src/models/post'
import '../src/utils'


const db = new Database()

async function clearAll() {
  await db.clear(Post.name)
  await db.clear(FriendshipRequest.name)
  await db.clear(Friendship.name)
  await db.clear(Group.name)
  await db.clear(UserBlocking.name)
  await db.clear(User.name)
}

before(clearAll)

after(async () => {
  await clearAll()
  db.close()
})
