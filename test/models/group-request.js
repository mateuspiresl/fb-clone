import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Group from '../../src/models/group'
import * as GroupRequest from '../../src/models/group-request'
import '../index'


const should = chai.should()
const db = new Database()

var groupCreatorUserId
var groupRequesterId
var groupId

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

function insertGroup(creatorId, name) {
  return Group.create(creatorId, `${name}n`, `${name}d`, `${name}p`)
}

describe('Models | GroupRequest', () => {
  before(async () => {
    // Create the users for testing
    groupCreatorUserId = await insertUser('GroupAuthorUser')
    groupRequesterId = await insertUser('GroupRequesterUser')

    // Create the group for testing
    groupId = await insertGroup(groupCreatorUserId, 'GroupName');
  })

  afterEach(() => {db.clear(GroupRequest.name)})

  after(() => {
    db.clear(Group.name)
    db.clear(GroupRequest.name)
    db.clear(User.name)
  })

  it('request group membership creation', async () => {
      const result = await GroupRequest.create(groupCreatorUserId, groupId)
      should.exist(result)
  })

  it('group membership requests listing by group', async () => {
      const groupMembershipRequestCreationResult = await GroupRequest.create(groupRequesterId, groupId)
      should.exist(groupMembershipRequestCreationResult)

      const result = await GroupRequest.findAllByGroup(groupId)
      result.should.be.an('array').that.has.length(1)
      result[0].user_id.should.equal(groupRequesterId)
  })

  it('group membership request cancel by the user', async () => {
      const groupMembershipRequestCreationResult = await GroupRequest.create(groupRequesterId, groupId)
      should.exist(groupMembershipRequestCreationResult)

      var gropMembershipListingResult = await GroupRequest.findAllByGroup(groupId)
      gropMembershipListingResult.should.be.an('array').that.has.length(1)

      const groupRemovalResult = await GroupRequest.remove(groupRequesterId, groupId)
      groupRemovalResult.should.be.an('boolean')

      gropMembershipListingResult = await GroupRequest.findAllByGroup(groupId)
      gropMembershipListingResult.should.be.an('array').that.has.length(0)
  })

})
