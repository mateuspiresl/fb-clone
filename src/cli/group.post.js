import { ask, handle as handleInput } from './input'
import * as Post from '../models/post'
import * as GroupPost from '../models/group-post'
import * as Comment from '../models/comment'
import * as CommentAnswer from '../models/comment-answer'

function logWhere(method) {
  console.log('\n---- group.post.' + method)
}

export default async function GroupPostSection(group, next) {
  logWhere('section')

  const current = () => GroupPostSection(group, next)
  
  const posts = await GroupPost.findByGroup(group.id)
  console.log('Posts:', posts)

  const text = `
    Você está na sessão de posts do grupo ${group.name}.
    1. Voltar para o grupo
    2. Criar post
    3. Abrir post
    4. Listar posts`

  const options = {
    // Voltar
    1: next,
    // Criar post
    2: async () => {
      const fields = await ask(['content', 'picture'])
      const postId = await GroupPost.create(global.selfId, group.id, fields)
      viewPost(group, postId, current)
    },
    // Abrir post
    3: async () => {
      const postId = await ask('postId')
      viewPost(group, postId, current)
    },
    // Listar posts
    4: async () => {
      const posts = await GroupPost.findByGroup(group.id)
      console.log('Posts:', posts)
      current()
    }
  }

  handleInput(text, options, current)
}

async function viewPost(group, post, next) {
  logWhere('viewPost')

  if (!post) {
    console.log('Post não encontrado.')
    return next()
  }
  
  if (typeof post === 'string') {
    post = await Post.findById(global.selfId, post)

    if (post) {
      console.log('Post:', post)
    } else {
      console.log('Post não encontrado.')
      return next()
    }
  }

  const current = () => viewPost(group, post, next)

  const text = `
    Você está em um post de ${post.user_name} no grupo ${group.name}.
    1. Voltar para o post
    2. Apagar post
    2. Ver comentários
    3. Comentar
    4. Apagar comentário
    5. Ver respostas de um comentário
    4. Responder um comentário
    6. Apagar resposta de comentário`

  const options = {
    // Voltar
    1: next,
    // Apagar post
    2: async () => {
      if (await GroupPost.remove(global.selfId, post.id, group.id)) {
        console.log(`Post de ${post.user_name} removido do grupo ${group.name}.`)
      } else {
        console.log('Erro ao processar remoção de post.')
      }

      next()
    },
    // Ver comentários
    3: async () => viewComments(post.id, current),
    // Comentar
    4: async () => {
      await Comment.create(global.selfId, post.id, await ask('comment'))
      viewComments(post.id, current)
    },
    // Apagar comentário
    5: async () => {
      if (await Comment.remove(global.selfId, await ask('commentId'))) {
        console.log('Comentário removido.')
      } else {
        console.log('Erro ao processar remoção de comentário.')
      }

      current()
    },
    // Ver respostas de um comentário
    6: async () => viewCommentsAnswers(await ask('commentId'), current),
    // Responder um comentário
    7: async () => {
      const { commentId, answer } = await ask(['commentId', 'comment'])
      await CommentAnswer.create(global.selfId, commentId, answer)
      viewCommentsAnswers(commentId, current)
    },
    // Apagar resposta de comentário
    8: async () => {
      if (await Comment.remove(global.selfId, await ask('answerId'))) {
        console.log('Resposta removida.')
      } else {
        console.log('Erro ao processar remoção de resposta.')
      }

      current()
    }
  }

  handleInput(text, options, () => viewPost(group, post.id, next))
}

async function viewComments(postId, next) {
  const comments = await Comment.findByPost(postId)
  console.log('Comentários:', comments)
  next()
}

async function viewCommentsAnswers(commentId, next) {
  const answers = await Comment.findByPost(commentId)
  console.log('Respostas:', answers)
  next()
}
