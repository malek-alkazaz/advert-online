const mongoose = require('mongoose');

var customerSchema = new mongoose.Schema({
    username: {type : String , required: true},
    password : {type : String , required: true},
    shop_name : { type: String , required: true },
    shop_address : {type: String , required: true},
    phone1 : { type: Number , required: true, unique: true }, 
    phone2 : { type: Number , required: true, unique: true },
    pageurl : {type: String , unique: true},
    image : {type: String },
    brief : {type: String },
    extra_days : {type: Number },
    months : {type: Number },
    extra_products : {type: Number },
    permitted_products : {type: Number, default: 8},
    subscrip_price : { type: Number},
    subscrip_status : {type: String , default: 'active'},
    subscrip_date : {type:  Date , default: Date.now()},
    expiry_date : {type:  Date}
})

const Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;