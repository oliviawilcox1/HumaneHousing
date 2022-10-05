const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require('crypto')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')
const bcryptSaltRounds = 10

// Custom Errors and Error Types/Set status codes
const errors = require('../../lib/custom_errors')

const BadParamsError = errors.BadParamsError
const BadCredentialsError = errors.BadCredentialsError
const Landlord = require('../models/landlord')

// passing this as a second argument to `router.<verb>` requires a token for the route to work 
// and will also set `req.landlord`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()


// *********** POST/Sign Up Route for landlord **************
router.post('/sign-up2', (req, res, next) => {
	// start a promise chain, so that any errors will pass to `handle`
	Promise.resolve(req.body.credentials)
		// reject any requests where `credentials.password` is not present, or where
		// the password is an empty string
		.then((credentials) => {
			// Checking to see if there are no credentials or password, or the passwords dont match, or is an empty string
			if (
				!credentials ||
				!credentials.password ||
				credentials.password !== credentials.password_confirmation
			) {
				throw new BadParamsError()
			}
		})
		// generate a hash from the provided password, returning a promise
		.then(() => bcrypt.hash(req.body.credentials.password, bcryptSaltRounds))
		.then((hash) => {
			// return necessary params to create a landlord
			return {
				email: req.body.credentials.email,
                firstName:   req.body.credentials.firstName,
                lastName: req.body.credentials.lastName,
                dateOfBirth:  req.body.credentials.dateOfBirth,
				hashedPassword: hash,
			}
		})
		// create landlord with provided email and hashed password
		.then((landlord) => Landlord.create(landlord))
		// send the new landlord object back with status 201, but `hashedPassword`
		// won't be sent because of the `transform` in the landlord model
		.then((landlord) => res.status(201).json({ landlord: landlord.toObject() }))
		// pass any errors along to the error handler
		.catch(next)
})


// *********** POST/Sign In Route for landlord **************
router.post('/sign-in2', (req, res, next) => {
	const pw = req.body.credentials.password
	let landlord
	// find a landlord based on the email that was passed
	Landlord.findOne({ email: req.body.credentials.email })
		.then((record) => {
            console.log(record)
			// if we didn't find a landlord with that email, send 401
			if (!record) {
				throw new BadCredentialsError()
			}
			// save the found landlord outside the promise chain
			landlord = record
			// `bcrypt.compare` will return true if the result of hashing `pw`
			// is exactly equal to the hashed password stored in the DB
			return bcrypt.compare(pw, landlord.hashedPassword)
		})
		.then((correctPassword) => {
			// if the passwords matched
			if (correctPassword) {
				// the token will be a 16 byte random hex string
				const token = crypto.randomBytes(16).toString('hex')
				landlord.token = token
				// save the token to the DB as a property on landlord
				return landlord.save()
			} else {
				// throw an error to trigger the error handler and end the promise chain
				// this will send back 401 and a message about sending wrong parameters
				throw new BadCredentialsError()
			}
		})
		.then((landlord) => {
			// return status 201, the email, and the new token
			res.status(201).json({ landlord: landlord.toObject() })
		})
		.catch(next)
})


// *********** PATCH/Change Password Route for landlord **************
router.patch('/change-password2', requireToken, (req, res, next) => {
	let landlord
	// `req.landlord` will be determined by decoding the token payload
	Landlord.findById(req.landlord.id)
		// save landlord outside the promise chain
		.then((record) => {
			landlord = record
		})
		// check that the old password is correct
		.then(() => bcrypt.compare(req.body.passwords.old, landlord.hashedPassword))
		// `correctPassword` will be true if hashing the old password ends up the
		// same as `landlord.hashedPassword`
		.then((correctPassword) => {
			// throw an error if the new password is missing, an empty string,
			// or the old password was wrong
			if (!req.body.passwords.new || !correctPassword) {
				throw new BadParamsError()
			}
		})
		// hash the new password
		.then(() => bcrypt.hash(req.body.passwords.new, bcryptSaltRounds))
		.then((hash) => {
			// set and save the new hashed password in the DB
			landlord.hashedPassword = hash
			return landlord.save()
		})
		// respond with no content and status 200
		.then(() => res.sendStatus(204))
		// pass any errors along to the error handler
		.catch(next)
})


// *********** DELETE/Log Out Route for landlord **************
router.delete('/sign-out2', requireToken, (req, res, next) => {
	// create a new random token for the landlord, invalidating the current one
	req.landlord.token = crypto.randomBytes(16)
	// save the token and respond with 204
	req.landlord
		.save()
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
