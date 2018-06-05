import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as UserBlocking from '../../src/models/user-blocking'
import '../index'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

let ids = []
let selfId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

describe('Models | Blocking', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)

    selfId = await insertUser('Z')
  })

  afterEach(() => db.clear(UserBlocking.name))
  after(() => db.clear(User.name))

  it('block user', async () => {
    await Promise.all(
      ids.map(async id => {
        const result = await UserBlocking.create(selfId, id)
        should.exist(result)
        result.should.be.true
      })
    )
  })

  it('get blocked users', async () => {
    await ids.mapAsync(id => UserBlocking.create(selfId, id))

    const blocked = await UserBlocking.findAll(selfId)
    should.exist(blocked)
    blocked.should.be.an('array').that.has.length(3)
    blocked.forEach(user => {
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('name')
      ids.should.include(user.id)
    })
  })

  it('remove blocking to user', async () => {
    await UserBlocking.create(ids[0], ids[1])
    
    // should fail
    {
      const result = await UserBlocking.remove(ids[1], ids[0])
      should.exist(result)
      result.should.be.false
    }

    // should succeed
    {
      const result = await UserBlocking.remove(ids[0], ids[1])
      should.exist(result)
      result.should.be.true
    }
  })
})
