const Employee = require('../model/employeeModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

module.exports = {
    getEmployees: async (req , res) =>{
        const employees = await Employee.find();
        return employees;
    },
    findEmployee: async (employeeID) =>{
        const employee = await Employee.findById(employeeID);
        return employee;
    },
    addEmployee:  async (req , res) =>{
        const user = await Employee.find({username : req.body.username});
        if(user.length >= 1){
            return res.json({message : "this username is already exist..."});
        }else{
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(req.body.password, salt , async (error , hash) => {
                    if(error){
                        return res.json({message : "error in password..." + error});
                    }else{
                        const emp_auth = await new Employee({
                            username : req.body.username,
                            password : hash,
                            firstname : req.body.firstname,
                            fathername : req.body.fathername,
                            lastname : req.body.lastname,
                            dateOfB : req.body.dateOfB,
                            address : req.body.address,    
                            phone : req.body.phone,
                            skills : req.body.skills
                        }).save();
                        res.status(200).redirect('/employees');
                    }
                });
            });
        }
    },
    updateEmployee: async(req,res) =>{

        let employeeID = req.body.id;
        const employeeUpdate = req.body;
        
        if(!employeeUpdate.password){
            const employeepass = await Employee.findById(employeeID);
            employeeUpdate.password = employeepass.password;

            Employee.findByIdAndUpdate(employeeID, employeeUpdate , { useFindAndModify: false})
            .then(data => {
                if(!data){
                    res.status(404).send({ message : `Cannot Update Employee with ${id}. Maybe Employee not found!`})
                }else{
                    //res.status(200).send({message : "Employee was updated successfully!"});
                    res.status(200).redirect('/employees');
                }
            })
            .catch(err =>{
                res.status(500).send({ message : "Error Update Employee"})
            })
            
        }else{
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(employeeUpdate.password, salt , async (error , hash) => {
                    if(error){
                        return res.json({message : "error in password..." + error});
                    }else{

                        employeeUpdate.password = hash;
                        Employee.findByIdAndUpdate(employeeID, employeeUpdate , { useFindAndModify: false})
                        .then(data => {
                            if(!data){
                                res.status(404).send({ message : `Cannot Update Employee with ${id}. Maybe Employee not found!`})
                            }else{
                                //res.status(200).send({message : "Employee was updated successfully!"});
                                res.status(200).redirect('/employees');
                            }
                        })
                        .catch(err =>{
                            res.status(500).send({ message : "Error Update Employee"})
                        })
                       
                    }
                })
            })
        }

    },
    deleteEmployee: async(req,res) =>{
        const id = req.params.id;

        Employee.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                // res.status(200).send({message : "Employee was deleted successfully!"});
                res.redirect('/employees');
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: "Could not delete Employee with id=" + id
            });
        });
    },
    searchEmployees: async (searchWord) =>{
        const searchField = searchWord;
        const searcharray = searchWord.split(" ");
        let employees;
        if(!searchWord){
            employees = await Employee.find();
        }else if(searcharray.length == 1){
            employees = await Employee.find({ firstname:searcharray[0] })
        }else if(searcharray.length == 2){
            employees = await Employee.find(
                {$and:[
                    {firstname:{$regex: searcharray[0] , $options: '$i'}},
                    {fathername:{$regex: searcharray[1] , $options: '$i'}}
                ]}
            )
        }else if(searcharray.length == 3){
            employees = await Employee.find(
                {$and:[
                    {firstname:{$regex: searcharray[0] , $options: '$i'}},
                    {fathername:{$regex: searcharray[1] , $options: '$i'}},
                    {lastname:{$regex: searcharray[2] , $options: '$i'}}
                ]}
            )
        }
        return employees;
    }
}