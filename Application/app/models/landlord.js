const mongoose = require('mongoose')



// Currently working on the landlord schema and landlord routes will be completed next
const landlordSchema = new mongoose.Schema(
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

	dateOfBirth: {
		type: String,
		required: true,
	},

// 	propertyInformation: {
// 		type: String,
// 		required: true,
// 	},
// // This will become a separate model that allows the landlord to upload images to their application
// 	listingImages: {
// 		type: String,
// 		required: true
// 	},
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

module.exports = mongoose.model('Landlord', landlordSchema)
