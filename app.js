const dotenv=require("dotenv");
const express=require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app=express();
app.use(cors());

app.use(cookieParser());
const mongoose=require("mongoose");
// const middleware=require('middleware');
//for secure data use dotenv*******
dotenv.config({path:'./config.env'})

const port=process.env.port;
require('./db/conn');

//use middleware ka use yah kisi v json data ko object me change kr de*****
app.use(express.json());
//we link the Router file to make our route easy****
app.use(require('./Router/authe'))
app.use(require('./Router/mail'))
// app.use(require('./middleware/StatusCheck'))
//import Collection folder *********
// const User=require("./model/userSchema");
// app.use(cors())
// MiddleWare Use for user authentication*********
// const middleware=(req,res,next)=>{
//     console.log("hello middleware")
//     next();
// }


// app.get("/about",(req,res)=>{
//     res.send("hello bye")
//     })

app.listen(port,()=>{
    console.log(`server is running port no ${port}`);
})