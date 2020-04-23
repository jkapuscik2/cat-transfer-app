// Script used for local testing and development

const app = require('./app')
const port = 4000

app.listen(port)
console.log(`listening on http://localhost:${port}`)