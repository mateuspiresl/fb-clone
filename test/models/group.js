import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Group from '../../src/models/group'
import '../../src/utils'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

let creatorsIds = []

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

describe.only('Models | Group', () => {
  before(async () => {
    // Create the users for testing
    creatorsIds = await names.mapAsync(name => insertUser(name))
  })

  afterEach(() => db.clear(Group.name))
  after(() => db.clear(User.name))

  it.only('create group', async () => {
    await creatorsIds.mapAsync(async id => {
      const result = await Group.create(id, 'name', 'description', 'picture')
      should.exist(result)
      result.should.be.true
    })
  })

  it('get all groups', async () => {
    await Promise.all(creatorsIds.map(id => Group.create(selfId, id)))

    const friends = await Group.findAll(selfId)
    should.exist(friends)
    friends.should.be.an('array').that.has.length(3)

    friends.forEach(user => {
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('name')
      user.should.have.property('photo')
      creatorsIds.should.include(user.id)
    })
  })

  it('remove group', async () => {
    await Promise.all(creatorsIds.mapAsync(id => Group.create(selfId, id)))

    // Remove
    {
      (await creatorsIds.mapAsync(id => Group.remove(selfId, id)))
      .forEach(success => {
        success.should.be.a('boolean')
        success.should.be.true
      })
    }

    // Try to remove the same
    {
      (await creatorsIds.mapAsync(id => Group.remove(selfId, id)))
      .forEach(success => {
        success.should.be.a('boolean')
        success.should.be.false
      })
    }
  })
})
