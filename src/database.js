import mariasql from 'mariasql'
import { logAllowed } from './config'


let connectionInstance = null

export default class Database {
  constructor() {
    if (connectionInstance === null) {
      connectionInstance = new mariasql({
        host: '172.17.0.2',
        user: 'root',
        password: 'pw',
        db: 'fb-clone'
      })
    }

    this.connection = connectionInstance
  }

  query(sql) {
    if (logAllowed.sql) console.log('SQL:', sql)
    
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })
  }

  prepare(sql) {
    return this.connection.prepare(sql)
  }

  clear(table) {
    return this.query('DELETE FROM `' + table + '`;')
  }

  close() {
    this.connection.end()
    connectionInstance = null
  }
}
