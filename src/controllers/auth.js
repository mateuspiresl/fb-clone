import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { SECRET_TOKEN } from '../config'
import { matchCredencials } from '../models/user'
import { register, unregister } from '../auth'


export default Router()

  .post('/login', async (req, res, next) => {
    console.log('controllers/auth/login', req.body)
    
    const { username, password } = req.body
    const userId = await matchCredencials(username, password)

    if (userId) {
      const token = jwt.sign({ id: userId }, SECRET_TOKEN)
      register(token)
      res.json({ token })
    }
    else {
      res.status(400).json({ error: 'Validation failure' })
    }
  })

  .get('/logout', async (req, res, next) => {
    console.log('controllers/auth/logout')
    unregister()
  })
