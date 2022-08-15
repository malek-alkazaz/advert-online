const jwt = require('jsonwebtoken');

module.exports = async (req , res , next) =>{
    try{

        const token = req.cookies['token'];
        const sign = "Admin";
        const decode = jwt.verify(token , sign)
        req.userData = decode;
        next();
    }catch(er){
        return res.json({message : "auth for admin is error"});
    }
}