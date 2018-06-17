import { ask, handle as handleInput } from './input'


function logWhere(method) {
  console.log('\n---- group.' + method)
}

export async function sectionScreen(next) {
  logWhere('sectionScreen')

  const text = `
    Você está na sessão de Grupos. O que deseja fazer?
    1. Voltar para meu feed
    2. Listas grupos que sou membro
    3. Listar todos os groups
    4. Navegar para um grupo
    5. Criar um grupo`

  const options = {
    1: function() {
      console.log('Voltando para meu feed.')
      next()
    },
    2: function() {
      // TODO: fetch real data [IM]
      console.log(['group01'])
      sectionScreen()
    },
    3: function() {
      // TODO: fetch real data [IM]
      console.log(['group01', 'group02', 'group03'])
      sectionScreen()
    },
    4: async function() {
      // When navigating, there is a route to groups that i am member
      // and routes for groups that i am not an actual member.
      // I guess all the logic to check my relation with the group
      // should be plced here. [IM]
      // chosenId = input()
      // group = Groups.get(byChosenId)
      // const amIMember: Bool = group.checkMembership(withMe)
      // if amIMember:
      // groupScreen(amIMember)
      console.log('Navegando para o grupo escolhido.')
      
      // notAsMemberScreen()
      asMemberScreen()
    },
    5: creationScreen
  }

  handleInput(text, options, sectionScreen)
}

export async function creationScreen() {
  logWhere('creationScreen')

  const text = `
    Você está na tela de Criação de Grupo. O que deseja fazer?
    1. Cancelar a criação do grupo e voltar
    2. Criar um grupo`

  const options = {
    1: function() {
      console.log('Voltando para a sessão de Grupos.')
      sectionScreen()
    },
    2: create
  }

  handleInput(text, options, creationScreen)
}

export async function create() {
  logWhere('create')

  const fields = await ask(['name', 'description', 'picture'])
  console.log(`Você criou o grupo ${fields.name}.`, fields)
  sectionScreen()
}

export async function notAsMemberScreen() {
  logWhere('notAsMemberScreen')

  // What if the request was already made? This should to be
  // checked to decide which path should be followed [IM]
  const alreadyRequested = Math.random() >= 0.5

  const membershipNotRequestedYetText = `
    Você está na tela de um Grupo, porém ainda não é membro. O que deseja fazer?
    1. Voltar para a sessão de Grupos
    2. Solicitar participação`

  const membershipAlreadyRequestedText = `
    Você está na tela de um Grupo, porém ainda não é membro. O que deseja fazer?
    1. Voltar para a sessão de Grupos
    2. Cancelar minha solicitação de participação`

  const text = alreadyRequested ? membershipAlreadyRequestedText : membershipNotRequestedYetText

  const options = {
    1: function() {
      console.log('Voltando para a sessão de Grupos.')
      sectionScreen()
    },
    2: function() {
      const message = alreadyRequested ? 'Sua solicitação foi cancelada com sucesso.' : 'Sua solicitação foi enviada aos administradores.'
      console.log(message)
      sectionScreen()
    }
  }

  handleInput(text, options, creationScreen)
}

export async function asMemberScreen() {
  // This method can and should be fragmented into three smaller methods.
  // one for default member, one for admin member, one for group owner. [IM]
  logWhere('asMemberScreen')

  const text = `
    Você está na tela de um Grupo como um membro simples ativo. O que deseja fazer?
    1. Listar postagens
    2. Listar membros
    3. Criar um post
    4. Responder a um post
    5. Voltar para a sessão de Grupos`

  const defaultOptions = {
    1: function() {
      // TODO: fetch real data [IM]
      console.log([
        {'membro1': 'Que grupo legal.'},
        {'membro2': 'Que grupo ruim.'},
        {'membro3': 'Que grupo indiferente.'},
      ])
      asMemberScreen()
    },
    2: function() {
      // TODO: fetch real data [IM]
      console.log(['member1', 'member2', 'member3'])
      asMemberScreen()
    },
    3: createPost,
    4: commentPost,
    5: function() {
      console.log('Voltando para a sessão de Grupos.')
      sectionScreen()
    }
  }

  // const adminOptions = {
  //   ...defaultOptions,
  //   6: function() {
  //     console.log('Banindo usuário')
  //     console.warn('Not implemented yet')
  //     process.exit()
  //   }
  // }

  // const ownerOptions = {
  //   ...adminOptions,
  //   7: function() {
  //     console.log('Deletando grupo')
  //     console.warn('Not implemented yet')
  //     process.exit()
  //   }
  // }

  // Should decide which options can we expose based on user permissions [IM]
  // if (hasPermision...)

  handleInput(text, defaultOptions, asMemberScreen)
}

export async function createPost() {
  logWhere('createPost')

  const fields = await ask(['content', 'image'])
  console.log('Post criado no grupo TAL.', fields)
  asMemberScreen()
}

export async function commentPost() {
  logWhere('commentPost')
  
  const fields = await ask(['content'])
  console.log('group.commentPost', 'Comentário criado em post.', fields)
  asMemberScreen()
}
