import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Friendship from '../../src/models/friendship'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

let ids = []
let selfId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

describe('Models | Friendship', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)
    selfId = await insertUser('Z')
  })

  afterEach(() => db.clear(Friendship.name))
  after(() => db.clear(User.name))

  it('create friendship', async () => {
    await Promise.all(
      ids.map(async id => {
        const result = await Friendship.create(selfId, id)
        should.exist(result)
        result.should.be.true
      })
    )
  })

  it('can not create inverse friendship', async () => {
    // Should succeed
    {
      const result = await Friendship.create(selfId, ids[0])
      should.exist(result)
      result.should.be.true
    }

    // Should fail
    {
      const result = await Friendship.create(ids[0], selfId)
      should.exist(result)
      result.should.be.false
    }
  })
  
  it('get all friends', async () => {
    await Promise.all(ids.map(id => Friendship.create(selfId, id)))

    const friends = await Friendship.findAll(selfId)
    should.exist(friends)
    friends.should.be.an('array').that.has.length(3)

    friends.forEach(user => {
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('name')
      user.should.have.property('photo')
      ids.should.include(user.id)
    })
  })

  it('get all friends inversely created', async () => {
    await Promise.all(ids.map(id => Friendship.create(id, selfId)))

    const friends = await Friendship.findAll(selfId)
    should.exist(friends)
    friends.should.be.an('array').that.has.length(3)

    friends.forEach(user => {
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('name')
      user.should.have.property('photo')
      ids.should.include(user.id)
    })
  })

  it('remove friendship', async () => {
    await Promise.all(ids.map(id => Friendship.create(selfId, id)))
    
    // Remove
    {
      (await ids.mapAsync(id => Friendship.remove(selfId, id)))
        .forEach(success => {
          success.should.be.a('boolean')
          success.should.be.true
        })
    }

    // Try to remove the same
    {
      (await ids.mapAsync(id => Friendship.remove(selfId, id)))
        .forEach(success => {
          success.should.be.a('boolean')
          success.should.be.false
        })
    }
  })
})
