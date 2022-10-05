// Authentication Packages
const passport = require('passport')
const bearer = require('passport-http-bearer')

// For setting req.user in auth routes 
const Landlord = require('../app/models/landlord')

// Strategy grabs a bearer token from the HTTP headers and then
// run the callback with the found token as `token`
const strategy = new bearer.Strategy(function (token, done) {
	// look for a user whose token matches the one from the header
	Landlord.findOne({ token: token }, function (err, landlord) {
		if (err) {
			return done(err)
		}
		// if we found a user, pass it along to the route files
		// if we didn't, `user` will be `null`
		return done(null, landlord, { scope: 'all' })
	})
})

// serialize and deserialize functions are used by passport under
// the hood to determine what `req.user` should be inside routes
passport.serializeUser((landlord, done) => {
	// we want access to the full Mongoose object that we got in the
	// strategy callback, so we just pass it along with no modifications
	done(null, landlord)
})

// Retrieving the whole User object
passport.deserializeUser((landlord, done) => {
	done(null, landlord)
})

// register this strategy with passport
passport.use(strategy)

// Initialize a passport middleware based on all the above configuration
module.exports = passport.initialize()
