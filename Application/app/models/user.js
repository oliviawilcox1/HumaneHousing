const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		firstName: {
			type: String,
			required: true,
		},
        lastName: {
            type: String,
            required: true,
        },
        aboutMe: {
            type: String, 
            required: true,
        },
        dateOfBirth: {
            type: String,
            required: true,
        },
        socialSecurity: {
            type: Number, 
            required: true, 
        },
        numberOfTenants: {
           type: Number,
           required: true,
        },
        currentCity: {
          type: String,
          required: true,
        },
        currentCountry: {
            type: String,
            required: true
        },
        desiredZipcode: {
            type: Number,
            required: true,
        },
		hashedPassword: {
			type: String,
			required: true,
		},
		token: String,
	},
	{
		timestamps: true,
		toObject: {
			// remove `hashedPassword` field when we call `.toObject`
			transform: (_doc, user) => {
				delete user.hashedPassword
				return user
			},
		},
	}
)

module.exports = mongoose.model('User', userSchema)
