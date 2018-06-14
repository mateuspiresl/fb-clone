import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Post from '../../src/models/post'
import * as Group from '../../src/models/group'
import * as GroupPost from '../../src/models/group-post'
import * as GroupMembership from '../../src/models/group-membership'
import { logAllowed } from '../../src/config'
import '../index'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

let ids = []
let selfId = null
let groupId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

function validate(post, data) {
  should.exist(post)
  post.should.be.an('object')
  post.should.have.property('id')
  post.should.have.property('author_id')
  post.should.have.property('content')
  post.should.have.property('picture')
  post.should.have.property('is_public')
  post.should.have.property('user_name')
  post.should.have.property('user_photo')

  const {
    id,
    content,
    picture,
    isPublic=true,
    name
  } = data

  post.is_public.should.equal(isPublic ? '1' : '0')
  
  if (post.user_photo) post.user_photo.should.match(/p$/)
  if (id) post.id.should.equal(id)
  if (name) post.user_name.should.equal(name)

  if (content) post.content.should.equal(content)
  else if (content === null) should.not.exist(post.content)
  
  if (picture) post.picture.should.equal(picture)
  else if (picture === null) should.not.exist(post.picture)
}

describe('Models | Group Post', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)

    selfId = await insertUser('Z')
    groupId = await Group.create(selfId, 'gn', 'gd', 'gp')

    await ids.mapAsync(id =>
      GroupMembership.create(selfId, id, groupId)
    )
  })

  afterEach(async () => {
    await db.clear(GroupPost.name)
    await db.clear(Post.name)
  })
  
  after(async () => {
    await db.clear(Group.name)
    await db.clear(GroupMembership.name)
    await db.clear(User.name)
  })

  it('create post', async () => {
    const content = 'c'
    const postId = await GroupPost.create(selfId, groupId, { content })
    should.exist(postId)
    postId.should.be.an('string')
  })

  it('a user that is not a member cannot create a post', async () => {
    try {
      await GroupPost.create(insertUser('uninvited'), groupId, { content: 'c' })
    } catch (error) {
      return null
    }

    should.fail()
  })

  it('find posts by group', async () => {
    const contents = ['a', 'b', 'c']
    const postsIds = {}
    
    await ids.mapAsync(async authorId =>
      postsIds[authorId] = await contents.mapAsync(
        content => GroupPost.create(authorId, groupId, { content })
      )
    )

    const posts = await GroupPost.findByGroup(groupId)
    const nPosts = ids.length * contents.length
    should.exist(posts)
    posts.should.be.an('array').that.has.length(nPosts)

    posts.forEach((post, postIndex) => {
      ids.should.include(post.author_id)
      should.exist(postsIds[post.author_id].remove(post.id))
      contents.should.include(post.content)

      validate(post, {
        name: names[ids.indexOf(post.author_id)]
      })
    })
  })

  it('remove', async () => {
    const contents = ['a', 'b', 'c']
    const postsIds = await contents.mapAsync(content =>
      GroupPost.create(selfId, groupId, { content })
    )

    await postsIds.mapAsync(async id =>
      (await Post.remove(selfId, id)).should.be.true
    )
  })
})
