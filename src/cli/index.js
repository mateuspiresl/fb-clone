import * as User from '../models/user'
import * as Post from '../models/post'
import readline from 'readline'


/* UTIL */

const cl = readline.createInterface( process.stdin, process.stdout )
const question = function(q) {
    return new Promise( (res, rej) => {
        cl.question( q, answer => {
            res(answer)
        })
    })
}

function splitInput(input) {
  return input.trim().split(/,\s?/)
}

/* DATA */

// Logged user ID
let selfId = null


/* ROUTES */

async function authenticationScreen() {
  console.log('\n\nwhere am I? -> authenticationScreen')

  const text = `
    1. Sign Up
    2. Sign In
    3. Encerrar
  > `

  const options = {
    1: signUp,
    2: signIn,
    3: function() {
      console.log('Obrigado por usar!')
      process.exit()
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    authenticationScreen()
  }
}

async function signUp() {
  console.log('\n\nwhere am I? -> signUp')
  console.log('register')

  const text = `
    <Nome de usuário>, <Senha>, <Nome>
  > `

  const input = await question(text)
  console.log('register', input)

  const fields = splitInput(input)
  await User.create(...fields)
  console.log('Você se registrou.', fields)

  authenticationScreen()
}

async function signIn() {
  console.log('\n\nwhere am I? -> signIn')

  const text = `
    <Nome de usuário>, <Senha>
  > `

  const input = await question(text)
  const fields = splitInput(input)
  selfId = await User.matchCredencials(...fields)

  selfFeedScreen()
}

async function selfFeedScreen() {
  console.log('\n\nwhere am I? -> selfFeedScreen')

  const text = `
    Você está logado. O que deseja fazer?
    1. Ver feed
    2. Criar um post
    3. Navegar para sessão de Usuarios
    4. Navegar para sessão de Grupos
    5. Deslogar
  > `

  const options = {
    1: function() {

      postings = [
        {'amigo1': 'Que dia legal.'},
        {'amigo2': 'Que dia ruim.'},
        {'amigo1': 'Que dia indiferente.'},
      ]
      
      // TODO: List real postings [IM]
      console.log('\n\n', postings, '\n\n')
      
      selfFeedScreen()
    },
    2: createFeedPost,
    3: usersSectionScreen,
    4: groupsSectionScreen,
    5: function() {
      console.log('Você foi deslogado.')
      authenticationScreen()
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    selfFeedScreen()
  }
}

async function createFeedPost() {
  console.log('\n\nwhere am I? -> createFeedPost')
  
  const text = `
    <text>, <image_url? -> optional>
  > `

  const input = await question(text)
  const fields = splitInput(input)
  console.log('\n\n', fields, '\n\n')

  selfFeedScreen()
}

//
// Users logic [IM]
//

async function usersSectionScreen() {
  console.log('\n\nwhere am I? -> usersSectionScreen')

  const text = `
    Você está na sessão de Usuários. O que deseja fazer?
    1. Voltar para meu feed
    2. Listas usuários que são meus amigos
    3. Listar todos os usuários
    4. Navegar para o perfil de um usuário
  > `

  const options = {
    1: function() {
      console.log('Voltando para meu feed.')
      selfFeedScreen()
    },
    2: function() {
      // TODO: fetch real data [IM]
      console.log(['user01'])
      usersSectionScreen()
    },
    3: function() {
      // TODO: fetch real data [IM]
      console.log(['user01', 'user02'])
      usersSectionScreen()
    },
    4: function() {
      // perform all checks before navigating (user is friend? Is blocked? Exists?) [IM]

      // userProfileScreen() // working [IM]
      friendUserProfileScreen() // working [IM]
      // blockedUserProfileScreen() // working [IM]
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    usersSectionScreen()
  }
}

async function userProfileScreen() {
  console.log('\n\nwhere am I? -> userProfileScreen')

  const text = `
    Você está no perfil de usuário. O que deseja fazer?
    1. Solicitar amizade
    2. Bloquear usuário
    3. Voltar para a sessão de Usuários
  > `

  const options = {
    1: function() {
      console.log('Amizade solicitada, voltando para a sessão de Usuários.')
      usersSectionScreen()
    },
    2: function() {
      console.log('Usuário bloqueado, voltando para a sessão de Usuários.')
      usersSectionScreen()
    },
    3: function() {
      console.log('Voltando para a sessão de Usuários.')
      usersSectionScreen()
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    usersSectionScreen()
  }
}

async function friendUserProfileScreen() {
  console.log('\n\nwhere am I? -> friendUserProfileScreen')
  
  const text = `
    Você está no perfil de um Amigo. O que deseja fazer?
    1. Ver o feed do meu amigo
    2. Criar um post no feed do meu amigo
    3. Remover amizade
    4. Bloquear
    5. Voltar para a sessão de Usuários
  > `

   const options = {
    1: function() {
      console.log('Vendo feed do amigo.')
      // TODO: fetch real data [IM]
      console.log(['friendPosting01', 'friendPosting02'])
      friendUserProfileScreen()
    },
    2: async function() {
      // TODO: call posting creation method passing user as param [IM]
      // TODO: extract this to a method [IM]
      const friendPostingText = `
        <post_text>, <post_picture>
      > `
      const input = await question(friendPostingText)
      const fields = splitInput(input)

      console.log('Post criado no mural do seu amigo.', fields)
      friendUserProfileScreen()
    },
    3: function() {
      console.log('Amizade removida, voltando para a o perfil deste mesmo usuário.')
      userProfileScreen() // passing same ID, but not friends anymore [IM]
    },
    4: function() {
      console.log('Amizade desfeita e usuário bloqueado. Voltando para a sessão de usuários').
      usersSectionScreen()
    },
    5: function() {
      console.log('Voltando para a sessão de Usuários.')
      usersSectionScreen()
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    usersSectionScreen()
  }
}

async function blockedUserProfileScreen() {
  console.log('\n\nwhere am I? -> blockedUserProfileScreen')

  const text = `
    Você está no perfil de usuário bloqueado. O que deseja fazer?
    1. Desbloquear este usuário
    3. Voltar para a sessão de Usuários
  > `

  const options = {
    1: function() {
      console.log('O usuário foi desbloqueado.')
      userProfileScreen()
    },
    2: function() {
      console.log('Voltando para a sessão de Usuários.')
      usersSectionScreen()
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    usersSectionScreen()
  }
}

//
// Group logic [IM]
//

async function groupsSectionScreen() {
  console.log('\n\nwhere am I? -> groupsSectionScreen')

  const text = `
    Você está na sessão de Grupos. O que deseja fazer?
    1. Voltar para meu feed
    2. Listas grupos que sou membro
    3. Listar todos os groups
    4. Navegar para um grupo
    5. Criar um grupo
  > `

  const options = {
    1: function() {
      console.log('Voltando para meu feed.')
      selfFeedScreen()
    },
    2: function() {
      // TODO: fetch real data [IM]
      console.log(['group01'])
      groupsSectionScreen()
    },
    3: function() {
      // TODO: fetch real data [IM]
      console.log(['group01', 'group02', 'group03'])
      groupsSectionScreen()
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
      
      // groupNotAsMemberScreen()
      groupAsMemberScreen()
    },
    5: groupCreationScreen    
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    groupsSectionScreen()
  }
}

async function groupCreationScreen() {
  console.log('\n\nwhere am I? -> groupCreationScreen')

  const text = `
    Você está na tela de Criação de Grupo. O que deseja fazer?
    1. Cancelar a criação do grupo e voltar
    2. Criar um grupo
  > `

  const options = {
    1: function() {
      console.log('Voltando para a sessão de Grupos.')
      groupsSectionScreen()
    },
    2: createGroup
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    groupCreationScreen()
  }
}

async function createGroup() {
  console.log('\n\nwhere am I? -> groupCreationScreen')

  const text = `
    <name>, <description>, <picture_url>
  > `

  const input = await question(text)
  const fields = splitInput(input)

  console.log('Você criou um grupo.', fields)
  groupsSectionScreen()
}

async function groupNotAsMemberScreen() {
  console.log('\n\nwhere am I? -> groupNotAsMemberScreen')

  // What if the request was already made? This should to be
  // checked to decide which path should be followed [IM]
  const alreadyRequested = Math.random() >= 0.5;

  const membershipNotRequestedYetText = `
    Você está na tela de um Grupo, porém ainda não é membro. O que deseja fazer?
    1. Voltar para a sessão de Grupos
    2. Solicitar participação
  > `

  const membershipAlreadyRequestedText = `
    Você está na tela de um Grupo, porém ainda não é membro. O que deseja fazer?
    1. Voltar para a sessão de Grupos
    2. Cancelar minha solicitação de participação
  > `

  const text = alreadyRequested ? membershipAlreadyRequestedText : membershipNotRequestedYetText

  const options = {
    1: function() {
      console.log('Voltando para a sessão de Grupos.')
      groupsSectionScreen()
    },
    2: function() {
      const message = alreadyRequested ? 'Sua solicitação foi cancelada com sucesso.' : 'Sua solicitação foi enviada aos administradores.'
      console.log(message)
      groupsSectionScreen()
    }
  }

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    groupCreationScreen()
  }
}

async function groupAsMemberScreen() {
  // This method can and should be fragmented into three smaller methods.
  // one for default member, one for admin member, one for group owner. [IM]
  console.log('\n\nwhere am I? -> groupAsMemberScreen')

  const text = `
    Você está na tela de um Grupo como um membro simples ativo. O que deseja fazer?
    1. Listar postagens
    2. Listar membros
    3. Criar um post
    4. Responder a um post
    5. Voltar para a sessão de Grupos
  > `

  const defaultOptions = {
    1: function() {
      // TODO: fetch real data [IM]
      postings = [
        {'membro1': 'Que grupo legal.'},
        {'membro2': 'Que grupo ruim.'},
        {'membro3': 'Que grupo indiferente.'},
      ]
      console.log(postings)
      groupAsMemberScreen()
    },
    2: function() {
      // TODO: fetch real data [IM]
      console.log(['member1', 'member2', 'member3'])
      groupAsMemberScreen()
    },
    3: createGroupPost,
    4: replyGroupPost,
    5: function() {
      console.log('Voltando para a sessão de Grupos.')
      groupsSectionScreen()
    }
  }

  const adminOptions = {
    ...defaultOptions,
    6: function() {
      console.log('Banindo usuário')
      console.warn('Not implemented yet')
      process.exit()
    }
  }

  const ownerOptions = {
    ...adminOptions,
    7: function() {
      console.log('Deletando grupo')
      console.warn('Not implemented yet')
      process.exit()
    }
  }

  // Should decide which options can we expose based on user permissions [IM]
  // if (hasPermision...)
  //   const options = adminOptions
  //   const options = ownerOptions
  const options = options // keeping as default by now [IM]

  const input = await question(text)

  try { return options[input]() } catch (_) {
    console.log('Opção inválida...')
    groupCreationScreen()
  }
}

async function createGroupPost() {
  console.log('\n\nwhere am I? -> createGroupPost')
  
  const text = `
    <group_post_text>, <image_url? -> optional>
  > `

  const input = await question(text)
  const fields = splitInput(input)
  console.log('\n\n', "Criando post", fields, '\n\n')
  groupAsMemberScreen()
}

async function replyGroupPost() {
  console.log('\n\nwhere am I? -> replyGroupPost')
  
  const text = `
    <group_post_reply_text>
  > `

  const input = await question(text)
  const fields = splitInput(input)
  console.log('\n\n', "Criando resposta a post:", fields, '\n\n')
  groupAsMemberScreen()
}

authenticationScreen()
