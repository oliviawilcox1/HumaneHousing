// Middleware that allows client to use the Rails convention of `Authorization: Token token=<token>`
// OR the Express convention of `Authorization: Bearer <token>`
module.exports = (req, res, next) => {
	if (req.headers.authorization) {
		const auth = req.headers.authorization
		// if we find the Rails pattern in the header, replace it with the Express
		// one before `passport` gets a look at the headers
		// then the auth.js file can find the user from the token
		req.headers.authorization = auth.replace('Token token=', 'Bearer ')
	}
	next()
}
