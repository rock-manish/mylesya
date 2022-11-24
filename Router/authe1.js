// const jwt = require("jsonwebtoken");
// const seqIdGenerator = require('seq-id-generator')
// const referralCodeGenerator = require("referral-code-generator");
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const cookieParser = require("cookie-parser");
// const sequential = require("sequential-ids");
// const router = express.Router();
// // router.use(cookieParser());
// require("../db/conn");
// const User = require("../model/userSchema");
// const Count=require("../model/Count");
// const authenticate = require("../middleware/Authenticate");

// //Using Async await Register page**************************
// router.post("/register", async (req, res,next ) => {
//   //object destructureing*******
//   const {ReferralCode,password, name, email, phone, cpassword,city,state,upiId,value1 } = req.body;
//   if (!name || !email ||  !password ) {
//     return res.status(422).json({ error: "plz filled the field properly" });
//   }
//   try {
//    let IdValue=36;
//     let user;
//     const userExist = await User.findOne({ email: email });
//     if (userExist) {
//       return res.status(422).json({ error: "Email already Exist" });
//     } else if (password != cpassword) {
//       return res.status(423).json({ error: "Password not match" });
//     } else if (ReferralCode) {
//       //find userReferral by database*************
//       const userReferral = await User.findOne({ ReferralCode: ReferralCode });

//       console.log(userReferral);
//       if (userReferral) {

//         let walleted;
//         walleted = 15;

//         let ref = await referralCodeGenerator.alpha("lowercase", 12);
//         console.log(ref);
       
// //count of value incriment*****
// // var user3 = await User.updateOne(
// //   { _id: userReferral._id },
// //   { $set:[ { users:userReferral.users.concat("hello") }] }
 
// // )
// // console.log(user3,"hhhhhhhhhh");
// // let user4=await User.updateOne({ _id: userReferral._id} ,{ $set: {"$push": { "users": employee._id }} })
// // .exec(function (err, managerparent) {});
// //  User.pre("save", async function (next) {
//   //Referral user check the users***************
// let user10=await User.findByIdAndUpdate(
//   { _id: userReferral._id},
//   { $push: { users:req.body.name} },
  
// );


 


// //Count collection of increment************
// let counter=await Count.findOne();
//     // console.log(counter.Counts);
// let user5 = await Count.updateOne(
//   { _id: counter._id },
//   { $set: { Counts:counter.Counts+1 } }
 
// );

// let findUsers= await User.find();
// // console.log(findUsers);
// findUsers.map(async (val)=>{
//   let user2 = await User.updateOne(
//       { _id: val._id },
//       { $set: {count:val.count+1 } }
//     );

// })
// let Autopool= await User.find();
// Autopool.map(async(val)=>{
// if(val.count==2){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 1",totalEarnig:2} } }
//   );
 

// }
// else if(val.count==4){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 2",totalEarnig:4} } }
//   );
 
// }
// else if(val.count==6){
 
//     let user2 = await User.updateOne(
//       { _id: val._id },
//       { $set: {AutoPoolBasic:{level:"level 3",totalEarnig:8} } }
//     );
  
// }
// else if(val.count==8){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 4",totalEarnig:16} } }
//   );
  
// }
// else if(val.count==10){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 5",totalEarnig:32} } }
//   );
 
// }
// else if(val.count==12){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 6",totalEarnig:64} } }
//   );
  
// }
// else if(val.count==14){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 7",totalEarnig:128} } }
//   );
 
// }
// else if(val.count==16){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 8",totalEarnig:256} } }
//   );
 
// }
// else if(val.count==18){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 9",totalEarnig:512} } }
//   );
 
// }
// else if(val.count==20){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 10",totalEarnig:1024} } }
//   );
 
// }
// else if(val.count==22){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 11",totalEarnig:4096} } }
//   );
  
// }
// else if(val.count==24){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 12",totalEarnig:16384} } }
//   );
 
// }
// else if(val.count==26){
//   let user2 = await User.updateOne(
//     { _id: val._id },
//     { $set: {AutoPoolBasic:{level:"level 13",totalEarnig:262144} } }
//   );
  
// }
// })

// //Bronze conditions*****************
// // let Autopool1= await User.find();
// // Autopool1.map(async(val)=>{
// //   if(IdValue==36){
// //     if(val.count==2){
// //     let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 1",totalEarnig:4} } }
// //   );
 

// // }
// // else if(val.count==4){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 2",totalEarnig:8} } }
// //   );
 
// // }
// // else if(val.count==6){
 
// //     let user2 = await User.updateOne(
// //       { _id: val._id },
// //       { $set: {AutoPoolBasic:{level:"level 3",totalEarnig:16} } }
// //     );
  
// // }
// // else if(val.count==8){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 4",totalEarnig:32} } }
// //   );
  
// // }
// // else if(val.count==10){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 5",totalEarnig:64} } }
// //   );
 
// // }
// // else if(val.count==12){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 6",totalEarnig:128} } }
// //   );
  
// // }
// // else if(val.count==14){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 7",totalEarnig:256} } }
// //   );
 
// // }
// // else if(val.count==16){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 8",totalEarnig:512} } }
// //   );
 
// // }
// // else if(val.count==18){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 9",totalEarnig:1024} } }
// //   );
 
// // }
// // else if(val.count==20){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 10",totalEarnig:5096} } }
// //   );
 
// // }
// // else if(val.count==22){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 11",totalEarnig:20384} } }
// //   );
  
// // }
// // else if(val.count==24){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 12",totalEarnig:81536} } }
// //   );
 
// // }
// // else if(val.count==26){
// //   let user2 = await User.updateOne(
// //     { _id: val._id },
// //     { $set: {AutoPoolBasic:{level:"level 13",totalEarnig:326144} } }
// //   );
  
// // }else{
// //   console.log("not users count")
//  }}else{
//   console.log("plz upgrade your value");
//  }
// })

//         let firstRef = await userReferral.ReferralCase;
     
//         // // console.log(firstRef);
//         if (firstRef =="first") {
          
//           let user2 = await User.updateOne(
//             { _id: userReferral._id },
//             { $set: { ReferralCase: "second" } }
//           );
//           let per = walleted * (20 / 100);
//             let data = (await userReferral.wallets.wallet) + per;
//             console.log(data);
//             let user1 = await User.updateOne(
//               { _id: userReferral._id },
//               { $set: { wallets: { wallet: data } } }
//             );
        
//       }
        
//         else if (firstRef == "second") {
         
//           let user2 = await User.updateOne(
//             { _id: userReferral._id },
//             { $set: { ReferralCase: "third" } }
//           );
//           let per = walleted * (30 / 100);
//             let data = (await userReferral.wallets.wallet) + per;
//             console.log(data);
//             let user1 = await User.updateOne(
//               { _id: userReferral._id },
//               { $set: { wallets: { wallet: data } } }
//             );
//           }
//           else if (firstRef == "third") {
            
//             let user2 = await User.updateOne(
//               { _id: userReferral._id },
//               { $set: { ReferralCase: "fourth" } }
//             );
//             let per = walleted * (40 / 100);
//               let data = (await userReferral.wallets.wallet) + per;
//               console.log(data);
//               let user1 = await User.updateOne(
//                 { _id: userReferral._id },
//                 { $set: { wallets: { wallet: data } } }
//               );
//             }
//             else if (firstRef == "fourth") {
         
//               // let user2 = await User.updateOne(
//               //   { _id: userReferral._id },
//               //   { $set: { ReferralCase: "Expire" } }
//               // );
//               let per = walleted * (50 / 100);
//                 let data = (await userReferral.wallets.wallet) + per;
//                 console.log(data);
//                 let user1 = await User.updateOne(
//                   { _id: userReferral._id },
//                   { $set: { wallets: { wallet: data } } }
//                 );
//               }
            
            
//          else {
//           console.log("Expire Your referral");
//         }
//         // if(counter.Counts==4){
//           // let user2 = await User.updateOne(
//           //   { _id: userReferral._id },
//           //   { $set: { ReferralCase: "fourth" } }
//           // );
//           let counter1=await Count.findById();
//         // }
//         user = new User({
//           name,
//           email,
//           phone,
//           ReferralCode: ref,
//           password,
//           cpassword,
//           city,
//           state,
//           upiId,
//           country:value1,
//           wallets: { wallet: walleted },
         
//         });
       
//       } else {
//         let ref = await referralCodeGenerator.alpha("lowercase", 12);
//         console.log(ref);
//         user = new User({
//           name,
//           email,
//           phone,
//           ReferralCode: ref,
//           password,
//           cpassword,
//           city,
//           state,
//           upiId,
//           country:value1,
//         });
//       }
//     } else {
//       let ref = await referralCodeGenerator.alpha("lowercase", 12);
//       console.log(ref);
//       user = new User({
//         name,
//         email,
//         phone,
//         ReferralCode: ref,
//         password,
//         cpassword,
//         city,
//         state,
//         upiId,
//         country:value1,
        
//       });
//     }

//     // else{
//     //   var user = new User({ name, email, phone,ReferralCode, ReferralCode, password, cpassword });
//     // }

//     const userRegister = await user.save();
//     if (userRegister) {
//       res.status(201).json({ message: "user registered successfully " });
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });
// //Login Page***********
// router.post("/login", async (req, res) => {
//   try {
//     // let token;
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Invalid Detail" });
//     }
//     //findone check krega ki database me email ye wala h ki nhi********
//     const userLogin = await User.findOne({ email });

//     if (userLogin) {
//       const isMatch = await bcrypt.compare(password, userLogin.password);
//       if (!isMatch) {
       
//         res.status(400).json({ error: "Invalid Detail" });
//       } else {
//         //JWT Token Use**********
//         const token = await userLogin.generateAuthToken();
//         console.log(token);
//         res.cookie("jwtoken", token, {
//           expires: new Date(Date.now() + 2589200000),
//           httpOnly: true,
//         });
       
//         res.status(200).json({ message: "login Successfull" });
//       }
//     } else {
//       console.log("invalid detail");
//       res.status(400).json({ error: "Invalid Detail" });
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });
// router.post('/changepass',async(req,res)=>{
//   const {email,password,newpassword,cpassword}=req.body;
 
//   const userLogin = await User.findOne({ email });

//   if (userLogin) {
//       const isMatch = await bcrypt.compare(password,userLogin.password);
//     console.log(isMatch);
//       if (!isMatch) {
//       res.status(422).json({error:"password not exist"});
//       }else if(newpassword!=cpassword){
//         res.status(423).json({error:"password not match"});
//       }
//       else{
//         let changePass = await User.updateOne(
//           { _id: userLogin._id },
//           { $set: { password:await bcrypt.hash(newpassword, 6),cpassword:await bcrypt.hash(cpassword, 6) } }
//         );
       
//         console.log(changePass);
//         res.status(200).json({message:"successful change Password"})
//       }}else{
//         res.status(400).json({error:"erroror"})
//       }
      
//   });


// router.get("/getAllData",authenticate,(req,res)=>{

  
//   res.send(req.rootUser);

//   });
//   router.get("/LogOut",(req,res)=>{
   
//     res.clearCookie('jwtoken',{path:'/'})
//     res.status(200).json({message:"User LogOut"});
//     })

// module.exports = router;
