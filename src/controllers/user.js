import { Router } from 'express'
import * as User from '../models/user'


export default Router()

  .get('/:id', async (req, res, next) => {
    console.log('controllers/user', req.user, req.params)

    const user = await User.findById(req.user.id, req.params.id)

    if (user) {
      res.json({ user })
    }
    else {
      res.status(404).json({ error: 'User not found' })
    }
  })
