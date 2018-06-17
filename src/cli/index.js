import * as User from '../models/user'
import * as userRoute from './user'
import { ask, handle as handleInput } from './input'


/* DATA */

// Logged user ID
// global can be accessed from anywhere in the code
global.selfId = null


/* UTILS */

function logWhere(where) {
  console.log('\n---- index.' + where)
}


/* ROUTES */

async function authenticationScreen() {
  logWhere('authenticationScreen')

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
  logWhere('signUp')

  const fields = await ask(['name', 'username', 'password'])
  console.log('signUp', fields)

  const userId = await User.create(fields.username, fields.password, fields.name)
  console.log(`Você foi registrado com o id ${userId}.`)

  authenticationScreen()
}

async function signIn() {
  logWhere('signIn')

  const fields = await ask(['username', 'password'])
  console.log('signIn', fields)

  global.selfId = await User.matchCredencials(fields.username, fields.password)
  userRoute.selfFeedScreen()
}


authenticationScreen()
