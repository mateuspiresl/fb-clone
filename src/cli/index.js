import * as User from '../models/user'
import UserSection from './user'
import { ask, handle as handleInput } from './input'


/* DATA */

// Logged user ID
// global can be accessed from anywhere in the code
global.selfId = null


/* ROUTES */

async function authenticationScreen() {
  const text = `
    1. Sign Up
    2. Sign In
    3. Encerrar`

  const options = {
    1: signUp,
    2: signIn,
    3: () => process.exit()
  }

  handleInput(text, options, authenticationScreen)
}

async function signUp() {
  const fields = await ask(['name', 'username', 'password', 'photo'])
  console.log('signUp', fields)

  if (!fields.name || !fields.username || !fields.password) {
    throw new Error('Invalid credencials')
  }

  const userId = await User.create(fields.username, fields.password, fields.name, null, fields.photo)
  console.log(`Você foi registrado com o id ${userId}.`)

  authenticationScreen()
}

async function signIn() {
  const fields = await ask(['username', 'password'])
  const userId = await User.matchCredencials(fields.username, fields.password)

  if (userId) {
    console.log(`Usuário ${userId} autenticado com sucesso.`)
    global.selfId = userId
    UserSection(authenticationScreen)
  } else {
    console.log('Credenciais inválidas.')
    authenticationScreen()
  }
}


authenticationScreen()

process.on('unhandledRejection', function (error) {
  console.error('UNCAUGHT', error)
})
