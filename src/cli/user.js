import { ask, handle as handleInput } from './input'
import GroupSection from './group'
import * as User from '../models/user'
import * as FeedPost from '../models/feed-post'
import * as Friendship from '../models/friendship'
import * as FriendshipRequest from '../models/friendship-request'
import * as UserBlocking from '../models/user-blocking'


function logResult(result, success, fail) {
  if (result) {
    console.log(success)
  } else {
    console.error(fail)
  }
}

export default async function UserSection(next) {
  const current = () => UserSection(next)
  const user = await User.findById(global.selfId, global.selfId)
  const text = `
    Olá, ${user.name}.
    1. Ver meu feed
    2. Criar um post
    3. Navegar para sessão de Usuários
    4. Navegar para sessão de Grupos
    5. Deslogar`

  const options = {
    1: async () => {
      const posts = await FeedPost.findByOwner(global.selfId, global.selfId)
      console.log('Posts:', posts.map(_=>_))
      current()
    },
    2: async () => {
      const fields = await ask(['content', 'photo', 'isPublic'])
      fields.isPublic = fields.isPublic == '1'

      const postId = await FeedPost.create(global.selfId, global.selfId, fields)
      console.log(`Post ${postId} criado.`)
      current()
    },
    3: () => sectionScreen(current),
    4: () => GroupSection(current),
    5: () => {
      console.log('Usuário deslogado.')
      global.selfId = null
      next()
    }
  }

  handleInput(text, options, current)
}

export async function sectionScreen(next) {
  const current = () => sectionScreen(next)
  const { selfId } = global

  const text = `
    Você está na sessão de usuários. O que deseja fazer?
    1. Voltar para meu feed
    2. Listar meus amigos
    3. Listar todos os usuários
    4. Ver perfil de um usuário
    5. Listar solicitações de amizade`

  const options = {
    1: next,
    2: async () => {
      const friends = await Friendship.findAll(selfId)
      console.log('Friends:', friends.map(_=>_))
      current()
    },
    3: async () => {
      const users = await User.findAll(selfId)
      console.log('Users:', users.map(_=>_))
      current()
    },
    4: async () => {
      const userId = await ask('id')
      profileScreen(userId, current)
    },
    5: async () => {
      const users = await FriendshipRequest.findAll(selfId)
      console.log('Users:', users.map(_=>_))
      current()
    }
  }

  handleInput(text, options, current)
}

export async function profileScreen(userId, next) {
  const { selfId } = global
  const user = await User.findById(selfId, userId)

  if (user) {
    console.log('Profile:', user)
  
    let resturnValues
  
    if (user.is_friend) {
      resturnValues = profileScreenAsFriend(user, next)
    } else if (user.is_blocked) {
      resturnValues = profileScreenAsBlocker(user, next)
    } else if (user.is_friendship_requester) {
      resturnValues = profileScreenAsFriendshipRequested(user, next)
    } else if (user.has_friendship_requested) {
      resturnValues = profileScreenAsFriendshipRequester(user, next)
    } else {
      resturnValues = profileScreenAsCommon(user, next)
    }
  
    handleInput(...resturnValues, next)
  } else {
    console.log(`Usuário ${userId} não encontrado.`)
    next()
  }
}

async function acceptFriendshipRequest(userId) {
  const removed = await FriendshipRequest.remove(userId, global.selfId)
  return removed && await Friendship.create(global.selfId, userId)
}

async function viewFeed(user, next) {
  const posts = await FeedPost.findByOwner(global.selfId, user.id)
  console.log('Feed:', posts)
  next()
}

function profileScreenAsCommon(user, next) {
  const current = () => profileScreen(user.id, next)
  const { selfId } = global

  const text = `
    Você está no perfil de ${user.name}.
    1. Ver o feed
    2. Solicitar amizade
    3. Bloquear
    4. Voltar para a sessão de usuários`

  const options = {
    1: () => viewFeed(user, current),
    2: async () => {
      const requested = await FriendshipRequest.create(selfId, user.id)

      logResult(requested, `Você solicitou a amizade de ${user.name}.`,
        `Erro ao processar a solicitação de amizade para ${user.name}.`)
      current()
    },
    3: async () => {
      const blocked = await UserBlocking.create(global.selfId, user.id)

      logResult(blocked, `Você bloqueou ${user.name}.`,
        `Erro ao processar o bloqueio de ${user.name}.`)
      current()
    },
    4: next
  }
  
  return [text, options]
}

function profileScreenAsFriend(user, next) {
  const current = () => profileScreen(user.id, next)
  const { selfId } = global

  const text = `
    Você está no perfil de ${user.name} (amigo).
    1. Ver o feed
    2. Criar post
    3. Remover amizade
    4. Voltar para a sessão de usuários`

  const options = {
    1: () => viewFeed(user, current),
    2: async () => {
      const fields = await ask(['content', 'picture'])
      const postId = await FeedPost.create(selfId, user.id, fields)

      console.log(`Post ${postId} criado no mural de ${user.name}.`)
      current()
    },
    3: async () => {
      await Friendship.remove(selfId, user.id)
      console.log(`A sua amizade com ${user.name} foi removida.`)
      current()
    },
    4: next
  }

  return [text, options]
}

function profileScreenAsBlocker(user, next) {
  const current = () => profileScreen(user.id, next)

  const text = `
    Você está no perfil de ${user.name} (bloqueado).
    1. Desbloquear
    2. Voltar para a sessão de usuários`

  const options = {
    1: async () => {
      const unblocked = await UserBlocking.remove(global.selfId, user.id)

      logResult(unblocked, `Você desbloqueou ${user.name}.`,
        `Erro ao processar o desbloqueio de ${user.name}.`)
      current()
    },
    2: next
  }

  return [text, options]
}

function profileScreenAsFriendshipRequester(user, next) {
  const current = () => profileScreen(user.id, next)
  const { selfId } = global

  const text = `
    Você está no perfil de ${user.name}.
    1. Ver o feed
    2. Cancelar solicitação de amizade
    3. Bloquear
    4. Voltar para a sessão de usuários`

  const options = {
    1: () => viewFeed(user),
    2: async () => {
      const requested = await FriendshipRequest.remove(selfId, user.id)

      logResult(requested, `Você desfez a solicitção de amizade para ${user.name}.`,
        `Erro ao tentar desfazer a solicitação de amizade para ${user.name}.`)
      current()
    },
    3: async () => {
      const undoneRequest = await FriendshipRequest.remove(selfId, user.id)
      
      if (undoneRequest) {
        const blocked = await UserBlocking.create(selfId, user.id)
  
        logResult(blocked, `Você desbloqueou ${user.name}.`,
          `Erro ao processar o bloqueio de ${user.name}.`)
      } else {
        console.error(`Erro ao processar o bloqueio de ${user.name}.`)
      }

      current()
    },
    4: next
  }
  
  return [text, options]
}

function profileScreenAsFriendshipRequested(user, next) {
  const current = () => profileScreen(user.id, next)
  const { selfId } = global

  const text = `
    Você está no perfil de ${user.name}.
    1. Ver o feed
    2. Aceitar solicitação de amizade
    3. Rejeitar solicitação de amizade
    4. Bloquear
    5. Voltar para a sessão de usuários`

  const options = {
    1: () => viewFeed(user, current),
    2: async () => {
      const accepted = await acceptFriendshipRequest(user.id)

      logResult(accepted, `Você aceitou a solicitção de amizade de ${user.name}.`,
        `Erro ao tentar aceitar a solicitação de amizade de ${user.name}.`)
      current()
    },
    3: async () => {
      const accepted = await FriendshipRequest.remove(user.id, global.selfId)

      logResult(accepted, `Você rejeitou a solicitção de amizade de ${user.name}.`,
        `Erro ao tentar rejeitar a solicitação de amizade de ${user.name}.`)
      current()
    },
    4: async () => {
      const undoneRequest = await FriendshipRequest.remove(user.id, selfId)
      
      if (undoneRequest) {
        const blocked = await UserBlocking.create(selfId, user.id)
  
        logResult(blocked, `Você desbloqueou ${user.name}.`,
          `Erro ao processar o bloqueio de ${user.name}.`)
      } else {
        console.error(`Erro ao processar o bloqueio de ${user.name}.`)
      }

      current()
    },
    5: next
  }

  return [text, options]
}
