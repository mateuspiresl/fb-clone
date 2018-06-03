import chai from 'chai'
import axios from 'axios'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as FriendshipRequest from '../../src/models/friendship-request'
import app from '../../src/app.js'


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
    before(() => db.clear(FriendshipRequest.name))
    afterEach(() => db.clear(FriendshipRequest.name))
  
    it('get requests', async () => {
      await FriendshipRequest.create(ids[0], selfId)
      await FriendshipRequest.create(ids[1], selfId)

      const response = await axios.get(requestRoute, { headers })
      const requesters = response.data

      should.exist(requesters)
      requesters.should.be.an('array').that.has.length(2)
      requesters.forEach(requester => ids.includes(requester).should.be.true)
    })
  
    it('request friendship', async () => {
      await Promise.all(ids.map(async id => {
        await axios.post(requestRoute, { requestedId: id }, { headers })
        
        const requesters = await FriendshipRequest.findAll(id)
        requesters.should.be.an('array').that.has.length(1)
        requesters.should.include(selfId)
      }))
    })

    it('cancel friendship', async () => {
      await FriendshipRequest.create(selfId, ids[0])
      await FriendshipRequest.create(selfId, ids[1])
      await FriendshipRequest.create(selfId, ids[2])

      await Promise.all(ids.map(async id => {
        const response = await axios.delete(`${requestRoute}/${id}`, { headers })
        const success = response.data
        should.exist(success)
        success.should.be.a('boolean').that.is.true

        const requesters = await FriendshipRequest.findAll(selfId)
        requesters.should.be.empty
      }))
    })
  })
})
