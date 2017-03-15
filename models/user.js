// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// set up a mongoose model and pass it using module.exports
var userSchema  =  new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    phone: String,
    created_at: Date,
    updated_at: Date
},{
    collection: 'user'
});


userSchema.pre('save', function (next) {

    // get the current date
    var currentDate = new Date();
    // change the updated_at field to current date
    this.updated_at = currentDate;
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
      this.created_at = currentDate;
    next();
});

//methods for password encription
var bcrypt   = require('bcrypt-nodejs');
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/bookhub');
module.exports = mongoose.model('user', userSchema);
