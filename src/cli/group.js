import { ask, handle as handleInput } from './input'
import * as Group from '../models/group'
import * as GroupMembership from '../models/group-membership'
import * as GroupRequest from '../models/group-request'
import * as GroupPost from '../models/group-post'

function logWhere(method) {
  console.log('\n---- group.' + method)
}

export async function sectionScreen(next) {
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
    1: next,
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
  if (group.length === 0) {
    console.log('Grupo inexistente.')
    sectionScreen()
    return
  }
  console.log(group)
  // check membership [IM]
  const membershipExists = await GroupMembership.checkIfExists(global.selfId, groupId)

  if (membershipExists) {
    asMemberScreen(groupId)
  } else {
    notAsMemberScreen(groupId)
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

export async function notAsMemberScreen(groupId) {
  logWhere('notAsMemberScreen')

  // Check wether the user has requested to join or not [IM]
  const userHasPendingMembershipRequest = await GroupRequest.findOne(global.selfId, groupId)

  const text = userHasPendingMembershipRequest ?
    `
      Você está na tela de um Grupo, porém ainda não é membro. O que deseja fazer?
      1. Voltar para a sessão de Grupos
      2. Cancelar minha solicitação de participação`
    : // otherwhise [IM]
    `
      Você está na tela de um Grupo, porém ainda não é membro. O que deseja fazer?
      1. Voltar para a sessão de Grupos
      2. Solicitar participação`

  var options = {
    1: function() {
      console.log('Voltando para a sessão de Grupos.')
      sectionScreen()
    },
  }

  options = userHasPendingMembershipRequest ?
    {
      ...options,
      2: async () => {
        const requestRemoval = await GroupRequest.remove(global.selfId, groupId)
        const message = 'Sua solicitação foi cancelada.'

        // go back to this group screen [IM]
        console.log(message, requestRemoval)
        groupScreen(groupId)
      }
    }
    : // otherwhise [IM]
    {
      ...options,
      2: async () => {

        const request = await GroupRequest.create(global.selfId, groupId)
        const message = 'Sua solicitação foi enviada aos administradores.'
        
        // go back to this group screen [IM]
        console.log(message, request)
        groupScreen(groupId)
      }
    }

  handleInput(text, options, creationScreen)
}

export async function asMemberScreen(groupId) {
  logWhere('asMemberScreen')

  // TODO: handle all member types:
  // common members, admins and owners in a feshion that
  // admins can banish members
  // owners can delete the group and assign admins.
  // each role has its child permissions.
  // ownerPermissions = [adminPermissions = [commonPermissions]] [IM]


  const membership = await GroupMembership.findOneGroupMembership(global.selfId, groupId)
  const isAdmin = membership[0].is_admin == 1
  console.log('Você está na tela de um Grupo . Admin = ', isAdmin)

  const text = isAdmin ?
    `
      O que deseja fazer?
      0. Apagar grupo
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
      11. Gerenciar solicitação de participação`
    : // otherwhise [IM]
    `
      O que deseja fazer?
      0. Sair do grupo
      1. Listar postagens
      2. Listar membros
      3. Criar um post
      4. Responder a um post
      5. Voltar para a sessão de Grupos`

  var options = {
    0: async () => {
      if (isAdmin) {
        Group.remove(global.selfId, groupId)
        console.log('Apagando grupo.')
        sectionScreen()
      } else {
        console.log('Abandonando o grupo.')
        console.warn('Not implemented yet')
        process.exit()
      }
    },
    1: async () => {
      const posts = await GroupPost.findByGroup(groupId)
      console.log('Posts neste grupo: ', posts)
      asMemberScreen(groupId)
    },
    2: async () => {
      // TODO: fetch real data [IM]
      const members = await GroupMembership.list(groupId)
      console.log('Os membros são ', members)
      asMemberScreen(groupId)
    },
    3: groupPostScreen,
    4: async () => {
      groupPostCommentScreen(groupId)
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
        listMembershipRequestsScreen(groupId)
      },
      9: undefined,
      10: undefined,
      11: async () => {
        console.log('Digite o id da solicitação que deseja manipular')
        const id = ask['id']
        const request = GroupRequest.findOne()
        console.warn('Not implemented yet.')

      }
    }
  }

  handleInput(text, options, asMemberScreen)
}

export async function listMembershipRequestsScreen(groupId) {
  logWhere('listMembershipRequestsScreen')
  const groupMembershipRequests = await GroupRequest.findAllByGroup(groupId)
  console.log('Listando: ', groupMembershipRequests)
  asMemberScreen(groupId)
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
