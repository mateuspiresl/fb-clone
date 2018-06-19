import { ask, handle as handleInput } from './input'
import * as User from '../models/user'
import * as Group from '../models/group'
import * as GroupMembership from '../models/group-membership'
import * as GroupRequest from '../models/group-request'
import * as GroupPost from '../models/group-post'

function logWhere(method) {
  console.log('\n---- group.' + method)
}

global.defaultNext

export async function sectionScreen(next) {
  global.defaultNext = next
  logWhere('sectionScreen')

  const text = `
    Você está na sessão de Grupos. O que deseja fazer?
    1. Voltar para meu feed
    2. Listar grupos que sou dono
    3. Listar grupos que sou membro
    4. Listar todos os groups
    5. Navegar para um grupo
    6. Criar um grupo`

  const options = {
    1: global.defaultNext,
    2: async () => {
      const groupsThatUserOwns = await Group.findAllByCreator(global.selfId)
      if (groupsThatUserOwns.length === 0) {
        console.log('Atualmente você não gerencia nenhum grupo.')
        sectionScreen()
        return
      }
      console.log('Você gerencia os grupos: ', groupsThatUserOwns)
      sectionScreen()
    },
    3: listGroupsThatImMember,
    4: listAllGroups,
    5: async () => {
      const groupId = await ask('id')
      groupScreen(groupId)
    },
    6: creationScreen
  }

  handleInput(text, options, sectionScreen)
}


export async function groupScreen(groupId) {
  logWhere('groupScreen')
  
  const group = await Group.findById(groupId)

  if (!group) {
    console.log('Grupo inexistente.')
    sectionScreen()
  } else {
    console.log('Grupo:', group)

    const isMember = await GroupMembership.checkIfExists(global.selfId, groupId)
  
    if (isMember) {
      asMemberScreen(group)
    } else {
      notAsMemberScreen(group)
    }
  }
}


export async function listGroupsThatImMember() {
  logWhere('listGroupsThatImMember')
  const allGroups = await GroupMembership.listUserMemberships(global.selfId)
  console.log('Listando todos os grupos que sou membro ', allGroups)
  sectionScreen()
}


export async function listAllGroups() {
  logWhere('listAllGroups')
  const allGroups = await Group.findAll()
  console.log('Listando todos os grupos')
  console.log(allGroups)
  sectionScreen()
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
  const fields = await ask(['name', 'description', 'picture'])
  const createdGroupId = await Group.create(global.selfId, fields)
  await GroupMembership.create(global.selfId, global.selfId, createdGroupId, true)
  console.log(`Você criou o grupo ${fields.name}.`, fields)
  sectionScreen()
}

export async function notAsMemberScreen(group) {
  logWhere('notAsMemberScreen')

  // Check wether the user has requested to join or not [IM]
  const hasPendingRequest = await GroupRequest.exists(global.selfId, group.id)

  const text = hasPendingRequest ? `
      Você está no grupo ${group.name} (não-membro).
      1. Voltar para a sessão de Grupos
      2. Cancelar solicitação de participação`
    : `
      Você está no grupo ${group.name} (não-membro).
      1. Voltar para a sessão de Grupos
      2. Solicitar participação`

  const options = {
    1: () => {
      console.log('Voltando para a sessão de Grupos.')
      sectionScreen()
    },
    2: async () => {
      if (hasPendingRequest) {
        if (await GroupRequest.remove(global.selfId, group.id)) {
          console.log('Solicitação de participação cancelada.')
        } else {
          console.log('Erro ao processar o cancelamento da solicitação de participação.')
        }
      } else {
        if (await GroupRequest.create(global.selfId, group.id)) {
          console.log('Participação solicitada.')
        } else {
          console.log('Erro ao processar a solicitação de participação.')
        }
      }

      notAsMemberScreen(group)
    }
  }

  handleInput(text, options, creationScreen)
}

export async function asMemberScreen(group) {
  logWhere('asMemberScreen')

  // TODO: handle all member types:
  // common members, admins and owners in a feshion that
  // admins can banish members
  // owners can delete the group and assign admins.
  // each role has its child permissions.
  // ownerPermissions = [adminPermissions = [commonPermissions]] [IM]


  const membership = await GroupMembership.findOneGroupMembership(global.selfId, group.id)
  const isAdmin = membership[0].is_admin == 1
  console.log(`Você está no grupo ${group.name}${isAdmin ? ' (admin)' : ''}.`)

  const text = isAdmin ? `
      O que deseja fazer?
      1. Listar postagens
      2. Listar membros
      3. Criar um post
      4. Responder a um post
      5. Voltar para a sessão de Grupos
      6. Apagar uma postagem
      7. Apagar um comentário de uma postagem
      8. Listar solicitações de participação
      9. Remover um membro
      10. Remover e bloquear um membro
      11. Aceitar solicitação de participação
      12. Rejeitar solicitação de participação`
    : `
      O que deseja fazer?
      1. Listar postagens
      2. Listar membros
      3. Criar um post
      4. Responder a um post
      5. Voltar para a sessão de Grupos`

  var options = {
    1: async () => {
      const posts = await GroupPost.findByGroup(group.id)
      console.log('Posts neste grupo: ', posts)
      asMemberScreen(group.id)
    },
    2: async () => {
      // TODO: fetch real data [IM]
      const members = await GroupMembership.list(group.id)
      console.log('Os membros são ', members)
      asMemberScreen(group.id)
    },
    3: groupPostScreen,
    4: async () => {
      groupPostCommentScreen(group.id)
    },
    5: function() {
      console.log('Voltando para a sessão de Grupos.')
      sectionScreen()
    }
  }

  if (isAdmin) {
    options = {
      ...options,
      6: removePostScreen,
      7: undefined,
      8: async () => {
        listMembershipRequestsScreen(group)
      },
      9: undefined,
      10: undefined,
      11: async () => {
        const userId = await ask('userId')
        
        if (await GroupRequest.remove(userId, group.id)) {
          if (await GroupMembership.create(global.selfId, userId, group.id, false)) {
            const user = await User.findById(global.selfId, userId)
            console.log(`${user.name} se tornou um membro.`)
          } else {
            console.log('Erro ao processar solicitação de membro.')
          }
        } else {
          console.log('Este usuário não solicitou participação no grupo.')
        }

        asMemberScreen(group)
      },
      12: async () => {
        const userId = await ask('userId')
        
        if (await GroupRequest.remove(userId, group.id)) {
          const user = await User.findById(global.selfId, userId)
          if (user) {
            console.log(`Solicitação de ${user.name} rejeitada.`)
          } else {
            console.log('Solicitação rejeitada.')
          }
        } else {
          console.log('Este usuário não solicitou participação no grupo.')
        }

        asMemberScreen(group)
      }
    }
  }

  handleInput(text, options, asMemberScreen)
}

export async function listMembershipRequestsScreen(group) {
  logWhere('listMembershipRequestsScreen')
  const requests = await GroupRequest.findAllByGroup(group.id)
  console.log('Solicitações de participação: ', requests)
  asMemberScreen(group)
}

export async function removePostScreen(groupId) {
  logWhere('removePostScreen')
  console.log('Administrador, qual o id da postagem deseja apagar?')
  const postId = await ask('id')
  await GroupPost.remove(global.selfId, postId)
  console.log('Postagem removida com sucesso.')
  asMemberScreen(groupId)
}


export async function groupPostScreen(groupId) {
  logWhere('groupPostScreen')

  console.warn('Not implemented yet.')

  asMemberScreen(groupId)
}

export async function groupPostCommentScreen(groupId) {
  logWhere('groupPostCommentScreen')

  console.warn('Not implemented yet.')

  asMemberScreen(groupId)
}
