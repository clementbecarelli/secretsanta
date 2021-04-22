const express = require('express')
const cors = require('cors')
const app = express()
const mysql = require('mysql')

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "secretsanta",
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

/* Get last 5 draws from History table in database */
app.get('/api/get/history', (req, res) => {

  const sqlSelect = "SELECT * FROM History WHERE id_draw >(SELECT max(id_draw)-5 FROM History);"
  db.query(sqlSelect, (err, result) => {
    res.send(result)
  })

})

/* Get the right draw id to assure persistance while restarting app */
app.get('/api/get/iddraw', (req, res) => {

  const sqlSelect = "SELECT max(id_draw) FROM History;"
  
  db.query(sqlSelect, (err, result) => {
    res.send(result)
  })
})

/* Get history information */
app.post("/api/insert", (req, res) => {

  const idDraw = req.body.idDraw
  const participantsList = req.body.participantsList
  const sqlInsert = "INSERT INTO History (id_draw, name_participant, drawn_participant) VALUES (?,?,?);"
  
  participantsList.map((giver, id, elements) =>  {

    var receiver = elements[id+1]
    if (id+1 >= elements.length){
      receiver = elements[0]
    }

    db.query(sqlInsert, [idDraw, giver, receiver])
  })
})

/* Delete history in database */
app.delete("/api/delete", (req,res) => {
  const sqlDelete = "TRUNCATE TABLE History;"
  db.query(sqlDelete, (err, result) => {
    res.send(err)
  })
})

app.listen('3001', () => {
  console.log('Running on port 3001')
})