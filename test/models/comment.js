import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Post from '../../src/models/post'
import * as Comment from '../../src/models/comment'
import { logAllowed } from '../../src/config'
import '../index'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']
const contents = ['a', 'b', 'c']

let ids = []
let selfId = null
let postId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

function validate(comment, data) {
  should.exist(comment)
  comment.should.have.property('id')
  comment.should.be.an('object')
  comment.should.have.property('user_id')
  comment.should.have.property('post_id')
  comment.should.have.property('content')
  comment.should.have.property('user_name')
  comment.should.have.property('user_photo')

  const {
    id,
    userId,
    postId,
    content,
    name
  } = data
  
  if (id) comment.id.should.equal(id)
  if (userId) comment.userId.should.equal(userId)
  if (postId) comment.postId.should.equal(postId)
  if (content) comment.content.should.equal(content)
  if (name) comment.user_name.should.equal(name)
  if (comment.user_photo) comment.user_photo.should.match(/p$/)
}

describe.only('Models | Comment', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)
    selfId = await insertUser('Z')

    // Create the post for testing
    postId = await Post.create(selfId, { content: 'post content' })
  })

  afterEach(() => db.clear(Comment.name))
  
  after(async () => {
    await db.clear(Post.name)
    await db.clear(User.name)
  })

  it('create comment', async () => {
    const content = 'c'
    const commentsIds = await ids.mapAsync(id => Comment.create(id, postId, content))

    await commentsIds.mapAsync(async commentId => {
      should.exist(commentId)
      commentId.should.be.a('string')

      const comment = await Comment.findByPost(postId, commentId)
      should.exist(comment)
    })
  })

  it('find comments by post', async () => {
    await ids.mapAsync(async id =>
      await contents.mapAsync(content =>
        Comment.create(id, postId, content)
      )
    )

    const comments = await Comment.findByPost(postId)
    should.exist(comments)
    comments.should.be.an('array')
    comments.should.have.length(ids.length * contents.length)

    const sortedIds = ids.sort()
    sortedIds.forEach((id, userIndex) =>
      comments
        .filter(comment => comment.user_id == id)
        .sort((a, b) => a.content.charCodeAt(0) - b.content.charCodeAt(0))
        .forEach((comment, commentIndex) =>
          validate(comment, {
            user_id: sortedIds[userIndex],
            content: contents[commentIndex]
          })
        )
    )
  })

  it('remove', async () => {
    const commentsIds = await contents.mapAsync(content =>
      Comment.create(selfId, postId, content)
    )

    await commentsIds.mapAsync(async id =>
      (await Comment.remove(selfId, id)).should.be.true
    )
  })

  it('not authors should not remove a comment', async () => {
    const commentsIds = await contents.mapAsync(content =>
      Comment.create(selfId, postId, content)
    )

    await commentsIds.mapAsync(async id =>
      (await Comment.remove(ids[0], id)).should.be.false
    )
  })
})
