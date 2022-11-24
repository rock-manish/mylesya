const jwt=require("jsonwebtoken");
const User=require("../model/userSchema");
const Authenticate=async(req,res,next)=>{
try{
    //get the token***
const token=req.cookies.jwtoken;
const verifyToken=jwt.verify(token,process.env.SECRET_KEY);
const rootUser=await User.findOne({_id:verifyToken._id ,"tokens.token":token});
if(!rootUser){
    throw new Error('User not defind');
}
req.token=token;
//rootUser me sara data milega**
req.rootUser=rootUser;
req.userId=rootUser._id;

next();
}catch(err){
    res.status(401).send('UnAuthorazied token');
    console.log(err);
}
}
module.exports=Authenticate;