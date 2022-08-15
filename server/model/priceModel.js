const mongoose = require('mongoose');

var priceSchema = new mongoose.Schema({
    name:{type : String , required: true},
    price:{type : Number , required: true}
})

const Price = mongoose.model('price', priceSchema);

module.exports = Price;