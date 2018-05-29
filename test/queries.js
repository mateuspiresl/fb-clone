import Database from '../src/database'
// import assert from 'assert'


const db = new Database()

describe.only('Queries', function () {
  let blocker, blocked;

  before(function () {
    return db.query("DELETE FROM `user_blocking` WHERE 1=1")
      .then(() => db.query("DELETE FROM `user` WHERE 1=1"))
      .then(() => db.query("INSERT INTO `user` (`username`, `password`) VALUES ('An', 'Ap')"))
      .then(() => db.query("INSERT INTO `user` (`username`, `password`) VALUES ('Bn', 'Bp')"))
      .then(() => db.query("INSERT INTO `user` (`username`, `password`) VALUES ('Cn', 'Cp')"))
      .then(() => db.query("SELECT * FROM `user`"))
      .then(result => {
        blocker = result[0].id
        blocked = result[1].id

        const sql = "INSERT INTO `user_blocking` (`blocker_id`, `blocked_id`) VALUES ("
        + result[0].id + ", " + result[1].id + ")"

        console.log('sql blocking', sql)
        return db.query(sql)
      })
  })

  it('please work', function (done) {
    console.log()

    const sql = "SELECT u.* FROM `user` as u LEFT JOIN `user_blocking` as b ON u.`id`=b.`blocker_id`"
      + "WHERE b.`blocker_id` IS NULL OR b.`blocked_id`!=" + blocked

    console.log('sql THE THING !', sql)

    db.query("SELECT u.* FROM `user` as u")
      .then(result => console.log('select all user', result))
      .then(() => db.query("SELECT u.* FROM `user_blocking` as u"))
      .then(result => console.log('select all user_blocking', result))
      .then(() => db.query(sql))
      .then(result => console.log('select THE THING !', result))
      .then(done)
  })
})


// User listing test [IM]

// describe('Queries', function() {
//   before(async function() {
//     await db.query("DELETE FROM `group_blocking` WHERE 1=1")
//     await db.query("DELETE FROM `group` WHERE 1=1")

//     await db.query("INSERT INTO `user` (`username`, `password`) VALUES ('An', 'Ap')")

//     await db.query("INSERT INTO `group` (`name`, `description`, `creator`)")
//   })
// })
