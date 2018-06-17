import prompt from 'prompt'


prompt.start()

export function ask(fields='>') {
  const unique = typeof fields === 'string'

  return new Promise((resolve, reject) => {
    prompt.get(unique ? [fields] : fields, (error, result) => {
      if (error) reject(error)
      else resolve(unique ? result[fields] : result)
    })
  })
}

export async function handle(text, options, next) {
  console.log(text)
  const input = await ask('option')

  if (input in options) {
    options[input]()
  } else {
    console.log(`Opção '${input}' inválida.`)
    next()
  }
}
