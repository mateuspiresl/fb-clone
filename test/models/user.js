import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'


const should = chai.should()
const db = new Database()
const insertQuery = db.prepare('INSERT INTO `user` (`username`, `password`, `name`) VALUES (:u, :p, :n)')
const names = ['A', 'B', 'C']

async function insertUser(name) {
  const sql = insertQuery({ u: `${name}n`, p: `${name}p`, n: name })
  return (await db.query(sql)).info.insertId
}

function createSelf() {
  return insertUser('Z')
}

describe('Models | User', function () {
  let ids

  beforeEach(async function () {
    await db.clear('user')

    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)
  })

  after(async function () {
    await db.clear('user')
    db.close()
  })

  it('create', async function () {
    const userId = await User.create('Dn', 'Dp', 'D')
    should.exist(userId)
    userId.should.be.a('string')
    
    const id = parseInt(userId)
    id.should.be.above(0)

    const found = await User.findById(await createSelf(), userId)
    should.exist(found)
  })

  it.skip('update', async function () {
    const id = ids[0]

    function validate(user, name, birthdate, photo) {
      should.exist(user)
      user.should.be.an('object')
      user.should.have.property('id').that.equal(id)
      user.should.have.property('name').that.equal('n0')
      user.should.have.property('birthdate').that.equal('b0')
      user.should.have.property('photo').that.equal('p0')
    }

    // name, birthdate, photo
    {
      const data = { name: 'n0', birthdate: 'b0', photo: 'p0' }
      const user = await User.update(id, data)
      validate(user, 'n0', 'b0', 'p0')
    }

    // name, photo
    {
      const data = { name: 'n1', photo: 'p1' }
      const user = await User.update(id, data)
      validate(user, 'n1', 'b0', 'p1')
    }

    // birthdate
    {
      const data = { birthdate: 'b1' }
      const user = await User.update(id, data)
      validate(user, 'n1', 'b1', 'p1')
    }

    // find
    {
      const user = await User.findById(id)
      validate(user, 'n1', 'b1', 'p1')
    }
  })

  it('match credencials', async function () {
    await Promise.all(names.map(async name => {
      const userId = await User.matchCredencials(`${name}n`, `${name}p`)
      should.exist(userId)
      userId.should.be.a('string')
      ids.should.include(userId)
    }))
  })

  it('find one', async function () {
    const selfId = await createSelf()

    await Promise.all(ids.map(async id => {
      const user = await User.findById(selfId, id)
      should.exist(user)
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('username')
      user.should.have.property('name')
      user.id.should.equal(id)
    }))

    const user = await User.findById(selfId, 999999)
    should.not.exist(user)
  })

  it('find all', async function () {
    const users = await User.findAll(await createSelf())

    await should.exist(users)
    users.should.be.an('array').of.length(3)

    users.forEach(user => {
      user.should.be.an('object')
      user.should.have.property('id')
      user.should.have.property('username')
      user.should.have.property('name')

      ids.should.include(user.id)
    })
  })
})
