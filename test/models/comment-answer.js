import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Post from '../../src/models/post'
import * as Comment from '../../src/models/comment'
import * as CommentAnswer from '../../src/models/comment-answer'
import { logAllowed } from '../../src/config'
import '../index'


const should = chai.should()
const db = new Database()
const names = ['A', 'B', 'C']
const contents = ['a', 'b', 'c']

let ids = []
let comments = []
let selfId = null
let postId = null
let commentId = null

function insertUser(name) {
  return User.create(`${name}n`, `${name}p`, name)
}

function validate(comment, data) {
  should.exist(comment)
  comment.should.have.property('id')
  comment.should.be.an('object')
  comment.should.have.property('user_id')
  comment.should.have.property('comment_id')
  comment.should.have.property('content')
  comment.should.have.property('user_name')
  comment.should.have.property('user_photo')

  const {
    id,
    userId,
    commentId,
    content,
    name
  } = data
  
  if (id) comment.id.should.equal(id)
  if (userId) comment.userId.should.equal(userId)
  if (commentId) comment.commentId.should.equal(commentId)
  if (content) comment.content.should.equal(content)
  if (name) comment.user_name.should.equal(name)
  if (comment.user_photo) comment.user_photo.should.match(/p$/)
}

describe.only('Models | Comment Answer', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)
    selfId = await insertUser('Z')

    // Create the post for testing
    postId = await Post.create(selfId, { content: 'post content' })

    // Create a comment for testing
    commentId = await Comment.create(selfId, postId, { content: 'post content' })
  })

  afterEach(() => db.clear(CommentAnswer.name))
  
  after(async () => {
    await db.clear(Comment.name)
    await db.clear(Post.name)
    await db.clear(User.name)
  })

  it('create answer', async () => {
    const content = 'answer content'
    const answers = await ids.mapAsync(async (id, userId) => ({
      answerId: await CommentAnswer.create(id, commentId, content),
      userName: names[userId]
    }))

    await answers.mapAsync(async ({ answerId, userName }) => {
      should.exist(answerId)
      answerId.should.be.a('string')

      const answer = await CommentAnswer.findById(answerId)
      validate(answer, {
        postId,
        answerId,
        content,
        name: userName
      })
    })
  })

  it('remove', async () => {
    const content = 'answer content'
    const comments = await ids.mapAsync(async id => ({
      userId: id,
      answerId: await CommentAnswer.create(id, commentId, content)
    }))

    await comments.mapAsync(async ({ userId, answerId }) =>
      (await CommentAnswer.remove(userId, answerId)).should.be.true
    )
  })

  it('not authors should not remove an answer', async () => {
    const content = 'answer content'
    const comments = await ids.mapAsync(id => 
      CommentAnswer.create(id, commentId, content)
    )

    await comments.mapAsync(async answerId =>
      (await CommentAnswer.remove(selfId, answerId)).should.be.false
    )
  })
})
