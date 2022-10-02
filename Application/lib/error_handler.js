// Error handling middleware that runs anytime one of the route handlers calls `next`,
// when an error gets thrown in one of the promise chains
module.exports = function (err, req, res, next) {
	// LOG ERRORS
	// if it is not a test environment do not log
	if (!process.env.TESTENV) {
		// log a rudimentary timestamp
		console.log('\n', new Date().toTimeString() + ':')
		// log the original error the terminal running Express
		console.error(err)
	}

	// HTTP RESPONSES

	// use a regex (regular expression) to catch both `ValidationError`s and `ValidatorErrors` by checking for Valid being present
	if (err.name.match(/Valid/) || err.name === 'MongoError') {
		// if the error came from trying to create a user that already exists,
		// send back a custom message as the error messsage will contain data about the user
		// this is because match will return an array of the match data
		const message = 'The receieved params failed a Mongoose validation'
		err = { status: 422, message }
	} else if (err.name === 'DocumentNotFoundError') {
		err.status = 404
	} else if (err.name === 'CastError' || err.name === 'BadParamsError') {
		err.status = 422
	} else if (err.name === 'BadCredentialsError') {
		err.status = 401
	}

	// Send 500 error message as JSON if no other status has been sent
	res.status(err.status || 500).json(err)
}
