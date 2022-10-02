// Middleware for removing any key/value pairs from `req.body.foo` that have an empty string as a value
// { example: { title: 'thing', text: '' } } -> { example: { title: 'thing' } }
module.exports = function (req, res, next) {
	// we don't know the name of the object in `req.body`, so we'll apply this to
	// ALL objects in `req.body`
	Object.values(req.body).forEach((obj) => {
		// for all objects
		for (const key in obj) {
			// and for each key in each object
			if (obj[key] === '') {
				// if the value for the key is blank
				// removes both the key and the value, preventing it from being updated
				delete obj[key]
			}
		}
	})
	// pass `req` and `res` on to the route handler
	next()
}
