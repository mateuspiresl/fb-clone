import chai from 'chai'
import axios from 'axios'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Friendship from '../../src/models/friendship'
import * as FriendshipRequest from '../../src/models/friendship-request'
import app from '../../src/app.js'
import '../../src/utils'
import '../index'


const should = chai.should()
const db = new Database()
const api = 'http://localhost:5000'
const authRoute = `${api}/auth`
const friendshipRoute = `${api}/friendship`
const requestRoute = `${friendshipRoute}/request`

let server = null
let selfId = null
let headers = {}
let ids = []

function create(n) {
  const data = [`u${n}`, `p${n}`, `n${n}`]
  return User.create(...data)
}

describe('Controllers | Friendship', () => {
  before(async () => {
    await Promise.all([
      // Start server
      new Promise(resolve => server = app.listen(5000, resolve)),

      // Clear users and create the users for testing
      (async () => {
        await db.clear(User.name)
        ids = await Promise.all([1, 2, 3].map(n => create(n)))
      })()
    ])

    // Create the authenticated user
    const credencials = { username: `u0`, password: `p0`, name: `n0` }
    const response = await axios.post(`${authRoute}/register`, credencials)
    selfId = response.data.user.id
    headers.Authorization = `Bearer ${response.data.token}`
  })

  after(async () => {
    await db.clear(User.name)
    server.close()
  })

  describe('Request', () => {
    function clear() {
      return db.clear(FriendshipRequest.name)
    }

    before(clear)
    afterEach(clear)
  
    it('get requests', async () => {
      await FriendshipRequest.create(ids[0], selfId)
      await FriendshipRequest.create(ids[1], selfId)

      const response = await axios.get(requestRoute, { headers })
      const requesters = response.data

      should.exist(requesters)
      requesters.should.be.an('array').that.has.length(2)
      requesters.forEach(user => {
        user.should.be.an('object')
        user.should.have.property('id')
        user.should.have.property('name')
        user.should.have.property('photo')
        ids.should.include(user.id)
      })
    })
  
    it('request friendship', async () => {
      await ids.mapAsync(async id => {
        await axios.post(requestRoute, { requestedId: id }, { headers })
        
        const requesters = await FriendshipRequest.findAll(id)
        requesters.should.have.length(1)
        requesters[0].id.should.equal(selfId)
      })
    })

    it('cancel friendship', async () => {
      await ids.mapAsync(id => FriendshipRequest.create(selfId, id))
      
      await ids.mapAsync(async id => {
        await axios.delete(`${requestRoute}/${id}`, { headers })
        
        const requests = await FriendshipRequest.findAll(selfId)
        requests.should.be.empty
      })
    })
  })

  describe('Friendship', () => {
    function clear() {
      return db.clear(Friendship.name)
    }

    before(clear)
    afterEach(clear)

    it('get friends', async () => {
      await ids.mapAsync(id => Friendship.create(id, selfId))

      const response = await axios.get(friendshipRoute, { headers })
      const friends = response.data
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
  })

  describe('Frienship Management', () => {
    async function clear() {
      await db.clear(Friendship.name)
      await db.clear(FriendshipRequest.name)
    }

    before(clear)
    afterEach(clear)

    it('accept friendship request', async () => {
      await ids.mapAsync(id => FriendshipRequest.create(id, selfId))
      await ids.mapAsync(id => axios.get(`${requestRoute}/${id}/accept`, { headers }))

      const requesters = await FriendshipRequest.findAll(selfId)
      requesters.should.have.length(0)

      const friends = await Friendship.findAll(selfId)
      friends.should.have.length(3)
    })

    it('reject friendship request', async () => {
      await ids.mapAsync(id => FriendshipRequest.create(id, selfId))
      await ids.mapAsync(id => axios.get(`${requestRoute}/${id}/reject`, { headers }))

      const requesters = await FriendshipRequest.findAll(selfId)
      requesters.should.have.length(0)

      const friends = await Friendship.findAll(selfId)
      friends.should.have.length(0)
    })
  })
})
