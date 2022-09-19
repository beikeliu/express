const express = require('express')
const app = express()
const db = require('better-sqlite3')('../mydb.db');
const j = (data) => ({ data: data || 'success' })
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.post('/post',
  (req, res) => {
    const stmt = db.prepare('insert into post (content) values (?)')
    stmt.run(req.body.content)
    res.send(j())
  })
app.get('/post', (_, res) => {
  const stmt = db.prepare('select * from post')
  const data = stmt.all();
  res.send(j(data));
})
app.listen(3000, () => {
  console.log('open http://localhost:3000/')
})