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

function validate(answer, data) {
  should.exist(answer)
  answer.should.have.property('id')
  answer.should.be.an('object')
  answer.should.have.property('user_id')
  answer.should.have.property('comment_id')
  answer.should.have.property('content')
  answer.should.have.property('user_name')
  answer.should.have.property('user_photo')

  const {
    id,
    userId,
    commentId,
    content,
    name
  } = data
  
  if (id) answer.id.should.equal(id)
  if (userId) answer.user_id.should.equal(userId)
  if (commentId) answer.comment_id.should.equal(commentId)
  if (content) answer.content.should.equal(content)
  if (name) answer.user_name.should.equal(name)
  if (answer.user_photo) answer.user_photo.should.match(/p$/)
}

describe('Models | Comment Answer', () => {
  before(async () => {
    // Create the users for testing
    ids = await names.mapAsync(name => insertUser(name))
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
    const answersMeta = {}
    
    await ids.mapAsync(async (id, userIndex) => {
      const answerId = await CommentAnswer.create(id, commentId, contents[userIndex])
      should.exist(answerId)
      answerId.should.be.a('string')

      answersMeta[answerId] = userIndex
    })
    
    const answers = await CommentAnswer.findByComment(commentId)
    answers.forEach(answer =>
      answer.user_id.should.equal(ids[answersMeta[answer.id]])
    )
  })

  it('find answers by comment', async () => {
    await ids.mapAsync(async id =>
      await contents.mapAsync(content =>
        CommentAnswer.create(id, commentId, content)
      )
    )

    const answers = await CommentAnswer.findByComment(commentId)
    should.exist(answers)
    answers.should.be.an('array')
    answers.should.have.length(ids.length * contents.length)

    ids.forEach((id, userIndex) => {
      answers
        .filter(answer => answer.user_id == id)
        .sort((a, b) => a.content.charCodeAt(0) - b.content.charCodeAt(0))
        .forEach((answer, answerIndex) =>
          validate(answer, {
            userId: id,
            commentId: commentId,
            content: contents[answerIndex],
            name: names[userIndex]
          })
        )
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
