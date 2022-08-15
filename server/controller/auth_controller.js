const customer_auth = require('../model/customerModel');
const employee_auth = require('../model/employeeModel');
const admin_auth = require('../model/adminModel');
const Price = require('../model/priceModel');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
global.globalString;
module.exports = {
    addAdmin:  async (req , res) =>{
        const admin = await admin_auth.find({username : req.body.username});
        if(admin.length >= 1){
            return res.json({message : "this username is already exist..."});
        }else{
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(req.body.password, salt , async (error , hash) => {
                    if(error){
                        return res.json({message : "error in password..." + error});
                    }else{
                        const admin = await new admin_auth({
                            username : req.body.username,
                            password : hash,
                        }).save();
                        res.json({
                            message : "create admin successfuly..!",
                            username : admin.username,
                            password : admin.password
                        });
                    }
                });
            });
        }
    },

    updateAdmin:async (req , res) =>{
        const admin = await admin_auth.find({_id : req.body.id});
        const id =req.body.id;
        if(admin.length < 1){
            return res.json({message : "this username is not exist..."});
        }else{
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(req.body.password, salt , async (error , hash) => {
                    if(error){
                        return res.json({message : "error in password..." + error});
                    }else{
                        const admin = admin_auth.findOneAndUpdate(
                            {_id: id},
                            {$set:{
                                username : req.body.username,
                                password : hash
                            }},
                            {new: true}).then(data =>{
                                if(data === null){
                                    throw new Error('Admin Not Found');
                                }
                                res.json({ message: 'Admin updated!' })
                                console.log("New admin data", data);
                            })
                        res.json({
                            message : "Update admin successfuly..!",
                            username : admin.username,
                        });
                    }
                }); 
            });
        }
    },

    login:async (req , res) =>{
        const customer = await customer_auth.find({username : req.body.username});
        const employee = await employee_auth.find({username : req.body.username});
        const admin = await admin_auth.find({username : req.body.username});
        
        async function checkDate(id){
            const customer = await customer_auth.findById(id);
            DateNow =  new Date(Date.now());
            expiryDate = customer.expiry_date;

            currentYear = DateNow.getUTCFullYear();
            currentMonth = DateNow.getUTCMonth()+1;
            currentDay = DateNow.getUTCDate();
            
            finishYear = expiryDate.getUTCFullYear();
            finishMonth = expiryDate.getUTCMonth()+1;
            finishDay = expiryDate.getUTCDate();
            if(currentYear >= finishYear && currentMonth >= finishMonth && currentDay >= finishDay){

                customer_auth.findOneAndUpdate(
                    {_id: id},
                    {$set:{ 
                        subscrip_status: 'inactive',
                        extra_days: 0,
                        permitted_products:0,
                        subscrip_price:0
                     }},
                    {new: true}).then(data =>{
                        if(data === null){ throw new Error('Customer Not Found'); }
                        res.json({ 
                            message: 'product added successfully..!',
                        })
                    })
            }
        }
        if(customer.length < 1 && employee.length < 1 && admin.length < 1){
            return res.json({message : "this UserName is not exist..."});
        }else if(customer.length >= 1){
            bcrypt.compare(req.body.password,customer[0].password, async (error , result) =>{
                if(error){
                    throw error;
                }
                if(!result){
                    return res.json({message : "password not exist..."});
                }
                if(result){
                    const token = jwt.sign({username: customer[0].username },"Coustomer");
                    res.cookie('token',token);
                    res.cookie('id',customer[0].id);
                    req.session.userId = customer[0].id;
                    req.session.userType = "customer";
                    checkDate(customer[0].id);
                    globalString = customer[0].id;
                    res.redirect('/home');
                    // return res.json({
                    //     message : "Coustomer loggin",
                    //     id: customer[0].id,
                    //     username : customer[0].username,
                    //     token : token
                    // });
                }
            });
        }
        else if(employee.length >= 1){
            bcrypt.compare(req.body.password,employee[0].password, async (error , result) =>{
                if(error){
                    throw error;
                }
                if(!result){
                    return res.json({message : "password not exist..."});
                }
                if(result){
                    const token = jwt.sign({username: employee[0].username },"Employee");
                    res.cookie('token',token);
                    req.session.userId = employee[0].id;
                    req.session.userType = 'employee';
                    res.redirect('/');
                    // return res.json({
                    //     message : "Employee loggin",
                    //     id: employee[0].id,
                    //     username : employee[0].username,
                    //     token : token
                    // });
                }
            });
        }else if(admin.length >= 1){
            bcrypt.compare(req.body.password,admin[0].password, async (error , result) =>{
                if(error){
                    throw error;
                }
                if(!result){
                    return res.json({message : "password not exist..."});
                }
                if(result){
                    const token = jwt.sign({username: admin[0].username },"Admin");
                    res.cookie('token',token);
                    req.session.userId = admin[0].id;
                    req.session.userType = "admin";
                    res.redirect('/home');
                }
            });
        }else{
            return res.json({message : "Error in Admin..."});
        }
    }
}