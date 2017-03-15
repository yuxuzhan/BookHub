// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// set up a mongoose model and pass it using module.exports
var reviewSchema  =  new Schema({
    seller: {
        type: String,
        required: true
    },
    buyer: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    created_at: Date,
    updated_at: Date
},{
    collection: 'review'
});


reviewSchema.pre('save', function (next) {

    // get the current date
    var currentDate = new Date();
    // change the updated_at field to current date
    this.updated_at = currentDate;
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
      this.created_at = currentDate;
    next();
});

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
module.exports = mongoose.model('review', reviewSchema);
