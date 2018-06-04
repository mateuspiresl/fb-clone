import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as FriendshipRequest from '../../src/models/friendship-request'
import '../index'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

let ids = []
let selfId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

describe('Models | FriendshipRequest', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)

    selfId = await insertUser('Z')
  })

  afterEach(() => db.clear(FriendshipRequest.name))
  after(() => db.clear(User.name))

  it('request friendship', async () => {
    await Promise.all(
      ids.map(async id => {
        const result = await FriendshipRequest.create(selfId, id)
        should.exist(result)
        result.should.be.true
      })
    )
  })
  
  it('can not request the friendship of the user who requested the inverse', async () => {
    await FriendshipRequest.create(ids[0], ids[1])

    const result = await FriendshipRequest.create(ids[1], ids[0])
    should.exist(result)
    result.should.be.false
  })

  it('cancel friendship request', async () => {
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

  it('get users who requested friendship', async () => {
    await Promise.all(ids.map(id => FriendshipRequest.create(id, selfId)))

    const requesters = await FriendshipRequest.findAll(selfId)
    should.exist(requesters)
    requesters.should.be.an('array').that.has.length(3)
    requesters.forEach(user => {
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('name')
      user.should.have.property('photo')
      ids.should.include(user.id)
    })
  })
})
