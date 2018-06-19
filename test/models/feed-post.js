/* global describe, it, before, after, afterEach */

import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Friendship from '../../src/models/friendship'
import * as Post from '../../src/models/post'
import * as FeedPost from '../../src/models/feed-post'
import '../index'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']

let ids = []
let selfId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

function validate(post, data) {
  should.exist(post)
  post.should.be.an('object')
  post.should.have.property('id')
  post.should.have.property('author_id')
  post.should.have.property('owner_id')
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

describe('Models | Feed Post', () => {
  before(async () => {
    // Create the users for testing
    ids = await names.mapAsync(name => insertUser(name))
    selfId = await insertUser('Z')

    await ids.mapAsync(id => Friendship.create(selfId, id))
  })

  afterEach(async () => {
    await db.clear(FeedPost.name)
    await db.clear(Post.name)
  })
  
  after(async () => {
    await db.clear(Friendship.name)
    await db.clear(User.name)
  })

  it('create post', async () => {
    const content = 'c'

    const postsIds = await Promise.all([
      FeedPost.create(selfId, selfId, { content }),
      ...ids.map(id => FeedPost.create(id, selfId, { content }))
    ])
    
    postsIds.forEach(postId => {
      should.exist(postId)
      postId.should.be.an('string')
    })
  })

  it('a user that is not a friend cannot create a post on another user\'s feed', async () => {
    const notFriend = insertUser('not_a_friend')

    await ids.mapAsync(async id => {
      try {
        if (!(await FeedPost.create(notFriend, id, { content: 'c' }))) {
          throw new Error('Not allowed')
        }
      } catch (error) {
        return null
      }

      should.fail()
    })
  })

  it('find posts by owner', async () => {
    const contents = ['a', 'b', 'c']
    
    await ids.mapAsync((authorId, index) =>
      FeedPost.create(authorId, selfId, { content: contents[index % contents.length] })
    )

    const posts = await FeedPost.findByOwner(selfId)
    should.exist(posts)
    posts.should.be.an('array').that.has.length(ids.length)

    posts.forEach((post) => {
      ids.should.include(post.author_id)
      contents.should.include(post.content)

      validate(post, {
        name: names[ids.indexOf(post.author_id)]
      })
    })
  })

  it('remove', async () => {
    const postsIds = await ids.mapAsync(id =>
      FeedPost.create(selfId, id, { content: 'c' })
    )

    await ids.mapAsync(async id =>
      (await FeedPost.findByOwner(id)).should.be.an('array').that.has.length(1)
    )

    await postsIds.mapAsync(async id =>
      (await Post.remove(selfId, id)).should.be.true
    )

    await ids.mapAsync(async id =>
      (await FeedPost.findByOwner(id)).should.be.an('array').that.has.length(0)
    )
  })
})
