const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    name : { type : String , required: true},
    image : { type : [String] , required: true},
    price : { type : Number , required: true},
    description : { type : String , required: true},
    category : { type : String , required: true},
    createdAt: { type : Date, default: Date.now()},
    expiryAt: { type : Date, default: Date.now()},
    customer : [String]
});

const product = mongoose.model('product', productSchema);

module.exports = product;