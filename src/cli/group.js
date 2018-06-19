import { ask, handle as handleInput } from './input'
import GroupPostSection from './group.post'
import * as User from '../models/user'
import * as Group from '../models/group'
import * as GroupMembership from '../models/group-membership'
import * as GroupRequest from '../models/group-request'
import * as GroupBlocking from '../models/group-blocking'

function logWhere(method) {
  console.log('\n---- group.' + method)
}

export default async function GroupSection(next) {
  logWhere('sectionScreen')

  const current = () => GroupSection(next)

  const text = `
    Você está na sessão de Grupos.
    1. Voltar para meu feed
    2. Listar grupos que sou administrador
    3. Listar grupos que sou membro
    4. Listar todos os grupos
    5. Ir para um grupo
    6. Criar um grupo`

  const options = {
    1: next,
    2: async () => {
      const groups = await Group.findAllByCreator(global.selfId)

      if (groups.length === 0) {
        console.log('Atualmente você não gerencia nenhum grupo.')
      } else {
        console.log('Grupos:', groups)
      }

      current()
    },
    3: () => listGroupsThatImMember(current),
    4: () => listAllGroups(current),
    5: async () => groupScreen(await ask('id'), current),
    6: async () => {
      const fields = await ask(['name', 'description', 'picture'])
      const groupId = await Group.create(global.selfId, fields)

      await GroupMembership.create(global.selfId, global.selfId, groupId, true)

      console.log(`Você criou o grupo ${fields.name}.`)
      current()
    }
  }

  handleInput(text, options, () => GroupSection(next))
}

async function groupScreen(groupId, next) {
  logWhere('groupScreen')

  const group = await Group.findById(groupId)

  if (!group) {
    console.log('Grupo inexistente.')
    next()
  } else {
    console.log('Grupo:', group)

    const membership = await GroupMembership.findOneGroupMembership(global.selfId, groupId)

    if (membership) {
      if (membership.is_admin === '1') {
        asAdminScreen(group, next)
      } else {
        asMemberScreen(group, next)
      }
    } else {
      asNotMemberScreen(group, next)
    }
  }
}

async function listGroupsThatImMember(next) {
  logWhere('listGroupsThatImMember')
  const allGroups = await GroupMembership.listUserMemberships(global.selfId)
  console.log('Listando todos os grupos que sou membro ', allGroups)
  next()
}

async function listAllGroups(next) {
  logWhere('listAllGroups')
  const allGroups = await Group.findAll(global.selfId)
  console.log('Listando todos os grupos')
  console.log(allGroups)
  next()
}

async function asNotMemberScreen(group, next) {
  logWhere('asNotMemberScreen')

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
      next()
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

      asNotMemberScreen(group, next)
    }
  }

  handleInput(text, options, () => asNotMemberScreen(group, next))
}

async function asMemberScreen(group, next) {
  logWhere('asMemberScreen')

  const text = `
      Você está no grupo ${group.name} (membro).
      1. Voltar para a sessão de Grupos
      2. Ir para sessão de posts
      3. Listar membros
      4. Sair do grupo`

  var options = {
    1: next,
    2: () => GroupPostSection(group, () => asMemberScreen(group, next)),
    3: async () => {
      const members = await GroupMembership.list(group.id)
      console.log('Membros:', members)
      asMemberScreen(group, next)
    },
    4: async () => {
      if (await GroupMembership.remove(global.selfId, group.id)) {
        console.log(`Você saiu do grupo ${group.id}`)
      } else {
        console.log('Erro ao processar saída de grupo.')
      }

      next()
    }
  }

  handleInput(text, options, asMemberScreen)
}

async function asAdminScreen(group, next) {
  logWhere('asMemberScreen')

  const current = () => asAdminScreen(group, next)

  const text = `
      Você está no grupo ${group.name} (admin).
      1. Voltar para a sessão de Grupos
      2. Ir para sessão de posts
      3. Listar membros
      4. Remover um membro
      5. Listar membros bloeados
      6. Bloquear um membro
      7. Desbloquear um usuário.
      8. Listar solicitações de participação
      9. Aceitar solicitação de participação
      10. Rejeitar solicitação de participação
      11. Alterar permissão de membro - Dar ou revogar status Admin
      12. Apagar grupo`

  var options = {
    // Voltar
    1: next,
    // Posts
    2: () => GroupPostSection(group, () => current()),
    // Membros
    3: async () => {
      const members = await GroupMembership.list(group.id)
      console.log('Membros:', members)
      current()
    },
    // Remover membro
    4: async () => {
      const memberId = await ask('member_id')

      if (memberId) {
        const user = await User.findById(global.selfId, memberId)

        if (user && await GroupMembership.remove(memberId, group.id)) {
          console.log(`O usuário '${user.name}' foi removido do grupo '${group.name}'.`)
          return next()
        }
      }

      console.log('Erro ao processar remoção de membro de grupo.')
      next()
    },
    // Listar membros bloqueados
    5: async () => {
      const blockedUsers = await GroupBlocking.findAllBlockedUsers(group.id)
      console.log('usuários bloqueados: ', blockedUsers)
      current()
    },
    // Bloquear membro
    6: async () => {
      console.log('Qual membro deseja bloquear e remover do grupo?')
      const userId = await ask('member_id')
      await GroupMembership.remove(userId, group.id)
      await GroupBlocking.create(userId, group.id)
      console.log('Usuário bloqueado com sucesso.')
      current()
    },
    // Desbloquear usuário
    7: async () => {
      console.log('Qual usuário deseja desbloquear?')
      const userId = await ask('blocked_user_id')
      await GroupBlocking.unblock(userId, group.id)
      console.log('Usuário desbloqueado com sucesso.')
      current()
    },
    // Solicitações
    8: async () => {
      const requests = await GroupRequest.findAllByGroup(group.id)
      console.log('Solicitações de participação:', requests)
      current()
    },
    // Aceitar solicitação
    9: async () => {
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

      current()
    },
    // Rejeitar solicitação
    10: async () => {
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

      current()
    },
    // Alterar permissão de um membro (admin / membro comum)
    11: async () => {
      console.log('Qual membro deseja tornar administrador?')
      const userId = await ask('user_id')
      await GroupMembership.toggleUserPermission(userId, group.id)
      console.log('Você alterou as permissões do usuário ', userId)
      current()
    },
    // Apagar grupo
    12: async() => {
      if (await Group.remove(global.selfId, group.id)) {
        console.log(`Grupo ${group.name} apagado.`)
      } else {
        console.log('Erro ao processar a remoção de grupo')
      }

      next()
    }
  }

  handleInput(text, options, asMemberScreen)
}
