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
      console.log('Sou dono dos grupos: ', groupsThatUserOwns)
      next()
    },
    3: listGroupsThatImMember,
    4: listAllGroups,
    5: async () => {
      
      const groupId = await ask('id')
      groupScreen(groupId)
      // When navigating, there is a route to groups that i am member
      // and routes for groups that i am not an actual member.
      // I guess all the logic to check my relation with the group
      // should be plced here. [IM]
      // chosenId = input()
      // group = Groups.get(byChosenId)
      // const amIMember: Bool = group.checkMembership(withMe)
      // if amIMember:
      // groupScreen(amIMember)
      // console.log('Navegando para o grupo escolhido.')
      
      // notAsMemberScreen()
      // asMemberScreen()
    },
    6: creationScreen
  }

  handleInput(text, options, sectionScreen)
}


export async function groupScreen(groupId) {
  logWhere('groupScreen')
  const group = await Group.findById(groupId)
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
  const allGroups = await GroupMembership.f()
  console.log('Listando todos os grupos')
  console.log(allGroups)
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
  await Group.create(global.selfId, fields)
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


  const text = `
    Você está na tela de um Grupo como um membro simples ativo. O que deseja fazer?
    1. Listar postagens
    2. Listar membros
    3. Criar um post
    4. Responder a um post
    5. Voltar para a sessão de Grupos`

  const defaultOptions = {
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
    3: async () => {
      const fields = await ask(['content', 'picture'])
      const post = await GroupPost.create(global.selfId, groupId, fields)

      console.log('Post realizado: ', post)
      asMemberScreen(groupId)
    },
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

export async function commentPost() {
  logWhere('commentPost')
  
  const fields = await ask(['content'])
  console.log('group.commentPost', 'Comentário criado em post.', fields)
  asMemberScreen()
}
