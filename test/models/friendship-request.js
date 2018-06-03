import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as FriendshipRequest from '../../src/models/friendship-request'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

function createSelf() {
  return insertUser('Z')
}

describe('Models | FriendshipRequest', function () {
  let ids

  beforeEach(async function () {
    await db.clear('user_friendship_request')
    await db.clear('user')

    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)
  })

  after(async function () {
    await db.clear('user_friendship_request')
    await db.clear('user')
    db.close()
  })

  it('request friendship', async function () {
    const selfId = await createSelf()

    await Promise.all(
      ids.map(async id => {
        const result = await FriendshipRequest.create(selfId, id)
        should.exist(result)
        result.should.be.true
      })
    )
  })
  
  it('can not request the friendship of the user who requested the inverse', async function () {
    await FriendshipRequest.create(ids[0], ids[1])

    const result = await FriendshipRequest.create(ids[1], ids[0])
    should.exist(result)
    result.should.be.false
  })

  it('cancel friendship request', async function () {
    await FriendshipRequest.create(ids[0], ids[1])
    
    // should fail
    {
      const result = await FriendshipRequest.remove(ids[1], ids[0])
      should.exist(result)
      result.should.be.false
    }

    // should succeed
    {
      const result = await FriendshipRequest.remove(ids[0], ids[1])
      should.exist(result)
      result.should.be.true
    }
  })

  it('get users who requested friendship', async function () {
    const selfId = await createSelf()
    await Promise.all(ids.map(id => FriendshipRequest.create(id, selfId)))

    const requestersIds = await FriendshipRequest.findAll(selfId)
    should.exist(requestersIds)
    requestersIds.should.be.an('array').that.has.length(3)
    requestersIds.should.include.members(ids)
  })
})
