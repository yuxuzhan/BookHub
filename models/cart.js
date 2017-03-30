module.exports = function (mongoose){
    var Schema = mongoose.Schema;
    // set up a mongoose model and pass it using module.exports
    var cartSchema  =  new Schema({
        userid: {
            type:String,
            required:true
        },
        bookid: {
            type: String,
            required: true
        },
        created_at: Date,
        updated_at: Date
    },{
        collection: 'cart'
    });

    cartSchema.pre('save', function (next) {
        // get the current date
        var currentDate = new Date();
        // change the updated_at field to current date
        this.updated_at = currentDate;
        // if created_at doesn't exist, add to that field
        if (!this.created_at)
          this.created_at = currentDate;
        next();
    });
    return mongoose.model('cart', cartSchema);
}
