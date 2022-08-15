const Customer = require('../model/customerModel');
const Price = require('../model/priceModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const fs = require('fs')

exports.addCustomer = async (req , res) =>{

    function expiryDate(monthN){
        let monthNumb = 0;
        if(monthN == null || monthN == 0){
            monthNumb = 1
        }else{
            monthNumb = parseInt(monthN)
        }
        subscripDate = new Date(Date.now());
        DateNow = new Date(Date.now());
        let NextYear = subscripDate.getUTCFullYear()+1;
        let NextMonth = 0;
        let CustDay = 0;
    
        if ((subscripDate.getUTCMonth()+ 1+ monthNumb) === 13 ){
            NextMonth = 1 ;
        }else{
            NextMonth = subscripDate.getUTCMonth()+ 1+ monthNumb;
        }
        if ( subscripDate.getUTCDate() === 31 || subscripDate.getUTCDate() === 30 || ( subscripDate.getUTCDate() === 28 && (subscripDate.getUTCMonth()+1) === 2)) {
            if( NextMonth === 4 || NextMonth === 6 || NextMonth === 9 || NextMonth === 11){
                CustDay = 30
            }
            else if( NextMonth === 1 || NextMonth === 3 || NextMonth === 5 || NextMonth === 7 || NextMonth === 8 || NextMonth === 10 || NextMonth === 12){
                CustDay = 31
            }
            else if( NextMonth === 2 ){ 
                CustDay = 28
            }        
        }else{
            CustDay = subscripDate.getUTCDate()
        }
    
        let dateString;
        if(NextMonth > 1 && NextMonth < 10){
            dateString = subscripDate.getUTCFullYear()+"-0"+ NextMonth +"-"+ CustDay
        }else if(NextMonth > 9){
            dateString = subscripDate.getUTCFullYear()+"-"+ NextMonth +"-"+ CustDay
        }else if(NextMonth === 1){
            dateString = NextYear +"-"+ NextMonth +"-"+ CustDay
        }
        expirySubscripDate = new Date(dateString+" 21:00:00");
        return expirySubscripDate;
    }

    function allowed_products(Month,extraProductNumber){
        if((extraProductNumber == null || extraProductNumber == 0) && (Month == null || Month == 0)){
            expro = 0;
            month_allowed = 1;
            return (month_allowed * 8) + expro;
        }else{
            expro = parseInt(extraProductNumber)
            month_allowed = parseInt(Month);
            return (month_allowed * 8) + expro;
        }
    }

    const priceOfSubscrip = await Price.find();
    function price(days,products,months){
        let Subscrip_Price = (days * parseInt(priceOfSubscrip[0].price)) + (products* parseInt(priceOfSubscrip[1].price)) + (months * parseInt(priceOfSubscrip[2].price));
        return Subscrip_Price;
    }

    const customer = await  Customer.find({username : req.body.username});
    if(customer.length >= 1){
        return res.json({message : "this username is already exist..."});
    }else{
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(req.body.password, salt , async (error , hash) => {
                if(error){
                    return res.json({message : "error in password..." + error});
                }else{
                    var images =[];
                    var i=0;
                    if (req.files.length != 0) {
                        for (const single_file of req.files) {
                            for (let index = 0; index < 1; index++) {
                                images[i]= single_file.filename;
                            }
                            i++;
                        }
                    }
                    const customer = await new  Customer({
                        username : req.body.username,
                        password : hash,
                        shop_name : req.body.shop_name,
                        shop_address : req.body.shop_address,
                        phone1 : req.body.phone1,
                        phone2 : req.body.phone2,   
                        image : images[0],
                        brief : req.body.brief,
                        pageurl : null,
                        extra_days : parseInt(req.body.extraDays),
                        extra_products : parseInt(req.body.extraProduct),
                        months : parseInt(req.body.expiryDate),
                        permitted_products : allowed_products(req.body.expiryDate ,req.body.extraProduct),
                        subscrip_price : price(parseInt(req.body.extraDays),parseInt(req.body.expiryDate),parseInt(req.body.extraProduct)),
                        expiry_date : expiryDate(req.body.expiryDate)
                    }).save();
                     Customer.findOneAndUpdate(
                        {_id: customer._id},
                        {$set:{ pageurl: '/store?cust_id='+customer._id }},
                        {new: true}).then(data =>{
                            if(data === null){ throw new Error('Customer Not Found'); }
                        })
                    res.status(200).redirect('/customers');
                }
            });
        });
    }
}
//Find Customer
exports.findCustomers = async (req,res) =>{
    const customers = await Customer.find();
    return { customers }
}
//delete Customer
exports.deleteCusromer = async (req,res) =>{
    
    const id = req.params.id;
    Customer.findByIdAndDelete(id)
    .then(data => {
        if(!data){
            res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
        }else{
            // res.status(200).send({message : "Customer was deleted successfully!"});
            res.redirect('/customers');
        }
    })
    .catch(err =>{
        res.status(500).send({
            message: "Could not delete Customer with id=" + id
        });
    });
}
//update Customer Info
exports.updateCustomer = async (req, res)=>{




    function expiryDate(monthN,oldExpairDate,isActive){
        let monthNumb = 0;
        if(monthN == null || monthN == 0){
            monthNumb = 1
        }else{
            monthNumb = parseInt(monthN)
        }
        if(isActive == 'active'){
            subscripDate = new Date(oldExpairDate);
        }else{
            subscripDate = new Date(Date.now());
        }
        let NextYear = subscripDate.getUTCFullYear()+1;
        let NextMonth = 0;
        let CustDay = 0;
    
        if ((subscripDate.getUTCMonth()+ 1+ monthNumb) === 13 ){
            NextMonth = 1 ;
        }else{
            NextMonth = subscripDate.getUTCMonth()+ 1+ monthNumb;
        }
        if ( subscripDate.getUTCDate() === 31 || subscripDate.getUTCDate() === 30 || ( subscripDate.getUTCDate() === 28 && (subscripDate.getUTCMonth()+1) === 2)) {
            if( NextMonth === 4 || NextMonth === 6 || NextMonth === 9 || NextMonth === 11){
                CustDay = 30
            }
            else if( NextMonth === 1 || NextMonth === 3 || NextMonth === 5 || NextMonth === 7 || NextMonth === 8 || NextMonth === 10 || NextMonth === 12){
                CustDay = 31
            }
            else if( NextMonth === 2 ){ 
                CustDay = 28
            }        
        }else{
            CustDay = subscripDate.getUTCDate()
        }
    
        let dateString;
        if(NextMonth > 1 && NextMonth < 10){
            dateString = subscripDate.getUTCFullYear()+"-0"+ NextMonth +"-"+ CustDay
        }else if(NextMonth > 9){
            dateString = subscripDate.getUTCFullYear()+"-"+ NextMonth +"-"+ CustDay
        }else if(NextMonth === 1){
            dateString = NextYear +"-"+ NextMonth +"-"+ CustDay
        }
        expirySubscripDate = new Date(dateString+" 21:00:00");
        return expirySubscripDate;
    }

    function allowed_products(Month,extraProductNumber){
        if((extraProductNumber == null || extraProductNumber == 0) && (Month == null || Month == 0)){
            expro = 0;
            month_allowed = 1;
            return 0;
        }else{
            expro = parseInt(extraProductNumber)
            month_allowed = parseInt(Month);
            return (month_allowed * 8) + expro;
        }
    }

    const priceOfSubscrip = await Price.find();
    function price(days,products,months){
        let Subscrip_Price = parseInt((days * parseInt(priceOfSubscrip[0].price)) + (products * parseInt(priceOfSubscrip[1].price)) + (months * parseInt(priceOfSubscrip[2].price)));
        return Subscrip_Price;
    }


    let customerID = req.query.cust_id;
    
    const DIR = 'uploads';
    var customerImage;
    const customerUpdate = req.body;
    //Delete Image From uploads File
    if (!req.files.length) {
        console.log("No File Uploaded")
    }else{
        console.log("File Uploaded")
        const customer = await Customer.findById(customerID);
        if(!customer){
            console.log("No Customer Found")
        }else if(!customer.image){
            console.log("No Image Found")
        }else{
            const image = customer.image;
            fs.unlinkSync(DIR+'/'+image);
        }
    }
    var i=0;
    if (req.files.length != 0) {
        for (const single_file of req.files) {
            for (let index = 0; index < 1; index++) {;
                customerImage = single_file.filename;
            }
            i++;
        }
    }

    const customer = await Customer.findById(customerID);
    const customerck = await Customer.findById(customerID);

    if(req.files.length == 0){
        customerUpdate.image = customer.image;
    }else{
        customerUpdate.image = customerImage;
    }
    
    console.log(customerUpdate);
    console.log("-------------------");


    function UpdateOutExpair(username,shop_name,shop_address,phone1,phone2,image){
        Customer.findOneAndUpdate(
            {_id: customerID},
            {$set:{
                username:username,
                shop_name:shop_name,
                shop_address:shop_address,
                phone1:phone1,
                phone2:phone2,
                image:image
            }},
            {new: true}).then(data =>{
                if(data === null){ throw new Error('Customer Not Found');
                }else{
                    res.redirect('/customers');
                }
            })
    }

    //UserName Not Existing
    if(!customerUpdate.username){
        customerUpdate.username = customerck.username;
        if(!customerUpdate.password){
            if(customer.subscrip_status == 'active'){
                if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                    permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                    extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                    subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                    
                    console.log('oldUserName - inpassword - active - In-expiryDate');
                    console.log(customerUpdate);
                    console.log("permittedProducts" + permittedProducts);
                    console.log("extraDays" + extraDays);
                    console.log("subscripPrice" + subscripPrice);
                    Customer.findOneAndUpdate(
                        {_id: customerID},
                        {$set:{
                            username:customerUpdate.username,
                            shop_name:customerUpdate.shop_name,
                            shop_address:customerUpdate.shop_address,
                            phone1:customerUpdate.phone1,
                            phone2:customerUpdate.phone2,
                            image:customerUpdate.image,
                            permitted_products:permittedProducts,
                            extra_products:parseInt(customerUpdate.extraProduct),
                            subscrip_price:subscripPrice,
                            extra_days:extraDays
                        }},
                        {new: true}).then(data =>{
                            if(data === null){ throw new Error('Customer Not Found');
                             }else{
                                res.redirect('/customers');
                            }
                        })
                }else{
                    expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                    permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                    extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                    subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                    console.log('oldUserName - inpassword - active - expiryDate');
                    console.log(customerUpdate);
                    console.log("permittedProducts" + permittedProducts);
                    console.log("extraDays" + extraDays);
                    console.log("subscripPrice" + subscripPrice);
                    Customer.findOneAndUpdate(
                        {_id: customerID},
                        {$set:{
                            username:customerUpdate.username,
                            shop_name:customerUpdate.shop_name,
                            shop_address:customerUpdate.shop_address,
                            phone1:customerUpdate.phone1,
                            phone2:customerUpdate.phone2,
                            image:customerUpdate.image,
                            expiry_date:expiry_Date,
                            permitted_products:permittedProducts,
                            extra_products:parseInt(customerUpdate.extraProduct),
                            subscrip_price:subscripPrice,
                            extra_days:extraDays
                        }},
                        {new: true}).then(data =>{
                           if(data === null){ throw new Error('Customer Not Found');
                             }else{
                                res.redirect('/customers');
                            }
                        })
                }
                
            }else{
                if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                    UpdateOutExpair( customerUpdate.username,customerUpdate.shop_name,customerUpdate.shop_address,
                        customerUpdate.phone1,customerUpdate.phone2,customerUpdate.image);
                        console.log('oldUserName - inpassword - Inactive - InexpiryDate');
                        console.log(customerUpdate);
                }else{
                    expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                    permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                    extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                    subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                    console.log('oldUserName - inpassword - Inactive - expiryDate');
                    console.log(customerUpdate);
                    console.log("permittedProducts" + permittedProducts);
                    console.log("extraDays" + extraDays);
                    console.log("subscripPrice" + subscripPrice);

                    Customer.findOneAndUpdate(
                        {_id: customerID},
                        {$set:{
                            username:customerUpdate.username,
                            shop_name:customerUpdate.shop_name,
                            shop_address:customerUpdate.shop_address,
                            phone1:customerUpdate.phone1,
                            phone2:customerUpdate.phone2,
                            image:customerUpdate.image,
                            expiry_date:expiry_Date,
                            subscrip_status:"active",
                            permitted_products:permittedProducts,
                            extra_products:parseInt(customerUpdate.extraProduct),
                            subscrip_price:subscripPrice,
                            extra_days:extraDays
                        }},
                        {new: true}).then(data =>{
                            if(data === null){ throw new Error('Customer Not Found');
                             }else{
                                res.redirect('/customers');
                            }
                        })
                }
            }
        }else{

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(customerUpdate.password, salt , async (error , hash) => {
                    if(error){
                        return res.json({message : "error in password..." + error});
                    }else{
                        customerUpdate.password = hash;

                        if(customer.subscrip_status == 'active'){
                            if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                permittedProducts = allowed_products(customerUpdate.expiryDate,customerUpdate.extraProduct) + customer.permitted_products;
                                extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                subscripPrice = customer.subscrip_price + price( parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct));
                                console.log('oldUserName - password - active - InexpiryDate');
                                console.log(customerUpdate);
                                console.log("permittedProducts" + permittedProducts);
                                console.log("extraDays" + extraDays);
                                console.log("subscripPrice" + subscripPrice);
                                Customer.findOneAndUpdate(
                                    {_id: customerID},
                                    {$set:{
                                        username:customerUpdate.username,
                                        password:customerUpdate.password,
                                        shop_name:customerUpdate.shop_name,
                                        shop_address:customerUpdate.shop_address,
                                        phone1:customerUpdate.phone1,
                                        phone2:customerUpdate.phone2,
                                        image:customerUpdate.image,
                                        permitted_products:permittedProducts,
                                        extra_products:parseInt(customerUpdate.extraProduct),
                                        subscrip_price:subscripPrice,
                                        extra_days:extraDays
                                    }},
                                    {new: true}).then(data =>{
                                        if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                    })
                            }else{
                                expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                console.log('oldUserName - password - active - expiryDate');
                                console.log(customerUpdate);
                                console.log("permittedProducts" + permittedProducts);
                                console.log("extraDays" + extraDays);
                                console.log("subscripPrice" + subscripPrice);
                                Customer.findOneAndUpdate(
                                    {_id: customerID},
                                    {$set:{
                                        username:customerUpdate.username,
                                        password:customerUpdate.password,
                                        shop_name:customerUpdate.shop_name,
                                        shop_address:customerUpdate.shop_address,
                                        phone1:customerUpdate.phone1,
                                        phone2:customerUpdate.phone2,
                                        image:customerUpdate.image,
                                        expiry_date:expiry_Date,
                                        permitted_products:permittedProducts,
                                        extra_products:parseInt(customerUpdate.extraProduct),
                                        subscrip_price:subscripPrice,
                                        extra_days:extraDays
                                    }},
                                    {new: true}).then(data =>{
                                        if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                    })
                            }
                            
                        }else{
                            if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                UpdateOutExpair( customerUpdate.username,customerUpdate.shop_name,customerUpdate.shop_address,
                                    customerUpdate.phone1,customerUpdate.phone2,customerUpdate.image);
                                    console.log('oldUserName - password - inactive - expiryDate');
                                    console.log(customerUpdate);
                            }else{
                                expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                
                                console.log('oldUserName - password - Inactive - InexpiryDate');
                                console.log(customerUpdate);
                                console.log("permittedProducts" + permittedProducts);
                                console.log("extraDays" + extraDays);
                                console.log("subscripPrice" + subscripPrice);

                                Customer.findOneAndUpdate(
                                    {_id: customerID},
                                    {$set:{
                                        username:customerUpdate.username,
                                        password:customerUpdate.password,
                                        shop_name:customerUpdate.shop_name,
                                        shop_address:customerUpdate.shop_address,
                                        phone1:customerUpdate.phone1,
                                        phone2:customerUpdate.phone2,
                                        image:customerUpdate.image,
                                        expiry_date:expiry_Date,
                                        subscrip_status:"active",
                                        permitted_products:permittedProducts,
                                        extra_products:parseInt(customerUpdate.extraProduct),
                                        subscrip_price:subscripPrice,
                                        extra_days:extraDays
                                    }},
                                    {new: true}).then(data =>{
                                        if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                    })
                            }
                        }
                    }
                })
            })

        }
    }else{
        //UserName is Existing and Old
        if(customerUpdate.username == customer.username){
            customerUpdate.username = customer.username;
            if(!customerUpdate.password){
                if(customer.subscrip_status == 'active'){
                    if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                        permittedProducts = allowed_products(customerUpdate.expiryDate,customerUpdate.extraProduct) + customer.permitted_products;
                        extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                        subscripPrice = customer.subscrip_price + price( parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct));
                        console.log('ExistingUserName Old - inpassword - active - InexpiryDate');
                        console.log(customerUpdate);
                        console.log("permittedProducts" + permittedProducts);
                        console.log("extraDays" + extraDays);
                        console.log("subscripPrice" + subscripPrice);

                        Customer.findOneAndUpdate(
                            {_id: customerID},
                            {$set:{
                                username:customerUpdate.username,
                                shop_name:customerUpdate.shop_name,
                                shop_address:customerUpdate.shop_address,
                                phone1:customerUpdate.phone1,
                                phone2:customerUpdate.phone2,
                                image:customerUpdate.image,
                                permitted_products:permittedProducts,
                                extra_products:parseInt(customerUpdate.extraProduct),
                                subscrip_price:subscripPrice,
                                extra_days:extraDays
                            }},
                            {new: true}).then(data =>{
                                if(data === null){ throw new Error('Customer Not Found');
                             }else{
                                res.redirect('/customers');
                            }
                            })
                    }else{
                        expiry_Date = expiryDate(parseInt(customerUpdate.expiryDate),customer.expiry_date,customer.subscrip_status);
                        permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                        extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                        subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                        console.log('ExistingUserName Old  - inpassword - active - expiryDate');
                        Customer.findOneAndUpdate(
                            {_id: customerID},
                            {$set:{
                                username:customerUpdate.username,
                                shop_name:customerUpdate.shop_name,
                                shop_address:customerUpdate.shop_address,
                                phone1:customerUpdate.phone1,
                                phone2:customerUpdate.phone2,
                                image:customerUpdate.image,
                                expiry_date:expiry_Date,
                                permitted_products:permittedProducts,
                                extra_products:parseInt(customerUpdate.extraProduct),
                                subscrip_price:subscripPrice,
                                extra_days:extraDays
                            }},
                            {new: true}).then(data =>{
                                if(data === null){ throw new Error('Customer Not Found');
                             }else{
                                res.redirect('/customers');
                            }
                            })
                    }
                    
                }else{
                    if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                        UpdateOutExpair( customerUpdate.username,customerUpdate.shop_name,customerUpdate.shop_address,
                            customerUpdate.phone1,customerUpdate.phone2,customerUpdate.image);
                            console.log('ExistingUserName Old - inpassword - Inactive - InexpiryDate');
                            console.log(customerUpdate);
                    }else{
                        //'ExistingUserName Old - inpassword - Inactive - expiryDate'
                        expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                        permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                        extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                        subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                        Customer.findOneAndUpdate(
                            {_id: customerID},
                            {$set:{
                                username:customerUpdate.username,
                                shop_name:customerUpdate.shop_name,
                                shop_address:customerUpdate.shop_address,
                                phone1:customerUpdate.phone1,
                                phone2:customerUpdate.phone2,
                                image:customerUpdate.image,
                                expiry_date:expiry_Date,
                                subscrip_status:"active",
                                permitted_products:permittedProducts,
                                extra_products:parseInt(customerUpdate.extraProduct),
                                subscrip_price:subscripPrice,
                                extra_days:extraDays
                            }},
                            {new: true}).then(data =>{
                                if(data === null){ throw new Error('Customer Not Found');
                             }else{
                                 res.redirect('/customers')
                             }
                            })
                    }
                }
            }else{
                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(customerUpdate.password, salt , async (error , hash) => {
                        if(error){
                            return res.json({message : "error in password..." + error});
                        }else{
                            customerUpdate.password = hash;
                            if(customer.subscrip_status == 'active'){
                                if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                    permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                    extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                    subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                    
                                    console.log('ExistingUserName Old - password - active - expiryDate');
                                    console.log(customerUpdate);
                                    
                                    Customer.findOneAndUpdate(
                                        {_id: customerID},
                                        {$set:{
                                            username:customerUpdate.username,
                                            password:customerUpdate.password,
                                            shop_name:customerUpdate.shop_name,
                                            shop_address:customerUpdate.shop_address,
                                            phone1:customerUpdate.phone1,
                                            phone2:customerUpdate.phone2,
                                            image:customerUpdate.image,
                                            permitted_products:customerUpdate.permitted_products,
                                            extra_products:customerUpdate.extraProduct,
                                            subscrip_price:customerUpdate.subscrip_price,
                                            extra_days:customerUpdate.extra_days
                                        }},
                                        {new: true}).then(data =>{
                                            if(data === null){ throw new Error('Customer Not Found');
                                         }else{
                                            res.redirect('/customers');
                                        }
                                        })
                                }else{
                                    customerUpdate.expiry_date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                    customerUpdate.permitted_products = allowed_products(customerUpdate.expiryDate,customerUpdate.extraProduct) + customer.permitted_products;
                                    customerUpdate.extra_days =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                    customerUpdate.subscrip_price = customer.subscrip_price + price( parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct));
                                    console.log('ExistingUserName Old - password - active - InexpiryDate');
                                    console.log(customerUpdate);
                                    console.log("permittedProducts" + permittedProducts);
                                    console.log("extraDays" + extraDays);
                                    console.log("subscripPrice" + subscripPrice);
                                    
                                    Customer.findOneAndUpdate(
                                        {_id: customerID},
                                        {$set:{
                                            username:customerUpdate.username,
                                            password:customerUpdate.password,
                                            shop_name:customerUpdate.shop_name,
                                            shop_address:customerUpdate.shop_address,
                                            phone1:customerUpdate.phone1,
                                            phone2:customerUpdate.phone2,
                                            image:customerUpdate.image,
                                            expiry_date:customerUpdate.expiry_date,
                                            permitted_products:customerUpdate.permitted_products,
                                            extra_products:customerUpdate.extraProduct,
                                            subscrip_price:customerUpdate.subscrip_price,
                                            extra_days:customerUpdate.extra_days
                                        }},
                                        {new: true}).then(data =>{
                                            if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                        res.redirect('/customers');
                                        }
                                        })
                                }
                                
                            }else{
                                if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                    UpdateOutExpair( customerUpdate.username,customerUpdate.shop_name,customerUpdate.shop_address,
                                        customerUpdate.phone1,customerUpdate.phone2,customerUpdate.image);
                                        console.log('ExistingUserName Old - password - Inactive - InexpiryDate');
                                }else{
                                    customerUpdate.expiry_date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                    customerUpdate.permitted_products = allowed_products(customerUpdate.expiryDate,customerUpdate.extraProduct) + customer.permitted_products;
                                    customerUpdate.extra_days =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                    customerUpdate.subscrip_price = customer.subscrip_price + price( parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct));
                                    console.log('ExistingUserName Old - password - Inactive - expiryDate');
                                    console.log(customerUpdate);
                                    console.log("permittedProducts" + permittedProducts);
                                    console.log("extraDays" + extraDays);
                                    console.log("subscripPrice" + subscripPrice);
                                    
                                    Customer.findOneAndUpdate(
                                        {_id: customerID},
                                        {$set:{
                                            username:customerUpdate.username,
                                            password:customerUpdate.password,
                                            shop_name:customerUpdate.shop_name,
                                            shop_address:customerUpdate.shop_address,
                                            phone1:customerUpdate.phone1,
                                            phone2:customerUpdate.phone2,
                                            image:customerUpdate.image,
                                            expiry_date:customerUpdate.expiry_date,
                                            subscrip_status:"active",
                                            permitted_products:customerUpdate.permitted_products,
                                            extra_products:customerUpdate.extraProduct,
                                            subscrip_price:customerUpdate.subscrip_price,
                                            extra_days:customerUpdate.extra_days
                                        }},
                                        {new: true}).then(data =>{
                                            if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                        })
                                }
                            }
                        }
                    })
                })
            }
        }else{
             //UserName is Existing and NewUserName
            const Chkcustomer = await  Customer.find({username : customerUpdate.username});
                if(Chkcustomer.length >= 1){
                    return res.json({message : "this username is already exist..."});
                }else{
                    if(!customerUpdate.password){
                        if(customer.subscrip_status == 'active'){
                            if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                Customer.findOneAndUpdate(
                                    {_id: customerID},
                                    {$set:{
                                        username:customerUpdate.username,
                                        shop_name:customerUpdate.shop_name,
                                        shop_address:customerUpdate.shop_address,
                                        phone1:customerUpdate.phone1,
                                        phone2:customerUpdate.phone2,
                                        image:customerUpdate.image,
                                        permitted_products:permittedProducts,
                                        extra_products:parseInt(customerUpdate.extraProduct),
                                        subscrip_price:subscripPrice,
                                        extra_days:extraDays
                                    }},
                                    {new: true}).then(data =>{
                                        if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                    })
                            }else{
                                expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                Customer.findOneAndUpdate(
                                    {_id: customerID},
                                    {$set:{
                                        username:customerUpdate.username,
                                        shop_name:customerUpdate.shop_name,
                                        shop_address:customerUpdate.shop_address,
                                        phone1:customerUpdate.phone1,
                                        phone2:customerUpdate.phone2,
                                        image:customerUpdate.image,
                                        expiry_date:expiry_Date,
                                        permitted_products:permittedProducts,
                                        extra_products:parseInt(customerUpdate.extraProduct),
                                        subscrip_price:subscripPrice,
                                        extra_days:extraDays
                                    }},
                                    {new: true}).then(data =>{
                                        if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                    })
                            }
                            
                        }else{
                            if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                UpdateOutExpair( customerUpdate.username,customerUpdate.shop_name,customerUpdate.shop_address,
                                    customerUpdate.phone1,customerUpdate.phone2,customerUpdate.image);
                            }else{
                                expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                console.log('newUserName - inpassword - inactive');
                                console.log(customerUpdate);
                                Customer.findOneAndUpdate(
                                    {_id: customerID},
                                    {$set:{
                                        username:customerUpdate.username,
                                        shop_name:customerUpdate.shop_name,
                                        shop_address:customerUpdate.shop_address,
                                        phone1:customerUpdate.phone1,
                                        phone2:customerUpdate.phone2,
                                        image:customerUpdate.image,
                                        expiry_date:expiry_Date,
                                        subscrip_status:"active",
                                        permitted_products:permittedProducts,
                                        extra_products:parseInt(customerUpdate.extraProduct),
                                        subscrip_price:subscripPrice,
                                        extra_days:extraDays
                                    }},
                                    {new: true}).then(data =>{
                                        if(data === null){ throw new Error('Customer Not Found');
                                        }else{
                                            res.redirect('/customers');
                                        }
                                    })
                            }
                        }
                    }else{

                        bcrypt.genSalt(saltRounds, function(err, salt) {
                            bcrypt.hash(password, salt , async (error , hash) => {
                                if(error){
                                    return res.json({message : "error in password..." + error});
                                }else{
                                        customerUpdate.password = hash;

                                    if(customer.subscrip_status == 'active'){
                                        if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                            expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                            permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                            extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                            subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));

                                            Customer.findOneAndUpdate(
                                                {_id: customerID},
                                                {$set:{
                                                    username:customerUpdate.username,
                                                    password:customerUpdate.password,
                                                    shop_name:customerUpdate.shop_name,
                                                    shop_address:customerUpdate.shop_address,
                                                    phone1:customerUpdate.phone1,
                                                    phone2:customerUpdate.phone2,
                                                    image:customerUpdate.image,
                                                    permitted_products:permittedProducts,
                                                    extra_products:parseInt(customerUpdate.extraProduct),
                                                    subscrip_price:subscripPrice,
                                                    extra_days:extraDays
                                                }},
                                                {new: true}).then(data =>{
                                                    if(data === null){ throw new Error('Customer Not Found');
                                                    }else{
                                                        res.redirect('/customers');
                                                    }
                                                })
                                        }else{
                                            expiry_Date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                            permittedProducts = allowed_products(parseInt(customerUpdate.expiryDate),parseInt(customerUpdate.extraProduct)) + parseInt(customer.permitted_products);
                                            extraDays =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                            subscripPrice = customer.subscrip_price + price(parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct),parseInt(customerUpdate.expiryDate));
                                            
                                            Customer.findOneAndUpdate(
                                                {_id: customerID},
                                                {$set:{
                                                    username:customerUpdate.username,
                                                    password:customerUpdate.password,
                                                    shop_name:customerUpdate.shop_name,
                                                    shop_address:customerUpdate.shop_address,
                                                    phone1:customerUpdate.phone1,
                                                    phone2:customerUpdate.phone2,
                                                    image:customerUpdate.image,
                                                    expiry_date:customerUpdate.expiry_date,
                                                    permitted_products:permittedProducts,
                                                    extra_products:parseInt(customerUpdate.extraProduct),
                                                    subscrip_price:subscripPrice,
                                                    extra_days:extraDays
                                                }},
                                                {new: true}).then(data =>{
                                                    if(data === null){ throw new Error('Customer Not Found');
                                                    }else{
                                                        res.redirect('/customers');
                                                    }
                                                })
                                        }
                                        
                                    }else{
                                        if(!customerUpdate.expiryDate || customerUpdate.expiryDate == 0 ){
                                            UpdateOutExpair( customerUpdate.username,customerUpdate.shop_name,customerUpdate.shop_address,
                                                customerUpdate.phone1,customerUpdate.phone2,customerUpdate.image);
                                        }else{
                                            customerUpdate.expiry_date = expiryDate(customerUpdate.expiryDate,customer.expiry_date,customer.subscrip_status);
                                            customerUpdate.permitted_products = allowed_products(customerUpdate.expiryDate,customerUpdate.extraProduct) + customer.permitted_products;
                                            customerUpdate.extra_days =  parseInt(customerUpdate.extraDays) + parseInt(customer.extra_days);
                                            customerUpdate.subscrip_price = customer.subscrip_price + price( parseInt(customerUpdate.extraDays), parseInt(customerUpdate.extraProduct));
                                            Customer.findOneAndUpdate(
                                                {_id: customerID},
                                                {$set:{
                                                    username:customerUpdate.username,
                                                    password:customerUpdate.password,
                                                    shop_name:customerUpdate.shop_name,
                                                    shop_address:customerUpdate.shop_address,
                                                    phone1:customerUpdate.phone1,
                                                    phone2:customerUpdate.phone2,
                                                    image:customerUpdate.image,
                                                    expiry_date:customerUpdate.expiry_date,
                                                    subscrip_status:"active",
                                                    permitted_products:customerUpdate.permitted_products,
                                                    extra_products:customerUpdate.extraProduct,
                                                    subscrip_price:customerUpdate.subscrip_price,
                                                    extra_days:customerUpdate.extra_days
                                                }},
                                                {new: true}).then(data =>{
                                                    if(data === null){ throw new Error('Customer Not Found');
                                                    }else{
                                                        res.redirect('/customers');
                                                    }
                                                })
                                        }
                                    }
                                }
                        })
                    })
                }
            }
        }

    }
    
}
//Customer Details
exports.customeDetails= async (customerID)=>{
    const customer = await Customer.findById(customerID)
    return { customer }
}
//update Customer Profile
exports.updateProfile = async(req,res) => {

    let customerID = req.query.cust_id;
    const DIR = 'uploads';

    //Delete Image From uploads File
    if (!req.files.length) {
        console.log("No File Uploaded")
    }else{
        console.log("File Uploaded")
        const customer = await Customer.findById(req.session.userId);
        if(!customer){
            console.log("No Customer Found")
        }else if(!customer.image){
            console.log("No Image Found")
        }else{
            const image = customer.image;
            fs.unlinkSync(DIR+'/'+image);
        }
    }

    var customerImage;
    var i=0;
    if (req.files.length != 0) {
        for (const single_file of req.files) {
            for (let index = 0; index < 1; index++) {;
                customerImage = single_file.filename;
            }
            i++;
        }
    }

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, salt , async (error , hash) => {
            if(error){
                return res.json({message : "error in password..." + error});
            }else{
                customerID = req.session.userId;
                Customer.findOneAndUpdate(
                    {_id: customerID},
                    {$set:{ 
                        password: hash,
                        shop_name: req.body.shop_name,
                        shop_address: req.body.shop_address,
                        phone1: req.body.phone1,
                        phone2: req.body.phone2,
                        brief: req.body.brief,
                        image:customerImage
                    }},
                    {new: true}).then(data =>{
                        if(data === null){ throw new Error('Customer Not Found'); }
                        res.status(200).redirect(`/store?cust_id=${customerID}`);
                    })
            }
        })
    })
}
//search Customer
exports.searchCustomer = async (searchWord) =>{
    const searchField = searchWord;
    const searcharray = searchWord.split(" ");
    let customers;
    if(!searchWord){
        customers = await Customer.find();
    }else if(searcharray.length == 1){
        customers = await Customer.find(
            {$or:[
                {shop_name:{$regex: searcharray[0] , $options: '$i'}},
                {username:{$regex: searcharray[0] , $options: '$i'}}
            ]}
        )
    }
    return { customers };
}