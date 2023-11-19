const express = require('express')
const app = express()
app.use(express.json())

const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

let db
let dbPath = path.join(__dirname, 'covid19India.db')
const inititializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('SERVER RUNNING')
    })
  } catch (err) {
    console.log(`ERROR: ${err.message}`)
    process.exit(1)
  }
}

app.get('/states/', async (request, response) => {
  const getStatesQue = `SELECT *
    FROM state 
    ORDER BY state_id`

  const statesArray = await db.all(getStatesQue)
  response.send(statesArray)
})

app.get('/states/:stateId', async (request, response) => {
  const {stateId} = request.params
  const getAStateQue = `SELECT *
    FROM state 
    WHERE state_id =${stateId}`

  const statesArray = await db.get(getAStateQue)
  response.send(statesArray)
})

app.post('/districts/', async (request, response) => {
  const distDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = distDetails

  const postDistrictQue = `INSERT INTO
  district(district_name, state_id, cases, cured, active, deaths)
  VALUES('${districtName}', '${stateId}', '${cases}', '${cured}', '${active}', '${deaths}')
  `
  await db.run(postDistrictQue)
  response.send('District Successfully Added')
})

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getADistrictQue = `SELECT *
    FROM district 
    WHERE district_id =${districtId}`

  const statesArray = await db.get(getADistrictQue)
  response.send(statesArray)
})

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const removeDistrictQue = `DELETE FROM district 
    WHERE district_id =${districtId}`

  await db.run(removeDistrictQue)
  response.send('District Removed')
})

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails

  const putDistrictQue = `UPDATE district 
    SET
    district_name = '${districtName}',
    state_id = '${stateId}',
    cases = '${cases}',
    cured = '${cured}',
    active = '${active}',
    deaths = '${deaths}'
    WHERE district_id =${districtId};
    `

  await db.run(putDistrictQue)
  response.send('District Details Updated')
})

app.get('states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params

  const statsQuery = `SELECT SUM(cases) as totalCases,
  SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths
  FROM district
  WHERE state_id= '${stateId}';
  `
  const statsArray = await db.all(statsQuery)
  response.send(statsArray)
})

app.get('districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params

  const detailsQuery = ` SELECT state_name as stateName 
  FROM state JOIN district
  ON state.state_id= district.sate_id
  WHERE district.district_id =${districtId};
  `
  const detailsQue = await db.get(detailsQuery)
  response.send(detailsQue)
})

inititializeDbServer()
module.exports = app
