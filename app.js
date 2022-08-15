const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser')
const multer = require('multer');
const connectDB = require('./server/database/connection');
const session = require('express-session')
const SessionDBStore = require('connect-mongodb-session')(session);
const app = express();

dotenv.config( { path : 'config.env'} )
const port = process.env.PORT || 8080

// log requests
// app.use(morgan('tiny'));


// load routers
app.use((req,res,next) =>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Method', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  next();
});

// mongodb connection
connectDB();
app.use(cookieParser())
const STORE = new SessionDBStore({
  uri:process.env.MONGO_URI,
  collection:'session'
})

app.use(session({
  secret: 'this is my secret to hash express',
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge: 7*24*60*60*100
  },
  store: STORE
}))

// parse request to body-parser
app.use(express.urlencoded( { extended: true ,limit: "50mb" ,parameterLimit: 50000} ));
//app.use(express.urlencoded( { extended: true} ));
app.use(express.json());
// app.use(cors());

// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))

// app.use('/uploads',express.static(path.resolve(__dirname,"uploads")))

// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/img', express.static(path.resolve(__dirname, "assets/img")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))
app.use('/uploads', express.static(path.resolve(__dirname, "uploads")))

//--------------------------
app.use('/',express.static(path.join(__dirname,'assets')));

 

app.use('/profile', express.static('uploads'));
// app.post('/uploads',(req, res, next) =>{

//     const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//           cb(null, __dirname+'/uploads/')
//         },
//         filename: function (req, file, cb) {
//           cb(null,  `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//         }
//     })    
//     const upload = multer({
//       storage: storage,
//       limits: {fileSize : 9 * 1024 * 1024},
//       fileFilter: (req, file, cb) =>{
//             if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
//               cb(null, true);
//             }else{
//                 cb(null, false);
//                 const err = new Error();
//                 err.name = "ExtensionError";
//                 err.message = 'Only .png, .jpg, jpeg format allowed';
//                 return cb(err);
//               }
//         }
//     }).single('images');//name of the inpute file
//     upload(req,res,(err)=>{
//         console.log(req.file);
//         // for handling err
//         if(err){
//             console.log(err);
//             res.json({err})
//             return;
//         }
//         console.log('file uploaded!');
//         res.status(200).json({"msg":"file uploaded..."}); 
//     })
// })
//--------------------------

app.use(require('./server/routes/router'))
app.listen(port, ()=> { console.log(`Server is running on http://localhost:${port}`)});
//app.listen(3000, ()=> { console.log(`Server is running on http://localhost:${port}`)});
