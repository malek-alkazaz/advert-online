const Product = require('../model/productModel');
const Customer = require('../model/customerModel');
const Category = require('../model/category')
const fs = require('fs')


//Add Product
exports.insertProduct = async (req , res ) =>{ 
    const customer_id = req.session.userId;
    const customer = await Customer.findById(customer_id);
    const products_count = customer.permitted_products;
    var images =[];
    var i=0;
    if (req.files.length != 0) {
        for (const single_file of req.files) {
            for (let index = 0; index < req.files.length; index++) {
                images[i]= single_file.filename;
            }
            i++;
        }
    }else{
        console.log("Error")
    }

    function expiryDay(extraDay){

        DateNow = new Date(Date.now());
        let NextYear = DateNow.getUTCFullYear()+1;
        let NextMonth = 0;
        let CustDay = 0;
        let exday = parseInt(extraDay)
    
        if ((DateNow.getUTCMonth()+ 2) === 13 ){
            NextMonth = 1 ;
        }else{
            NextMonth = DateNow.getUTCMonth()+ 2;
        }

        if((DateNow.getUTCDate()+3+(exday))> 31){
            if( NextMonth === 4 || NextMonth === 6 || NextMonth === 9 || NextMonth === 11){
                CustDay = ( DateNow.getUTCDate() + 3 + (exday) ) - 31
            }else if(  NextMonth === 1 || NextMonth === 3 || NextMonth === 5 || NextMonth === 7 || NextMonth === 8 || NextMonth === 10 || NextMonth === 12){
                CustDay = ( DateNow.getUTCDate() + 3 + (exday) ) - 30;
            }else if(NextMonth === 2){ 
                CustDay = ( DateNow.getUTCDate() + 3 + (exday) ) - 28
            }

        }else if( (DateNow.getUTCDate()+3+(exday)) > 30){
            if(  NextMonth === 1 || NextMonth === 3 || NextMonth === 5 || NextMonth === 7 || NextMonth === 8 || NextMonth === 10 || NextMonth === 12){
                CustDay = ( DateNow.getUTCDate() + 3 + (exday) ) - 30;
            }
        }else if(( DateNow.getUTCDate()+3+(exday) ) > 28){
            if(NextMonth === 2){ 
                CustDay = ( DateNow.getUTCDate() + 3 + (exday) ) - 28
            }else{
                CustDay = ( DateNow.getUTCDate() + 3 + (exday) );
            }
        }else{
            CustDay = ( DateNow.getUTCDate() + 3 + (exday) );
        }
    
        let dateString;
        if(NextMonth > 1 && NextMonth < 10){
            dateString = DateNow.getUTCFullYear()+"-0"+ NextMonth +"-"+ CustDay
        }else if(NextMonth > 9){
            dateString = DateNow.getUTCFullYear()+"-"+ NextMonth +"-"+ CustDay
        }else if(NextMonth === 1){
            dateString = NextYear +"-"+ NextMonth +"-"+ CustDay
        }
        expiryDateNow = new Date(dateString+" 21:00:00");
        return expiryDateNow;
    }

    function checkDate(){
        DateNow =  new Date(Date.now());
        expiryDate = customer.expiry_date;

        currentYear = DateNow.getUTCFullYear();
        currentMonth = DateNow.getUTCMonth()+1;
        currentDay = DateNow.getUTCDate();
        
        finishYear = expiryDate.getUTCFullYear();
        finishMonth = expiryDate.getUTCMonth()+1;
        finishDay = expiryDate.getUTCDate();
        if(currentYear >= finishYear && currentMonth >= finishMonth && currentDay >= finishDay){
            Customer.findOneAndUpdate(
                {_id: customer._id},
                {$set:{ 
                    subscrip_status: 'inactive',
                    extra_days: 0,
                    permitted_products:0,
                    subscrip_price:0
                 }},
                {new: true}).then(data =>{
                    if(data === null){ throw new Error('Customer Not Found'); }
                    res.json({ 
                        message: 'Customer updated successfully..!',
                    })
                })
                return false;
        }else{ return true; }
    }
    checkcustomer = checkDate();
    if(checkcustomer === false){
        res.json({ 
            message: 'You cannot add the product because the monthly subscription has expired'
        })
    }else if(customer.subscription_status === 'inactive'){
        res.json({ 
            message: 'You cannot add the product because the status of subscription has inactive'
        })
    }else if (products_count < 1){
        res.json({ 
            message: 'You cannot add the product because the number available to add has expired'
        })
    }else {

        const product = await new Product({
            name : req.body.name,
            image : images,
            price : req.body.price,
            description : req.body.description,
            category : req.body.category,
            createdAt:Date.now(),
            expiryAt:expiryDay(parseInt(req.body.extra_days)),
            customer : [customer._id,customer.shop_name,customer.shop_address,customer.phone1,customer.phone2,customer.pageurl,customer.extra_days,customer.image]
        }).save().then(data =>{
            if(products_count === 1){
                // add Product Then 
                // subscrip_status = 'inactive'
                Customer.findOneAndUpdate(
                    {_id: customer.id},
                    {$set:{ 
                        permitted_products: 0,
                        subscrip_status: 'inactive',
                        extra_days:(parseInt(customer.extra_days) - parseInt(req.body.extra_days))
                    }},
                    {new: true}).then(data =>{
                        if(data === null){ throw new Error('Customer Not Found'); }
                        res.status(200).redirect('/myproduct')
                    })
            }else{
                // add Product Then 
                // permitted_products = Count-1
                Customer.findOneAndUpdate(
                    {_id: customer.id},
                    {$set:{ 
                        permitted_products: (customer.permitted_products -1),
                        extra_days:(parseInt(customer.extra_days) - parseInt(req.body.extra_days))
                    }},
                    {new: true}).then(data =>{
                        if(data === null){ throw new Error('Customer Not Found'); }
                        res.status(200).redirect('/myproduct')
                    })
            }
        })
    }
}
//Get Extra Days and Categorys for Product
exports.getExtraDays = async (customer_id) =>{ 
    const customer = await Customer.findById(customer_id);
    const status = customer.subscrip_status;
    const extraDays = customer.extra_days;
    const categorys = await Category.find();
    return {extraDays,categorys,status};
}
//Find Product and Extra Days
exports.findProduct = async (productID) =>{
    const product = await Product.findById(productID);
    const customer = await Customer.findById(product.customer[0]);
    const extraDays = customer.extra_days;
    const categorys = await Category.find();
    return { product, extraDays,categorys}
}
//Update All Product properties with deleting old photos from a upload file 
exports.updateProduct = async (req, res)=>{

    if(!req.body){
        return res.status(400).send({ message : "Data to update can not be empty"})
    }
    const DIR = 'uploads';
    const id = req.body.id;
    let extraDays = 0;

    const customerID = req.session.userId;
    const customer = await Customer.findById(customerID);
    let extraDaysCustomer = customer.extra_days;
    let extraDaysProduct = req.body.extra_days;

    if(extraDaysProduct > 0){
        extraDays = extraDaysCustomer - extraDaysProduct;
    }

    const product = await Product.findById(id);
    createdDate = product.expiryAt;


    function expiryDayProduct(subscripDate){
        let NextYear = subscripDate.getUTCFullYear()+1;
        let createYear = subscripDate.getUTCFullYear();
        let createMonth = subscripDate.getUTCMonth()+1;
        let createDay = subscripDate.getUTCDate();
        let Days = parseInt(parseInt(createDay) + parseInt(extraDaysProduct));
        let exMonth = 0;
        let exDayProduct = 0;
        if(createMonth === 4 || createMonth === 6 || createMonth === 9 || createMonth === 11){
            if(Days < 30){
                exMonth = createMonth ;
                exDayProduct = Days;
            }else if(Days >= 30){
                exMonth = createMonth + 1;
                exDayProduct = parseInt(Days - 30);
            }

        }else if(createMonth === 1 || createMonth === 3 || createMonth === 5 || createMonth === 7 || createMonth === 8 || createMonth === 10 || createMonth === 12){
            if(Days < 31){
                exMonth = createMonth ;
                exDayProduct = Days;
            }else if(Days >= 31){
                exMonth = createMonth + 1;
                exDayProduct = parseInt(Days-31);
            }

        }else if(createMonth === 2){
            if(Days < 28){
                exMonth = createMonth ;
                exDayProduct = Days;
            }else if(Days >= 28){
                exMonth = createMonth + 1;
                exDayProduct = parseInt(Days-28);
            }
        }

        let dateString;
        if(exMonth > 0 && exMonth < 10){
            dateString = subscripDate.getUTCFullYear()+"-0"+ exMonth +"-"+ exDayProduct;
        }else if(exMonth > 9 && exMonth < 12){
            dateString = subscripDate.getUTCFullYear()+"-"+ exMonth +"-"+ exDayProduct
        }else if(exMonth > 12){
            dateString = NextYear +"-"+ exMonth +"-"+ exDayProduct
        }
        expirySubscripDate = new Date(dateString+" 21:00:00");
        return expirySubscripDate;
    }
    
    const productUpdate = req.body;

    //Delete Image From uploads File
    // if (!req.files.length) {
    //     console.log("No File Uploaded")
    // }else{
    //     console.log("File Uploaded")
    //     const product = await Product.findById(id);
    //     if(!product){
    //         console.log("No Product Found")
    //     }else if(!product.image[0]){
    //         console.log("No Image Found")
    //     }else{
    //         const images = product.image;
    //         for (const single_file of images) {
    //             fs.unlinkSync(DIR+'/'+single_file);
    //         }
    //     }
    // }

    var images =[];
    var i=0;
    if (req.files.length != 0) {
        for (const single_file of req.files) {
            for (let index = 0; index < req.files.length ; index++) {;
                images[i] = single_file.filename;
            }
            i++;
        }
        productUpdate['image']= images;
    }else{
        for (const single_file of product.image) {
            for (let index = 0; index < product.image.length ; index++) {;
                images[i] = single_file[i];
            }
            i++;
        }
        productUpdate['image']= product.image ;
    }
    let expiryProduct = expiryDayProduct(createdDate);

    console.log(productUpdate)

    productUpdate['expiryAt'] = expiryProduct;
    
    Customer.findOneAndUpdate(
        {_id: customerID},
        {$set:{ extra_days: extraDays }}
    )
    Customer.findOneAndUpdate(
        {_id: customerID},
        {$set:{ extra_days: extraDays }},
        {new: true}).then(data =>{
            if(data === null){ throw new Error('Customer Not Found'); }
        })

    Product.findOneAndUpdate(
        {_id: id},
        {$set:{ 
            name:req.body.name,
            image:productUpdate['image'],
            description:req.body.description,
            category:req.body.category
         }},
        {new: true}).then(data =>{
            if(data === null){ 
                throw new Error('Customer Not Found'); 
            }else{
                res.status(200).redirect('/myproduct');
            }
        })


    // Product.findByIdAndUpdate(id, productUpdate , { useFindAndModify: false})
    //     .then(data => {
    //         if(!data){
    //             res.status(404).send({ message : `Cannot Update Product with ${id}. Maybe Product not found!`})
    //         }else{
    //             // res.status(200).send({message : "product was updated successfully!"});
               
    //         }
    //     })
    //     .catch(err =>{
    //         res.status(500).send({ message : "Error Update Product"})
    //     })
}
//Delete Product
exports.deleteProduct = (req, res)=>{
    const id = req.params.id;
    Product.findByIdAndDelete(id)
    .then(data => {
        if(!data){
            res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
        }else{
            // res.status(200).send({message : "product was deleted successfully!"});
            res.redirect('/myproduct');
        }
    })
    .catch(err =>{
        res.status(500).send({
            message: "Could not delete product with id=" + id
        });
    });
}

//Search Product
exports.searchProduct = async (searchWord) =>{
    const searchField = searchWord;
    const products = await Product.find(
        {$or:[
            {name:{$regex: searchField , $options: '$i'}},
            {description:{$regex: searchField , $options: '$i'}},
            {category:{$regex: searchField , $options: '$i'}},
            {'customer.1':{$regex: searchField , $options: '$i'}}
        ]}
    )
    return products;
}

// Product Detail
exports.getProductDetail = async (productID, customerID) => {
    if(!productID || !customerID){
        return res.status(400).send({ message : "Data to update can not be empty"})
    }

    const product = await Product.findById(productID)
    const customer = await Customer.findById(customerID);
    const productDown = await Product.find().limit(10);
    return { product, customer , productDown};
}

// Get Product
exports.getProduct = async (req , res) =>{
    const product = await Product.find();
    var pro = [];
    let i = 0;
    for (let index = 0; index < product.length; index++) {
        if(new Date(product[index].expiryAt) >= Date.now()){
            pro[i] = product[index];
            i++;
        }else{
            const id = product[index]._id;
            Product.findByIdAndDelete(id)
            .then(data => {
                if(!data){
                    res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
                }
            })
            .catch(err =>{
                res.status(500).send({
                    message: "Could not delete product with id=" + id
                });
            });
        }
    }
    return pro;
}

exports.getStoreProduct = async (customerID) => {
    const customer = await Customer.findById(customerID);
    const product = await Product.find({
        customer:{
            $all:[customer._id,customer.shop_name,customer.shop_address,customer.phone1,customer.phone2,customer.pageurl,customer.image]
        },
    });
    return { product, customer };
}

exports.getProductByCategory = async (category) =>{
    const categoryName = await Category.findById(category);

    const product = await Product.find({category: categoryName.name});
    return product;
}