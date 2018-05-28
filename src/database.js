import mariasql from 'mariasql'


export default class Database {
  constructor() {
    this.connection = new mariasql({
      host: '172.17.0.2',
      user: 'root',
      password: 'pw',
      db: 'fb-clone'
    })
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, function(error, rows) {
        if (error) reject(error)
        else resolve(rows)
      })
    })
  }

  prepare(sql) {
    return this.connection.prepare(sql)
  }

  close() {
    this.connection.end()
  }
}
