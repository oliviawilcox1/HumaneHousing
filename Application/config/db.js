'use strict'
// Base name for the Mongodb 
const mongooseBaseName = 'humane-housing'

// Mongodb uri for development and test
const database = {
	development: `mongodb://localhost/${mongooseBaseName}-development`,
	test: `mongodb://localhost/${mongooseBaseName}-test`,
}

// Identify if development environment is test or development and 
// select DB based on whether a test file was executed before `server.js`
const localDb = process.env.TESTENV ? database.test : database.development

// Environment variable MONGODB_URI will be available in heroku production environment,
// otherwise use test or development db decided above with ternary 
const currentDb = process.env.MONGODB_URI || localDb

module.exports = currentDb
