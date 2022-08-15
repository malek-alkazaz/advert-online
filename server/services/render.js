const axios = require('axios');
const product = require('../controller/product_controller');
const customer = require('../controller/customer_controller')
const price = require('../controller/price_controller')
const employee = require('../controller/employee_controller');
const category = require('../controller/category_controller');

exports.homeRoutes = (req, res) => {
    product.getProduct().then(home =>{
        res.render('home',{
            products:home,
            user:req.session.userId,
            type:req.session.userType
        });
    });
}

exports.apiHome = (req, res) => {
    product.getProduct().then(product =>{
        res.send(product);
    })
}


exports.apiCategory = (req, res) => {
    category.getCategory().then(category =>{
        res.send(category);
    })
}




exports.login = (req, res) => {
    res.render('login');
}

exports.adminLogin = (req, res) => {
    res.render('adminLogin');
}

exports.add_product = (req, res) => {
    id = req.session.userId;
   
    product.getExtraDays(id).then(pp =>{
        //res.send(pp)
        res.render('add_product',{
            user:req.session.userId,
            type:req.session.userType,
            extraDays:pp.extraDays,
            categorys:pp.categorys,
            status:pp.status
        });
    });
}

exports.edit_product =  (req, res) => {
    product.findProduct(req.query.pro_id).then(product =>{
        //res.send(product)
        res.render('edit_product',{
            user:req.session.userId,
            type:req.session.userType,
            product: product
        });
    })
}

exports.searchProduct =  (req, res) => {
    product.searchProduct(req.body.search).then(product =>{
        // res.send(product)
        res.render('search_product',{
            user:req.session.userId,
            type:req.session.userType,
            products: product
        });
    })
}


exports.customer_product = (req, res) => {
    const customer_id = req.session.userId;
    product.getStoreProduct(customer_id).then(pp =>{
        //res.send(pp)
        res.render('customer_product',{
            storeProduct:pp,
            user:req.session.userId,
            type:req.session.userType
        });
    });
}

exports.add_customer = (req, res) => {
    res.render('add_customer',{
        user:req.session.userId,
        type:req.session.userType
    });
}

exports.customers = (req , res) => {
    customer.findCustomers().then(customers =>{
        res.render('customers1',{
            user:req.session.userId,
            type:req.session.userType,
            customer:customers
        });
    });
}

exports.customerDetails = (req , res) => {
    customer.customeDetails(req.query.cust_id).then(customers =>{
        //res.send(customers)
        res.render('edit_customer',{
            user:req.session.userId,
            type:req.session.userType,
            customer:customers
        });
    });
}

exports.updateCustomerProfile = (req , res) =>{
    customer.customeDetails(req.query.cust_id).then(customers =>{
        res.render('customer_profile',{
            user:req.session.userId,
            type:req.session.userType,
            customer:customers
        });
    });
}

exports.add_employee = (req, res) => {
    res.render('add_employee',{
        user:req.session.userId,
        type:req.session.userType
    });
}

exports.updateEmployee = (req, res) => {
    const id = req.query.emp_id;
    employee.findEmployee(id).then(employee=>{
        res.render('update_employee',{
            user:req.session.userId,
            type:req.session.userType,
            employee:employee
        });
    })
}

exports.getEmployees = (req,res) => {
    employee.getEmployees().then(employee=>{
        res.render('employees',{
            user:req.session.userId,
            type:req.session.userType,
            employees:employee
        })
    })
}

exports.searchEmployees = (req,res) => {
    employee.searchEmployees(req.body.search).then(employee=>{
        res.render('employees',{
            user:req.session.userId,
            type:req.session.userType,
            employees:employee
        })
    })
}


exports.searchCustomer = (req,res) => {
    customer.searchCustomer(req.body.search).then(customers =>{
        res.render('customers1',{
            user:req.session.userId,
            type:req.session.userType,
            customer:customers
        })
    })
}

exports.getCategory = (req,res) => {
    category.getCategory().then(getCategorys =>{
        //res.send(getCategorys)
        res.render('category',{
            user:req.session.userId,
            type:req.session.userType,
            category:getCategorys
        })
    })
}

exports.about = (req, res) => {
    res.render('about',{
        user:req.session.userId,
        type:req.session.userType
    });
}

exports.details = (req, res) => {
    const product_id = req.query.pro_id;
    const customer_id = req.query.cust_id;
    product.getProductDetail(product_id , customer_id).then(pp =>{
        res.render('details',{
            product:pp.product,
            customer:pp.customer,
            productDown:pp.productDown,
            user:req.session.userId,
            type:req.session.userType
        });
        // res.json(pp.productDown[0].name)
    });
}

exports.store = (req, res) => {
    const customer_id = req.query.cust_id;
    product.getStoreProduct(customer_id).then(pp =>{
        res.render('store',{
            storeinfo:pp,
            user:req.session.userId,
            type:req.session.userType
        });
    });
}

exports.getPrice = (req, res) => {
    price.getPrice().then(pp =>{
        res.render('update_price',{
            price:pp,
            user:req.session.userId,
            type:req.session.userType
        });
    });
}

exports.gallery = (req, res) => {
    category.getCategory().then(gallerys =>{
        res.render('gallery',{
            user:req.session.userId,
            type:req.session.userType,
            gallery:gallerys
        });
    })
}

exports.galleryProduct = (req, res) => {
    //res.send(req.query.cat_id)
    product.getProductByCategory(req.query.cat_id).then(products =>{
        res.render('galleryProduct',{
            user:req.session.userId,
            type:req.session.userType,
            products:products
        })
    })
}