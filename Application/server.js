// NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Route files
const landlordRoutes = require('./app/routes/landlord_routes')
const userRoutes = require('./app/routes/user_routes')

// Middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// Database configuration logic
const db = require('./config/db')

// Configured passport authentication middleware
const auth = require('./lib/auth')

// Server and client ports
// Used for cors and local port declaration
const serverDevPort = 8000
const clientDevPort = 3000

// Establish database connection and use new version of URL parser
mongoose.connect(db, {
	useNewUrlParser: true,
})

// Instantiate Express Application object
const app = express()

// CORS headers set on response from API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
// Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server 
// to indicate any origins (domain, scheme, or port) other than its own from which a 
// browser should permit loading resources.
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}`,
	})
)

// Port for API to run on, either localhost8000 or deployed
// adding PORT= to your env file will be necessary for deployment
const port = process.env.PORT || serverDevPort

// Middleware that allows the client to use the Rails convention of `Authorization: Token token=<token>` 
// OR the Express convention of `Authorization: Bearer <token>`
app.use(replaceToken)

// Passport authentication middleware
app.use(auth)

// `express.json` middleware parses JSON requests into JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())

// Parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// Request Logger for debugging
app.use(requestLogger)

// Route files
// app.use(landlordRoutes)
app.use(userRoutes)


// Error handling middleware - comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// API on designated port 
app.listen(port, () => {
	console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
