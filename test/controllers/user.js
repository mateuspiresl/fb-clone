import chai from 'chai'
import axios from 'axios'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import app from '../../src/app.js'


const should = chai.should()
const db = new Database()
const api = 'http://localhost:5000'
const authRoute = `${api}/auth`
const userRoute = `${api}/user`
let ids = [], token

function create(n) {
  const data = [`u${n}`, `p${n}`, `n${n}`]
  return User.create(...data)
}

function getHeaders() {
  return { Authorization: `Bearer ${token}` }
}

function validate(user, n) {
  should.exist(user)
  user.should.be.an('object')
  user.should.have.property('id')
  user.should.have.property('username')
  user.should.have.property('name')
  
  if (n === undefined) {
    const index = ids.indexOf(user.id)
    should.exist(index)
    index.should.be.above(-1)
    n = index + 1
  }

  should.exist(n)
  user.username.should.equal(`u${n}`)
  user.name.should.equal(`n${n}`)
}

describe('Controllers | User', () => {
  let server

  before((done) => server = app.listen(5000, done))

  beforeEach(async function () {
    await db.clear('user')
    ids = await Promise.all([1, 2].map(n => create(n)))

    const credencials = { username: `u0`, password: `p0`, name: `n0` }
    const response = await axios.post(`${authRoute}/register`, credencials)
    token = response.data.token
  })

  after(async function () {
    await db.clear('user')
    db.close()
    server.close()
  })

  it('get self', async function () {
    const response = await axios.get(`${userRoute}/me`, { headers: getHeaders() })
    validate(response.data, 0)
  })

  it('get user', async function () {
    await Promise.all(ids.map(async id => {
      const response = await axios.get(`${userRoute}/${id}`, { headers: getHeaders() })
      validate(response.data)
    }))
  })

  it('get all users', async function () {
    const response = await axios.get(userRoute, { headers: getHeaders() })
    const users = response.data

    should.exist(users)
    users.should.be.an('array').that.has.length(2)
    users.forEach(user => validate(user))
  })
})
