import express from 'express'
import bodyParser from 'body-parser'
import Database from './database'


const db = new Database()

express()
  .use(bodyParser.json())

  .get('/', (req, res) => {
    db.query(`INSERT INTO user (username, password) VALUES ('name', 'pass')`)
      .catch(console.error)
      .then(result => db.query(`SELECT * FROM user`))
      .then(result => res.json(result))
  })

  .listen(5000, () => {
    console.log('App on localhost:5000')
  })
