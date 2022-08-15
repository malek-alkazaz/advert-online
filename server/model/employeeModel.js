const mongoose = require('mongoose');

var employeeSchema = new mongoose.Schema({
    username: {type : String , required: true , unique: true},
    password : {type : String , required: true},
    firstname : {type : String , required: true},
    fathername : {type : String , required: true},
    lastname : {type : String , required: true},
    dateOfB : {type : Date , required: true},
    address : {type : String , required: true},    
    phone : {type : Number , required: true, unique: true},
    skills : {type : String },
})

const Employee = mongoose.model('employee', employeeSchema);

module.exports = Employee;