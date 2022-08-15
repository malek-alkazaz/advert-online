const jwt = require('jsonwebtoken');

module.exports = async (req , res , next) =>{
    try{
        const token = req.cookies['token'];
        const decode = jwt.verify(token ,"Employee")
        req.userData = decode;
        next();
    }catch(er){
        return res.json({message : "auth for employee is error"});
    }
}