const express = require('express');
const route = express.Router()
const multer = require("multer");
const path = require("path");

const services = require('../services/render');
const userauth = require('../controller/auth_controller');
const product = require('../controller/product_controller');
const customer = require('../controller/customer_controller');
const price = require('../controller/price_controller');
const employee = require('../controller/employee_controller');
const category = require('../controller/category_controller');


const adminCheck = require('../middleware/verify_admin');
const coustomerCheck = require('../middleware/verify_coustomer');
const employeeCheck = require('../middleware/verify_employee');

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize : 9 * 1024 * 1024},
    fileFilter: (req, file, cb) =>{
        if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
          cb(null, true);
        }else{
            cb(null, false);
            const err = new Error();
            err.name = "ExtensionError";
            err.message = 'Only .png, .jpg, jpeg format allowed';
            return cb(err);
        }
    }
})

/**
 *  @description Root Route
 *  @method GET /
 */
route.get('/',services.homeRoutes);
route.get('/home',services.homeRoutes);
route.get('/api/home',services.apiHome);
route.get('/api/category',services.apiCategory);
//Auth
route.get('/login',services.login);
route.post('/login',userauth.login);
//Admin Login
route.get('/admin_login',services.adminLogin);
route.post('/admin_login',userauth.login);
route.post('/add_admin',userauth.addAdmin);

route.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

//Employee
// route.get('/add_employee',adminCheck,services.add_employee);
// route.post('/add_employee',adminCheck,userauth.addEmployee);
// route.post('/update_employee',adminCheck,userauth.updateEmployee);
route.get('/add_employee',services.add_employee);
route.get('/update_employee',services.updateEmployee);
route.get('/employees',services.getEmployees);

route.post('/add_employee',employee.addEmployee);
route.post('/update_employee',employee.updateEmployee);
route.get('/delete_employee/:id',employee.deleteEmployee);
//Customer
// route.get('/add_customer',employeeCheck,services.add_customer);
// route.post('/add_customer',employeeCheck,userauth.addCustomer);
// route.post('/update_ustomer',employeeCheck,userauth.updateCustomer);

route.get('/add_customer',services.add_customer);

//route.post('/add_customer',upload.single('profile'),userauth.addCustomer);
route.post('/add_customer',upload.array('profile',1),customer.addCustomer);
route.get('/customers',services.customers);
route.get('/customerDetails',services.customerDetails);

route.post('/updatecustomer',upload.array('profile',1),customer.updateCustomer)
route.post('/customers/:id',customer.deleteCusromer);

route.get('/customers/:id',customer.deleteCusromer);


route.get('/updateprofile',services.updateCustomerProfile);
route.post('/updateprofile',upload.array('profile',1),customer.updateProfile);

//Product
//route.get('/add_product',coustomerCheck,services.add_product);
//route.post('/add_product',coustomerCheck,product.insertProduct);
route.get('/add_product',services.add_product);
route.post('/add_product',upload.array('profile',5),product.insertProduct);

route.get('/edit_product',services.edit_product);
route.post('/editProduct',upload.array('profile',5),product.updateProduct);

route.get('/myproduct',services.customer_product);
route.post('/myproduct/:id',product.deleteProduct);


route.get('/details',services.details);


route.get('/store',services.store);
route.get('/gallery',services.gallery);
route.get('/gallery-product',services.galleryProduct);
route.get('/about',services.about);



route.get('/price',services.getPrice);
route.post('/add_price',price.addPrice);
route.post('/update_price',price.updatePrice);
route.post('/delete_price',price.deletePrice);

route.post('/search',services.searchProduct);
route.post('/searchEmployee',services.searchEmployees);
route.post('/searchCustomer',services.searchCustomer);

route.get('/category',services.getCategory);
route.post('/add_category',upload.array('profile',1),category.addCategory);
route.post('/update_category',category.updateCategory);
route.post('/delete_category',category.deleteCategory);

module.exports = route
