const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    name: {type : String , required: true},
    url: {type : String}
})

const Category = mongoose.model('category', categorySchema);

module.exports = Category;