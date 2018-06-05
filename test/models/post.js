import chai from 'chai'
import Database from '../../src/database'
import * as User from '../../src/models/user'
import * as Post from '../../src/models/post'
import { logAllowed } from '../../src/config'
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

describe.only('Models | Post', () => {
  before(async () => {
    // Create the users for testing
    const insertions = names.map(name => insertUser(name))
    ids = await Promise.all(insertions)

    selfId = await insertUser('Z')
  })

  afterEach(() => db.clear(Post.name))
  after(() => db.clear(User.name))

  it('create post', async () => {
    const content = 'c'
    const postId = await Post.create(selfId, content)
    should.exist(postId)
    postId.should.be.an('string')

    const post = await Post.findById(selfId, postId)
    validate(post, { content, picture: null })
  })

  it('create post with only the picture', async () => {
    const picture = 'p'
    const postId = await Post.create(selfId, null, picture)
    should.exist(postId)
    postId.should.be.an('string')

    const post = await Post.findById(selfId, postId)
    validate(post, { content: null, picture })
  })

  it('should not create post without content or picture', async () => {
    try {
      await Post.create(selfId)
    } catch (error) {
      return
    }

    should.fail()
  })

  it('find by id', async () => {
    const contents = ['a', 'b', 'c']
    const postIds = await contents.mapAsync(content => Post.create(selfId, content))

    await postIds.mapAsync(async (id, index) => {
      const post = await Post.findById(selfId, id)
      validate(post, { id, content: contents[index], picture: null })
    })
  })

  it('find by author', async () => {
    const contents = ['a', 'b', 'c']
    const postIds = {}
    
    await ids.mapAsync(async authorId =>
      postIds[authorId] = await contents.mapAsync(
        content => Post.create(authorId, content)
      )
    )

    await ids.mapAsync(async (authorId, authorIndex) => {
      const posts = await Post.findByAuthor(authorId, authorId)
      should.exist(posts)
      posts.should.be.an('array').that.has.length(contents.length)

      posts.forEach((post, postIndex) =>
        validate(post, {
          content: contents[postIndex],
          picture: null,
          name: names[authorIndex]
        })
      )
    })
  })

  it('remove', async () => {
    const contents = ['a', 'b', 'c']
    const postIds = await contents.mapAsync(content =>
      Post.create(selfId, content)
    )

    await postIds.mapAsync(async id =>
      (await Post.remove(selfId, id)).should.be.true
    )
  })
})
