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

function insertGroup(creatorId, name) {
  return Group.create(creatorId, `${name}n`, `${name}d`, `${name}p`)
}

describe.only('Models | Group', () => {
  before(async () => {
    // Create the users for testing
    creatorsIds = await names.mapAsync(name => insertUser(name))
  })

  afterEach(() => db.clear(Group.name))
  after(() => db.clear(User.name))

  it('create group', async () => {
    await creatorsIds.mapAsync(async id => {
      const result = await Group.create(id, 'name', 'description', 'picture')
      should.exist(result)
      result.should.be.true
    })
  })

  it('get all groups created by user', async () => {
    const testUserId = await insertUser('testUser')
    const testGroupNames = ['A', 'B', 'C', 'D', 'E']

    await testGroupNames.mapAsync(async testName => {
      const result = await insertGroup(testUserId, testName)
      should.exist(result)
      result.should.be.true
    })

    const groups = await Group.findAllByCreator(testUserId)
    should.exist(groups)
    groups.should.be.an('array').that.has.length(5)

    groups.forEach(group => {
      group.should.be.an('object')
      group.should.have.property('id')
      group.should.have.property('creator_id')
      group.should.have.property('name')
      group.should.have.property('description')
      group.should.have.property('picture')
      testGroupNames.should.include(group.name.substr(0, 1))
      group.creator_id.should.equal(testUserId)
    })
  })

  it('get all existent groups', async () => {
    const testUserId1 = await insertUser('testUser1')
    const testUserId2 = await insertUser('testUser2')

    const testGroupNames = ['A', 'B', 'C', 'D', 'E']

    await testGroupNames.mapAsync(async testName => {
      const user1GroupCreationResult = await insertGroup(testUserId1, testName)
      const user2GroupCreationResult = await insertGroup(testUserId2, testName)
      should.exist(user1GroupCreationResult)
      should.exist(user2GroupCreationResult)
    })

    const groups = await Group.findAll()
    should.exist(groups)
    groups.should.be.an('array').that.has.length(10)

    groups.forEach(group => {
      group.should.be.an('object')
      group.should.have.property('id')
      group.should.have.property('creator_id')
      group.should.have.property('name')
      group.should.have.property('description')
      group.should.have.property('picture')
      testGroupNames.should.include(group.name.substr(0, 1))
    })
  })

  it('remove group created by an user', async () => {
    const creatorUserId = await insertUser('TestUserName');
    const createdGroupId = await insertGroup(creatorUserId, 'TestGroupName')

    // Remove
    {
      const groupDeletionResult = await Group.remove(creatorUserId, createdGroupId)
      groupDeletionResult.should.be.a('boolean')
      groupDeletionResult.should.be.true
    }

    // Try to remove the same
    {
      const groupDeletionResult = await Group.remove(creatorUserId, createdGroupId)
      groupDeletionResult.should.be.a('boolean')
      groupDeletionResult.should.be.false
    }
  })

})
