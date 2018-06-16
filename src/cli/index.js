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

async function main() {
  console.log('main')

  const text = `
    1. Cadastrar
    2. Login
  > `

  const input = await question(text)
  console.log('main', input)

  switch (input) {
    case '1': return register()
    case '2': return login()
  }
}

async function register() {
  console.log('register')

  const text = `
    <Nome de usuário>, <Senha>, <Nome>
  > `

  const input = await question(text)
  console.log('register', input)

  const fields = splitInput(input)
  await User.create(...fields)
  main()
}

async function login() {
  console.log('login')

  const text = `
    <Nome de usuário>, <Senha>
  > `

  const input = await question(text)
  console.log('login', input)

  const fields = splitInput(input)
  selfId = await User.matchCredencials(...fields)
  viewFeed()
}

async function viewFeed() {
  console.log('viewFeed')

  (await Post.findByAuthor(selfId, selfId))
    .forEach(console.log)

  const question = `
    1. Criar post
  > `

  const input = await question(text)
  console.log('viewFeed', input)
  
  switch (input) {
    case '1': return createPost()
  }
}

function createPost() {
  console.log('createPost')
  // ...
}


/* START */

main()