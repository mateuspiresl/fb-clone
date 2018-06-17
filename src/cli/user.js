import { ask, handle as handleInput } from './input'
import * as groupRoute from './group'


function logWhere(method) {
  console.log('\n---- user.' + method)
}

export async function selfFeedScreen(next) {
  logWhere('selfFeedScreen')

  const text = `
    Você está logado. O que deseja fazer?
    1. Ver feed
    2. Criar um post
    3. Navegar para sessão de Usuarios
    4. Navegar para sessão de Grupos
    5. Deslogar`

  const options = {
    1: () => {
      const postings = [
        {'amigo1': 'Que dia legal.'},
        {'amigo2': 'Que dia ruim.'},
        {'amigo1': 'Que dia indiferente.'},
      ]
      
      // TODO: List real postings [IM]
      console.log('\n\n', postings, '\n\n')
      
      selfFeedScreen()
    },
    2: createFeedPost,
    3: sectionScreen,
    4: () => groupRoute.sectionScreen(selfFeedScreen),
    5: () => {
      console.log('Você foi deslogado.')
      next()
    }
  }

  handleInput(text, options, selfFeedScreen)
}

export async function createFeedPost() {
  logWhere('createFeedPost')
  
  const fields = await ask(['content', 'photo'])
  console.log('group.createFeedPost', fields)

  selfFeedScreen()
}

export async function sectionScreen() {
  logWhere('sectionScreen')

  const text = `
    Você está na sessão de Usuários. O que deseja fazer?
    1. Voltar para meu feed
    2. Listas usuários que são meus amigos
    3. Listar todos os usuários
    4. Navegar para o perfil de um usuário`

  const options = {
    1: () => {
      console.log('Voltando para meu feed.')
      selfFeedScreen()
    },
    2: () => {
      // TODO: fetch real data [IM]
      console.log(['user01'])
      sectionScreen()
    },
    3: () => {
      // TODO: fetch real data [IM]
      console.log(['user01', 'user02'])
      sectionScreen()
    },
    4: () => {
      // perform all checks before navigating (user is friend? Is blocked? Exists?) [IM]

      // selfProfileScreen() // working [IM]
      friendProfileScreen() // working [IM]
      // blockedProfileScreen() // working [IM]
    }
  }

  handleInput(text, options, sectionScreen)
}

export async function selfProfileScreen() {
  logWhere('selfProfileScreen')

  const text = `
    Você está no perfil de usuário. O que deseja fazer?
    1. Solicitar amizade
    2. Bloquear usuário
    3. Voltar para a sessão de Usuários`

  const options = {
    1: () => {
      console.log('Amizade solicitada, voltando para a sessão de Usuários.')
      sectionScreen()
    },
    2: () => {
      console.log('Usuário bloqueado, voltando para a sessão de Usuários.')
      sectionScreen()
    },
    3: () => {
      console.log('Voltando para a sessão de Usuários.')
      sectionScreen()
    }
  }

  handleInput(text, options, sectionScreen)
}

export async function friendProfileScreen() {
  logWhere('friendProfileScreen')
  
  const text = `
    Você está no perfil de um Amigo. O que deseja fazer?
    1. Ver o feed do meu amigo
    2. Criar um post no feed do meu amigo
    3. Remover amizade
    4. Bloquear
    5. Voltar para a sessão de Usuários`

  const options = {
    1: () => {
      console.log('Vendo feed do amigo.')
      // TODO: fetch real data [IM]
      console.log(['friendPosting01', 'friendPosting02'])
      friendProfileScreen()
    },
    2: async () => {
      // TODO: call posting creation method passing user as param [IM]
      // TODO: extract this to a method [IM]

      const fields = await ask(['postContext', 'postPicture'])
      console.log('Post criado no mural do seu amigo.', fields)
      friendProfileScreen()
    },
    3: () => {
      console.log('Amizade removida, voltando para a o perfil deste mesmo usuário.')
      selfProfileScreen() // passing same ID, but not friends anymore [IM]
    },
    4: () => {
      console.log('Amizade desfeita e usuário bloqueado. Voltando para a sessão de usuários')
      sectionScreen()
    },
    5: () => {
      console.log('Voltando para a sessão de Usuários.')
      sectionScreen()
    }
  }

  handleInput(text, options, sectionScreen)
}

export async function blockedProfileScreen() {
  logWhere('blockedProfileScreen')

  const text = `
    Você está no perfil de usuário bloqueado. O que deseja fazer?
    1. Desbloquear este usuário
    2. Voltar para a sessão de Usuários`

  const options = {
    1: () => {
      console.log('O usuário foi desbloqueado.')
      selfProfileScreen()
    },
    2: () => {
      console.log('Voltando para a sessão de Usuários.')
      sectionScreen()
    }
  }

  handleInput(text, options, sectionScreen)
}