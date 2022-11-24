const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const referralCodes = require("referral-codes");

const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const sequential = require("sequential-ids");
const router = express.Router();
// router.use(cookieParser());
require("../db/conn");
const User = require("../model/userSchema");
const Count = require("../model/Count");
const Payment = require("../model/Payment");
const authenticate = require("../middleware/Authenticate");
const {
  StatusCheck,
  BronzeStatus,
  SilverStatus,
} = require("../middleware/StatusCheck");
const {
  GoldStatus,
  GoldStarStatus,
  PlatinumStatus,
  PearlStatus,
  RubyStatus,
  EmeraldStatus,
  DimondStatus,
  AntimatterStatus,
  CrownStatus,
  CFStatus,
} = require("../middleware/StatusCheck");

const {
  findByIdAndUpdate,
  findById,
  updateOne,
} = require("../model/userSchema");

//Using Async await Register page**************************
router.post("/register", async (req, res, next) => {
  //object destructureing*******
  const {
    ReferralCode,
    password,
    name,
    email,
    phone,
    cpassword,
    city,
    state,
    upiId,
    country,
  } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({ error: "plz filled the field properly" });
  }
  try {
    let user;
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    } else if (password != cpassword) {
      return res.status(423).json({ error: "Password not match" });
    } else if (ReferralCode) {
      //find userReferral by database*************
      const userReferral = await User.findOne({ ReferralCode: ReferralCode });

      // console.log(userReferral);
      if (userReferral) {
        let ref = await referralCodes.generate({
          prefix: "PM",
          length: 6,
          count: 1,
          charset: "0123456789",
        });

        //Referral user store  the sponser users ***************

        const object = [userReferral._id, ...userReferral.users];

        //LevelIncome Generate process****************

        //Count collection of increment************
        // console.log(object[0]);

        let counter = await Count.findOne();
        // console.log(counter.Counts);
        let user5 = await Count.updateOne(
          { _id: counter._id },
          { $set: { Counts: counter.Counts + 1 } }
        );

        //Sequence By Level Income ke liye find level**********

        let findlevel1 = await userReferral.level;

        let userlevel = (await findlevel1) + 1;

        //ReferralCount*****************

        let user2 = await User.updateOne(
          { _id: userReferral._id },
          { $set: { RefCount: userReferral.RefCount + 1 } }
        );
        let finddata = await User.find();
        finddata.map(async (val) => {
          let data = await val.users[0];
          // console.log(data);
        });

        let counter1 = await Count.findById();
        // }
        user = new User({
          name,
          email,
          phone,
          ReferralCode: ref.toString(),
          password,
          cpassword,
          level: userlevel,

          users: object,
          city,
          state,
          upiId,
          country,
        });
      } else {
        res.status(422).json({ error: "user Referral not match " });
      }
    } else {
      let ref = await referralCodes.generate({
        prefix: "PM",
        length: 6,
        count: 1,
        charset: "0123456789",
      });
      user = new User({
        name,
        email,
        phone,
        ReferralCode: ref.toString(),
        password,
        cpassword,
        // level: userlevel,
        city,
        state,
        upiId,
        country,
        // wallet: walleted,
      });
    }

    const userRegister = await user.save();

    if (userRegister) {
      res.status(201).json({ message: "user registered successfully " });
    }
  } catch (err) {
    console.log(err);
  }
});
// Update Profile*************
router.put("/updateProfile/:id",authenticate, async (req, res) => {
  try {
    const data = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    // console.log(data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
  }
});

//All referralUser get UserId*************
router.get("/referraluser/:id", authenticate,async (req, res) => {
  const _id = req.params.id;
  const data = await User.find({ "users.0": mongoose.Types.ObjectId(_id) });
  // const data1=await User.find({"users[0]":mongoose.Types.ObjectId(_id)}).count();
  res.status(200).send(data);
});
//All levelReport********
router.get("/leveluser/:id", async (req, res) => {
  const _id = req.params.id;
  const data = await User.find({ users: mongoose.Types.ObjectId(_id) }).sort({
    "users.2": 1,
  });

  // console.log(data);
  res.status(200).send(data);
});

// Account Acctivation  methods************
router.put("/upgrade/:id",authenticate, async (req, res) => {
  try {
    const addmoney = req.body.addmoney;
    // console.log(addmoney);
    const userdata = await User.findById(req.params.id);
    const ReferralCode = req.body.ReferralCode;
const admin=await User.findOne().limit(1);
// console.log(admin);
    const userReferral = await User.findOne({ ReferralCode: ReferralCode });
    if (!userReferral ) {
      // console.log(ReferralCode);
      res.status(500).json("referralCode not match");
    } 
    else {
      if (userdata.wallet >= 21 ) {
        let txn_id_wallet = await referralCodes.generate({
          length: 10,
           count: 1,
           charset: "0123456789",
          });
        const userdata2 = await User.findByIdAndUpdate(
          { _id: req.params.id },
          // { wallet: userdata.wallet - addmoney },
          // { new: true }
          {$set: { wallet: userdata.wallet - addmoney },
          $push: {
            txn_info_wallet: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt:0 ,
                debit_amt:addmoney,
                sponerId:userReferral.ReferralCode,
                remain_bal:userdata.wallet-addmoney,
              },
            ],
          },
        }
        );
        // console.log(userdata2.wallet);
        const userdata3 = await User.findByIdAndUpdate(
          { _id: userReferral.id },
        
          {$set: { AccountStatus: (userReferral.AccountStatus = "active"),
            AutoPoolBasic: { status: "active" }, },
          $push: {
            txn_info_Activation: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                amount:addmoney ,
               
                sponerId:userReferral.ReferralCode,
                
              },
            ],
          },
        }
        );
        // console.log(userdata3.wallet);
        res.status(200).json("Successful Activation");
      } else {
        res.status(201).json("balance not found");
        console.log("balance not found");
      }
    }
  } catch (err) {
    console.log(err);
  }
});


//Transfer fund****************
router.put("/Transferfund/:id",authenticate, async (req, res) => {
  try {
    const addmoney = req.body.addmoney;
    // console.log(addmoney);
    const userdata = await User.findById(req.params.id);
    const ReferralCode = req.body.ReferralCode;
    const userReferral = await User.findOne({ ReferralCode: ReferralCode });
    if (!userReferral ) {
      // console.log(ReferralCode);
      res.status(500).json("referralCode not match");
    } 
    else {
      if (userdata.wallet >= 21 ) {
        let txn_id_wallet = await referralCodes.generate({
          length: 10,
           count: 1,
           charset: "0123456789",
          });
        const userdata2 = await User.findByIdAndUpdate(
          { _id: req.params.id },
         
          {$set: { wallet: userdata.wallet - addmoney },
          $push: {
            txn_info_wallet: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 0,
                debit_amt:addmoney,
                sponerId:userReferral.ReferralCode,
                remain_bal:userdata.wallet-addmoney,
              },
            ],
          },
          // { new: true }
         } );
        // console.log(userdata2.wallet);
        const userdata3 = await User.findByIdAndUpdate(
          { _id: userReferral.id },
        
          {$set: { wallet: userReferral.wallet + addmoney },
          $push: {
            txn_info_wallet: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: addmoney,
                debit_amt:0,
                sponerId:userdata.ReferralCode,
                remain_bal:userdata.wallet+addmoney,
              },
            ],
          },
        }
        );
        // console.log(userdata3.wallet);
        res.status(200).json("Successful Transfer");
      } else {
        res.status(201).json("balance not found");
        console.log("balance not found");
      }
    }
  } catch (err) {
    console.log(err);
  }
});
router.get("/ReferralUpdate/:id", StatusCheck, async (req, res) => {
  
    try { 
      //Referral Income*****************
      let referral = await User.findById(req.params.id);
      
      if(referral.users[0]!=undefined ){
      
      let userReferral = await User.findOne({ _id: referral.users[0] });
     
      let firstRef = userReferral.ReferralCase;
  console.log(firstRef);
      let walleted = 15;
  
      if (firstRef == "Null" && userReferral.AccountStatus=="active") {
        let per = walleted * (20 / 100);
        let data = (await userReferral.wallet) + per;
  
  
        let bal_ref = (await userReferral.referral_income) + per;
  
        let txn_id_referral = await referralCodes.generate({
          length: 10,
           count: 1,
           charset: "0123456789",
          });
  
  
        
  
        let user2 = await User.updateOne(
          { _id: userReferral._id },
          {
            $set: { wallet: data, ReferralCase: "first", referral_income:bal_ref },
            $push: {
              txn_info_referral: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: per,
                  debit_amt: 0,
                  remain_bal: bal_ref,
                },
              ],
            },
          }
        );
  
       
      } else if (firstRef == "first" && userReferral.AccountStatus == "active") {
        let per = walleted * (30 / 100);
        let data = (await userReferral.wallet) + per;
  
        let bal_ref = (await userReferral.referral_income) + per;
  
        let txn_id_referral = await referralCodes.generate({
          length: 10,
          count: 1,
          charset: "0123456789",
        });
  
        let user2 = await User.updateOne(
          { _id: userReferral._id },
          {
            $set: {
              wallet: data,
              ReferralCase: "second",
              referral_income: bal_ref,
            },
            $push: {
              txn_info_referral: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: per,
                  debit_amt: 0,
                  remain_bal: bal_ref,
                },
              ],
            },
          }
        );
      } else if (firstRef == "second" && userReferral.AccountStatus == "active") {
        let per = walleted * (40 / 100);
        let data = (await userReferral.wallet) + per;
  
        let bal_ref = (await userReferral.referral_income) + per;
  
        let txn_id_referral = await referralCodes.generate({
          length: 10,
          count: 1,
          charset: "0123456789",
        });
  
        let user2 = await User.updateOne(
          { _id: userReferral._id },
          {
            $set: {
              wallet: data,
              ReferralCase: "third",
              referral_income: bal_ref,
            },
            $push: {
              txn_info_referral: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: per,
                  debit_amt: 0,
                  remain_bal: bal_ref,
                },
              ],
            },
          }
        );
      } else if (firstRef == "third" && userReferral.AccountStatus == "active") {
        let per = walleted * (50 / 100);
        let data = (await userReferral.wallet) + per;
        let bal_ref = (await userReferral.referral_income) + per;
  
        let txn_id_referral = await referralCodes.generate({
          length: 10,
          count: 1,
          charset: "0123456789",
        });
  
        let user2 = await User.updateOne(
          { _id: userReferral._id },
          {
            $set: {
              wallet: data,
              ReferralCase: "third",
              referral_income: bal_ref,
            },
            $push: {
              txn_info_referral: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: per,
                  debit_amt: 0,
                  remain_bal: bal_ref,
                },
              ],
            },
          }
        );
      } else {
        console.log("Expire Your referral");
      }
    }else{
      console.log("this is zero index");
    }
    //Referral Income*****************
    // let referral = await User.findById(req.params.id);

    // let userReferral = await User.findOne({ _id: referral.users[0] });
    // let firstRef = userReferral.ReferralCase;

    // let walleted = 15;

    // if (firstRef == "Null") {
    //   let user2 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { ReferralCase: "first" } }
    //   );
    //   let per = walleted * (20 / 100);
    //   let data = (await userReferral.wallet) + per;

    //   let user1 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { wallet: data } }
    //   );
    // } else if (firstRef == "first") {
    //   let user2 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { ReferralCase: "second" } }
    //   );
    //   let per = walleted * (30 / 100);
    //   let data = (await userReferral.wallet) + per;

    //   let user1 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { wallet: data } }
    //   );
    // } else if (firstRef == "second") {
    //   let user2 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { ReferralCase: "third" } }
    //   );
    //   let per = walleted * (40 / 100);
    //   let data = (await userReferral.wallet) + per;

    //   let user1 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { wallet: data } }
    //   );
    // } else if (firstRef == "third") {
    //   let per = walleted * (50 / 100);
    //   let data = (await userReferral.wallet) + per;

    //   let user1 = await User.updateOne(
    //     { _id: userReferral._id },
    //     { $set: { wallet: data } }
    //   );
    // } else {
    //   console.log("Expire Your referral");
    // }

    // //Level Income**************************
    // const data = await User.find({}).sort({ _id: -1 });
    // let obj = data[0].users;
    // for (var i = 1; i < obj.length; i++) {
    //   let income1 = await User.findById(obj[i]);

    //   if (i < 4) {
    //     let user5 = await User.updateOne(
    //       { _id: obj[i]._id },
    //       { $set: { levelIncome: income1.levelIncome + 0.5 } }
    //     );
    //   }
    //   if (i >= 4 && i <= 8) {
    //     let user5 = await User.updateOne(
    //       { _id: obj[i]._id },
    //       { $set: { levelIncome: income1.levelIncome + 0.3 } }
    //     );
    //   }
    //   if (i >= 9 && i <= 13) {
    //     let user5 = await User.updateOne(
    //       { _id: obj[i]._id },
    //       { $set: { levelIncome: income1.levelIncome + 0.1 } }
    //     );
    //   }
    //   if (i >= 10 && i <= 14) {
    //     let user5 = await User.updateOne(
    //       { _id: obj[i]._id },
    //       { $set: { levelIncome: income1.levelIncome + 0.2 } }
    //     );
    //   }
    // }

    // //BasicSmartPool************************

    // const findUsers1 = await User.find();
    // // console.log(findUsers1);
    // findUsers1.map(async (val) => {
    //   if (val.AccountStatus == "active") {
    //     const user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { count: val.count + 1 } }
    //     );
    //   }
    // });

    // //If user only upgrade Basic*****************
    // let _id = req.params.id;

    // let findId = await User.findOne({ _id });
    // let BasicIncome = await findId.AutoPoolBasic.BasicIncome;

    // // if(BasicIncome=="Start"){
    // const Autopool = await User.find();

    // Autopool.map(async (val) => {
    //   if (val.count == 2) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { AutoPoolBasic: { level: "level 1", totalEarnig: 2 } } }
    //     );
    //   } else if (val.count == 4) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { AutoPoolBasic: { level: "level 2", totalEarnig: 4 } } }
    //     );
    //   } else if (val.count == 6) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { AutoPoolBasic: { level: "level 3", totalEarnig: 8 } } }
    //     );
    //   } else if (val.count == 8) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { AutoPoolBasic: { level: "level 4", totalEarnig: 16 } } }
    //     );
    //   } else if (val.count == 10) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { AutoPoolBasic: { level: "level 5", totalEarnig: 32 } } }
    //     );
    //   } else if (val.count == 12) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       { $set: { AutoPoolBasic: { level: "level 6", totalEarnig: 64 } } }
    //     );
    //   } else if (val.count == 14) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: { AutoPoolBasic: { level: "level 7", totalEarnig: 128 } },
    //       }
    //     );
    //   } else if (val.count == 16) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: { AutoPoolBasic: { level: "level 8", totalEarnig: 256 } },
    //       }
    //     );
    //   } else if (val.count == 18) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: { AutoPoolBasic: { level: "level 9", totalEarnig: 512 } },
    //       }
    //     );
    //   } else if (val.count == 20) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: {
    //           AutoPoolBasic: { level: "level 10", totalEarnig: 1024 },
    //         },
    //       }
    //     );
    //   } else if (val.count == 22) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: {
    //           AutoPoolBasic: { level: "level 11", totalEarnig: 4096 },
    //         },
    //       }
    //     );
    //   } else if (val.count == 24) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: {
    //           AutoPoolBasic: { level: "level 12", totalEarnig: 16384 },
    //         },
    //       }
    //     );
    //   } else if (val.count == 26) {
    //     let user2 = await User.updateOne(
    //       { _id: val._id },
    //       {
    //         $set: {
    //           AutoPoolBasic: { level: "level 13", totalEarnig: 262144 },
    //         },
    //       }
    //     );
    //   }
    // });
    //   // }
  } catch (err) {
    console.log(err);
  }
});
router.get("/levelUpdate/:id",authenticate,StatusCheck, async (req, res) => {
  try{

    //Level Income**************************
    const data = await User.find({}).sort({ _id: -1 });
    let obj = data[0].users;
    for (var i = 1; i < obj.length; i++) {


      let income1 = await User.findById(obj[i]);
      // console.log()
      let txn_id_referral = await referralCodes.generate({
        length: 10,
        count: 1,
        charset: "0123456789",
      });

      if (i < 4 && income1.AccountStatus=="active") {
        let user5 = await User.updateOne(
          { _id: obj[i]._id },
          {
            $set: { levelIncome: income1.levelIncome + 0.5 },
            $push: {
              txn_info_levelIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: 0.5,
                  debit_amt: 0,
                  remain_bal: income1.levelIncome + 0.5,
                  fromId: data[0].ReferralCode,
                },
              ],
            },
          }
        );
      }
      if (i >= 4 && i <= 8 && income1.AccountStatus == "active") {
        let user5 = await User.updateOne(
          { _id: obj[i]._id },
          {
            $set: { levelIncome: income1.levelIncome + 0.3 },
            $push: {
              txn_info_levelIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: 0.3,
                  debit_amt: 0,
                  remain_bal: income1.levelIncome + 0.5,
                  fromId: data[0].ReferralCode,
                },
              ],
            },
          }
        );
      }
      if (i >= 9 && i <= 13 && income1.AccountStatus == "active") {
        let user5 = await User.updateOne(
          { _id: obj[i]._id },
          {
            $set: { levelIncome: income1.levelIncome + 0.1 },
            $push: {
              txn_info_levelIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: 0.5,
                  debit_amt: 0,
                  remain_bal: income1.levelIncome + 0.1,
                  fromId: data[0].ReferralCode,
                },
              ],
            },
          }
        );
      }
      if (i >= 10 && i <= 14 && income1.AccountStatus == "active") {
        let user5 = await User.updateOne(
          { _id: obj[i]._id },
          {
            $set: { levelIncome: income1.levelIncome + 0.2 },
            $push: {
              txn_info_levelIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: 0.5,
                  debit_amt: 0,
                  remain_bal: income1.levelIncome + 0.2,
                  fromId: data[0].ReferralCode,
                },
              ],
            },
          }
        );
      }
    }

  }catch(e){
    console.log(e);
  }
})
//SmartBasicPool***********
router.get("/BasicSmartPool/:id",StatusCheck, async (req, res) => {
  try{
 const findUsers1 = await User.find();
    // console.log(findUsers1);
    findUsers1.map(async (val) => {
      if (val.AccountStatus == "active") {
        const user2 = await User.updateOne(
          { _id: val._id },
          { $set: { count: val.count + 1 } }
        );
      }
    });

    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });

    //If user only upgrade Basic*****************
    let _id = req.params.id;

    let findId = await User.findById({ _id });
    let BasicIncome = await findId.AutoPoolBasic.BasicIncome;

    // if(BasicIncome=="Start"){
    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.count == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBasic: { level: "level 1",totalEarnig: 2,status:"active" }},
          $push: {
            txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:2 ,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },
          }
        );
        console.log("hiii");
      } else if (val.count == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBasic: { level: "level 2", totalEarnig: 4,status:"active"  }},
          $push: {
            txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:2 ,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.count == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBasic: { level: "level 3", totalEarnig: 8,status:"active"  } },
          $push: {
            txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:8 ,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },
         }
        );
      } else if (val.count == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBasic: { level: "level 4", totalEarnig: 16 ,status:"active"  } },
          $push: {
            txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:16 ,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.count == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBasic: { level: "level 5", totalEarnig: 32,status:"active"  } },
          $push: {
            txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:32 ,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.count == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBasic: { level: "level 6", totalEarnig: 64,status:"active" } },
          $push: {
            txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:64,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },
         }
        );
      } else if (val.count == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolBasic: { level: "level 7", totalEarnig: 128,status:"active"  } } ,
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:128,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },},
          
        );
      } else if (val.count == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolBasic: { level: "level 8", totalEarnig: 256,status:"active"   } },
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:256,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.count == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolBasic: { level: "level 9", totalEarnig: 512,status:"active"   } },
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:512,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.count == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBasic: { level: "level 10", totalEarnig: 1024,status:"active"   },
            },
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1024,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.count == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBasic: { level: "level 11", totalEarnig: 4096,status:"active"   },
            },
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:4096,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.count == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBasic: { level: "level 12", totalEarnig: 16384,status:"active"  },
            },
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:16384,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.count == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBasic: { level: "level 13", totalEarnig: 262144,status:"active"  },
            },
            $push: {
              txn_info_BaIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:262144,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      }
    });
      // }
  } catch (err) {
    console.log(err);
  }
});
//Bronze API*******************
router.get("/BronzeStatus/:id", BronzeStatus, async (req, res) => {
  try {
  const admin=await User.find().sort({_id:-1})
  // console.log(admin,",jhihoiijoij")
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[0]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[0] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[0] },
        { $set: { UpgradeIncome: data + 15 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 15,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 15,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//**************************************
 //Count Bronze*******
 const findUsers1 = await User.find();
 // console.log(findUsers1);
 findUsers1.map(async (val) => {
   if (val.AutoPoolBronze.status == "active") {
     const user2 = await User.updateOne(
       { _id: val._id },
       { $set: { countBr: val.countBr + 1 } }
     );
   }
 });
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //  BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countBr == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBronze: { level: "level 1", totalEarnig: 4,status:"active" } },
          $push: {
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:4,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },
         }
        );
      } else if (val.countBr == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBronze: { level: "level 2", totalEarnig: 8,status:"active" } },
          $push: {
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:8,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countBr == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBronze: { level: "level 3", totalEarnig: 16,status:"active" } } ,
          $push: {
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:16,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },}
        );
      } else if (val.countBr == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBronze: { level: "level 4", totalEarnig: 32,status:"active" } },
          $push: {
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:32,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countBr == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBronze: { level: "level 5", totalEarnig: 64,status:"active" } },
          $push: {
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:64,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countBr == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolBronze: { level: "level 6", totalEarnig: 128 ,status:"active"} },
          $push: {
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:128,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countBr == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolBronze: { level: "level 7", totalEarnig: 256,status:"active" } },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:256,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.countBr == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolBronze: { level: "level 8", totalEarnig: 512,status:"active" } },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:512,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.countBr == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolBronze: { level: "level 9", totalEarnig: 1024 ,status:"active"} },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1024,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.countBr == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBronze: { level: "level 10", totalEarnig: 5096,status:"active" },
            },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:5096,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.countBr == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBronze: { level: "level 11", totalEarnig: 20384,status:"active" },
            },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:20384,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.countBr == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBronze: { level: "level 12", totalEarnig: 81536,status:"active" },
            },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:81536,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.countBr == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolBronze: { level: "level 13", totalEarnig: 326144,status:"active" },
            },
            $push: {
              txn_info_BrIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:326144,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Silver SmartPool*******************

router.get("/SilverStatus/:id", authenticate,SilverStatus, async (req, res) => {
  try {
    
  //Upgrade*****************
    const referral = await User.findById(req.params.id);
   
    if(referral.users[1]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[1] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[1] },
        { $set: { UpgradeIncome: data + 25 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 25,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 25,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//**************************************
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

//Count**********
const findUsers1 = await User.find();
// console.log(findUsers1);
findUsers1.map(async (val) => {

  if ( val.AutoPoolSilver.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { counts: val.counts + 1 } }
    );
  }
});
    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.counts == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolSilver: { level: "level 1", totalEarnig: 6,status:"active" } },
          $push: {
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:6,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },
         }
        );
      } else if (val.counts == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolSilver: { level: "level 2", totalEarnig: 12,status:"active" } } ,
          $push: {
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:12,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },}
        );
      } else if (val.counts == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolSilver: { level: "level 3", totalEarnig: 24 ,status:"active"} } ,
          $push: {
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:24,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },}
        );
      } else if (val.counts == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolSilver: { level: "level 4", totalEarnig: 48,status:"active" } },
          $push: {
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:48,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.counts == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolSilver: { level: "level 5", totalEarnig: 96 ,status:"active"} },
          $push: {
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:96,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.counts == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolSilver: { level: "level 6", totalEarnig: 192,status:"active" } } ,
          $push: {
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:192,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },}
        );
      } else if (val.counts == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolSilver: { level: "level 7", totalEarnig: 384 ,status:"active"} },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:384,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.counts == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolSilver: { level: "level 8", totalEarnig: 768,status:"active" } },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:768,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.counts == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolSilver: { level: "level 9", totalEarnig: 1536,status:"active" } },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1536,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.counts == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolSilver: { level: "level 10", totalEarnig: 6144,status:"active" },
            },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:6144,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.counts == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolSilver: { level: "level 11", totalEarnig: 24576 ,status:"active"},
            },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:24576,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.counts == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolSilver: { level: "level 12", totalEarnig: 98304,status:"active" },
            },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:98304,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      } else if (val.counts == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolSilver: { level: "level 13", totalEarnig: 393216,status:"active" },
            },
            $push: {
              txn_info_SiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:393216,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            },
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Gold Auto SmartPool*****************************
router.get("/GoldStatus/:id", GoldStatus, async (req, res) => {
  try {
//Upgrade Income*************
    const referral = await User.findById(req.params.id);

   
    if(referral.users[2]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[2] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[2] },
        { $set: { UpgradeIncome: data + 50 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 50,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 50,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();
// console.log(findUsers1);
findUsers1.map(async (val) => {
  if (val.AutoPoolGold.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countG: val.countG + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //GoldSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countG == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolGold: { level: "level 1", totalEarnig: 8,status:"active" } },
          $push: {
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:8,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, 
        }
        );
      } else if (val.countG == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolGold: { level: "level 2", totalEarnig: 16,status:"active" } } ,
          $push: {
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:16,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countG == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolGold: { level: "level 3", totalEarnig: 32,status:"active" } } ,
          $push: {
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:32,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countG == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolGold: { level: "level 4", totalEarnig: 64,status:"active" } },
          $push: {
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:64,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },  }
        );
      } else if (val.countG == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolGold: { level: "level 5", totalEarnig: 128,status:"active" } } ,
          $push: {
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:128,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }, }
        );
      } else if (val.countG == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolGold: { level: "level 6", totalEarnig: 256,status:"active" } },
          $push: {
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:256,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          },  }
        );
      } else if (val.countG == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolGold: { level: "level 7", totalEarnig: 512,status:"active" } },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:512,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      } else if (val.countG == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolGold: { level: "level 8", totalEarnig: 1024,status:"active" } },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1024,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      } else if (val.countG == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolGold: { level: "level 9", totalEarnig: 2048,status:"active" } },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:2048,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      } else if (val.countG == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolGold: { level: "level 10", totalEarnig: 8192,status:"active" },
            },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:8192,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      } else if (val.countG == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolGold: { level: "level 11", totalEarnig: 32768,status:"active" },
            },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:32768,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      } else if (val.countG == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolGold: { level: "level 12", totalEarnig: 131072,status:"active" },
            },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:131072,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      } else if (val.countG == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolGold: { level: "level 13", totalEarnig: 524288,status:"active" },
            },
            $push: {
              txn_info_GIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:524288,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }, 
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Gold Auto SmartPool*****************************

//Gold Auto SmartPool*****************************
router.get("/PlatinumStatus/:id", PlatinumStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[4]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[4] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[4] },
        { $set: { UpgradeIncome: data + 250 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 250,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 250,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if (  val.AutoPoolGold_Star.status=="active" && val.AutoPoolPlatinum.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countP: val.countP + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countP == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPlatinum: { level: "level 1", totalEarnig: 12,status:"active" } } ,
          $push: {
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:12,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }
          ,}
        );
      } else if (val.countP == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPlatinum: { level: "level 2", totalEarnig: 24,status:"active" } },
          $push: {
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:24,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countP == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPlatinum: { level: "level 3", totalEarnig: 48,status:"active" } } ,
          $push: {
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:48,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }}
        );
      } else if (val.countP == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPlatinum: { level: "level 4", totalEarnig: 96 ,status:"active"} },
          $push: {
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:96,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countP == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPlatinum: { level: "level 5", totalEarnig: 192,status:"active" } },
          $push: {
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:192,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countP == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPlatinum: { level: "level 6", totalEarnig: 384,status:"active" } },
          $push: {
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:384,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countP == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolPlatinum: { level: "level 7", totalEarnig: 768 ,status:"active"} },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:768,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countP == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolPlatinum: { level: "level 8", totalEarnig: 1536,status:"active" } },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1536,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countP == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolPlatinum: { level: "level 9", totalEarnig: 3072,status:"active" } },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:3072,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countP == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPlatinum: { level: "level 10", totalEarnig: 12288 ,status:"active"},
            },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:12288,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countP == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPlatinum: { level: "level 11", totalEarnig: 49152,status:"active" },
            },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:49152,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countP == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPlatinum: { level: "level 12", totalEarnig: 196608,status:"active" },
            },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:196608,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countP == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPlatinum: { level: "level 13", totalEarnig: 786432,status:"active" },
            },
            $push: {
              txn_info_PlIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:786432,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Pearl Auto SmartPool*****************************
router.get("/PearlStatus/:id", PearlStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[5]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[5] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[5] },
        { $set: { UpgradeIncome: data + 500 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 500,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 500,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if ( val.AutoPoolPearl.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countPe: val.countPe + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countPe == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPearl: { level: "level 1", totalEarnig: 14,status:"active" } },
          $push: {
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:14,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }
        }
      
        );
      } else if (val.countPe == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPearl: { level: "level 2", totalEarnig: 28 ,status:"active"} } ,
          $push: {
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:28,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }
        }
        );
      } else if (val.countPe == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPearl: { level: "level 3", totalEarnig: 56,status:"active" } },
          $push: {
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:56,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countPe == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPearl: { level: "level 4", totalEarnig: 112 ,status:"active"} } ,
          $push: {
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:112,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }}
        );
      } else if (val.countPe == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPearl: { level: "level 5", totalEarnig: 224,status:"active" } },
          $push: {
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:224,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countPe == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolPearl: { level: "level 6", totalEarnig: 448,status:"active" } },
          $push: {
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:448,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countPe == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolPearl: { level: "level 7", totalEarnig: 896,status:"active" } },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:896,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countPe == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolPearl: { level: "level 8", totalEarnig: 1792 ,status:"active"} },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1792,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countPe == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolPearl: { level: "level 9", totalEarnig: 3584 ,status:"active"} },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:3584,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countPe == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPearl: { level: "level 10", totalEarnig: 14336,status:"active" },
            },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1436,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countPe == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPearl: { level: "level 11", totalEarnig: 57344,status:"active" },
            },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:57344,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countPe == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPearl: { level: "level 12", totalEarnig: 229376 ,status:"active"},
            },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:229376,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countPe == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolPearl: { level: "level 13", totalEarnig: 917504,status:"active" },
            },
            $push: {
              txn_info_PeIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:917504,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});

//Ruby Auto SmartPool*****************************
router.get("/RubyStatus/:id", RubyStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[6]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[6] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[6] },
        { $set: { UpgradeIncome: data + 1250 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 1250,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 1250,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }

  //Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if ( val.AutoPoolRuby.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countR: val.countR + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countR == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolRuby: { level: "level 1", totalEarnig: 16,status:"active" } },
          $push: {
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:16,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }
         }
        );
      } else if (val.countR == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolRuby: { level: "level 2", totalEarnig: 32,status:"active" } } ,
          $push: {
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:32,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }}
        );
      } else if (val.countR == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolRuby: { level: "level 3", totalEarnig: 64,status:"active" } },
          $push: {
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:64,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countR == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolRuby: { level: "level 4", totalEarnig: 128,status:"active" } },
          $push: {
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:128,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countR == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolRuby: { level: "level 5", totalEarnig: 256,status:"active" } },
          $push: {
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:256,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countR == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolRuby: { level: "level 6", totalEarnig: 512 ,status:"active"} } ,
          $push: {
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:512,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }}
        );
      } else if (val.countR == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolRuby: { level: "level 7", totalEarnig: 1024,status:"active" } },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1024,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countR == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolRuby: { level: "level 8", totalEarnig: 2048,status:"active" } },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:2048,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countR == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolRuby: { level: "level 9", totalEarnig: 4096,status:"active" } },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:4096,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countR == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolRuby: { level: "level 10", totalEarnig: 16384,status:"active" },
            },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:16384,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countR == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolRuby: { level: "level 11", totalEarnig: 65536,status:"active" },
            },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:65536,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countR == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolRuby: { level: "level 12", totalEarnig: 262144 ,status:"active"},
            },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:262144,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      } else if (val.countR == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolRuby: { level: "level 13", totalEarnig: 1048576,status:"active" },
            },
            $push: {
              txn_info_RuIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1048576,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Emerald Auto SmartPool*****************************
router.get("/EmeraldStatus/:id", EmeraldStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[7]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[7] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[7] },
        { $set: { UpgradeIncome: data + 2500 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 2500,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 2500,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if (  val.AutoPoolEmerald.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countEm: val.countEm + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countEm == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolEmerald: { level: "level 1", totalEarnig: 18,status:"active" } } ,
          $push: {
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:18,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }}
        );
      } else if (val.countEm == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolEmerald: { level: "level 2", totalEarnig: 36,status:"active" } },
          $push: {
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:36,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } 
        }
        );
      } else if (val.countEm == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolEmerald: { level: "level 3", totalEarnig: 72,status:"active" } } ,
          $push: {
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:72,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countEm == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolEmerald: { level: "level 4", totalEarnig: 144 ,status:"active"} } ,
          $push: {
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:144,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } }
        );
      } else if (val.countEm == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolEmerald: { level: "level 5", totalEarnig: 288,status:"active" } },
          $push: {
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:288,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countEm == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolEmerald: { level: "level 6", totalEarnig: 576,status:"active" } },
          $push: {
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:576,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countEm == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolEmerald: { level: "level 7", totalEarnig: 1152, status:"active" } },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1152,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countEm == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolEmerald: { level: "level 8", totalEarnig: 2304,status:"active" } },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:2304,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countEm == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolEmerald: { level: "level 9", totalEarnig: 4608, status:"active" } },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:4608,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countEm == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolEmerald: { level: "level 10", totalEarnig: 18432, status:"active" },
            },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:18432,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countEm == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolEmerald: { level: "level 11", totalEarnig: 73728, status:"active" },
            },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:73728,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countEm == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolEmerald: { level: "level 12", totalEarnig: 294912, status:"active" },
            },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:294912,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countEm == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolEmerald: { level: "level 13", totalEarnig: 1179648, status:"active" },
            },
            $push: {
              txn_info_EmIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1179648,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Dimond Auto SmartPool*****************************
router.get("/DimondStatus/:id", DimondStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[8]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[8] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[8] },
        { $set: { UpgradeIncome: data + 5000 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 5000,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 5000,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if (  val.AutoPoolDiamond.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countDi: val.countDi + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countDi == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolDiamond: { level: "level 1", totalEarnig: 20, status:"active" } },
          $push: {
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:20,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          } 
         }
        );
      } else if (val.countDi == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolDiamond: { level: "level 2", totalEarnig: 40, status:"active" } },
          $push: {
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:40,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countDi == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolDiamond: { level: "level 3", totalEarnig: 80, status:"active" } },
          $push: {
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:80,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countDi == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolDiamond: { level: "level 4", totalEarnig: 160,status:"active" } },
          $push: {
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:160,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countDi == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolDiamond: { level: "level 5", totalEarnig: 320, status:"active" } },
          $push: {
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:320,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countDi == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          { $set: { AutoPoolDiamond: { level: "level 6", totalEarnig: 640, status:"active" } },
          $push: {
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
               earn:640,
                spend: 0,
                remain_bal:0,
               
              },
            ],
          }  }
        );
      } else if (val.countDi == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolDiamond: { level: "level 7", totalEarnig: 1280,status:"active" } },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1280,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countDi == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolDiamond: { level: "level 8", totalEarnig: 2560, status:"active" } },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:2560,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countDi == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolDiamond: { level: "level 9", totalEarnig: 5120, status:"active" } },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:5120,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countDi == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolDiamond: { level: "level 10", totalEarnig: 20480, status:"active" },
            },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:20480,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countDi == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolDiamond: { level: "level 11", totalEarnig: 81920, status:"active" },
            },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:81920,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countDi == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolDiamond: { level: "level 12", totalEarnig: 327680, status:"active" },
            },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:327680,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countDi == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolDiamond: { level: "level 13", totalEarnig: 1310720, status:"active" },
            },
            $push: {
              txn_info_DiIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1310720,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Antimatter Auto SmartPool*****************************
router.get("/AntimatterStatus/:id", AntimatterStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[9]==undefined,"jhhioho");
    if(referral.users[9]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[9] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[9] },
        { $set: { UpgradeIncome: data + 10000 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 10000,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 10000,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if ( val.AutoPoolAntimatter.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countAn: val.countAn + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countAn == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolAntimatter: { level: "level 1", totalEarnig: 22, status:"active" } },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:22,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: { AutoPoolAntimatter: { level: "level 2", totalEarnig: 44, status:"active" } },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:44,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 3", totalEarnig: 88, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:88,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 4", totalEarnig: 176,status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:176,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 5", totalEarnig: 352, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:352,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 6", totalEarnig: 704, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:704,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 7", totalEarnig: 1408, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1408,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 8", totalEarnig: 2816,status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:2816,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 9", totalEarnig: 5632, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:5632,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 10", totalEarnig: 22528, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:22528,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 11", totalEarnig: 90112, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:90112,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 12", totalEarnig: 360448, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:360448,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countAn == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolAntimatter: { level: "level 13", totalEarnig: 1441792, status:"active" },
            },
            $push: {
              txn_info_AnIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1441792,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//Crown Auto SmartPool*****************************
router.get("/CrownStatus/:id", CrownStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
    // const inc=referral.users[0]
    console.log(referral.users[0]==undefined,"jhhioho");
    if(referral.users[10]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[10] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[10] },
        { $set: { UpgradeIncome: data + 20000 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 20000,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 20000,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }
//Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if ( val.AutoPoolCrown_Master.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countCr: val.countCr + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countCr == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },

          {
            $set: {
              AutoPoolCrown_Master: { level: "level 1", totalEarnig: 24, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:24,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 2", totalEarnig: 48, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:48,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 3", totalEarnig: 96, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:96,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 4", totalEarnig: 192, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:192,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 5", totalEarnig: 384, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:384,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 6", totalEarnig: 768, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:768,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 7", totalEarnig: 1536, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1536,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 8", totalEarnig: 3072, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:3072,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 9", totalEarnig: 6144, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:6144,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 10", totalEarnig: 24576, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:24576,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 11", totalEarnig: 98304, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:98304,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 12", totalEarnig: 393216, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:393216,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCr == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              AutoPoolCrown_Master: { level: "level 13", totalEarnig: 1572864, status:"active" },
            },
            $push: {
              txn_info_CMIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1572864,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//VIP CF Auto SmartPool*****************************
router.get("/CFStatus/:id", CFStatus, async (req, res) => {
  try {
    const referral = await User.findById(req.params.id);
  
    if(referral.users[11]!=undefined ){
    let userdata = await User.findOne({ _id: referral.users[11] });
    let data = userdata.UpgradeIncome;
    if (userdata.AccountStatus == "active") {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: referral.users[11] },
        { $set: { UpgradeIncome: data + 25000 },
        $push: {
          UpgradeIncome_info: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 25000,
              debit_amt:0,
              sponerId:referral.ReferralCode,
              remain_bal:data + 25000,
            },
          ],
        }, }
      );
    }
  }else{
    console.log("Success");
  }

  //Count**********
const findUsers1 = await User.find();

findUsers1.map(async (val) => {
  if ( val.Smart_CF_Premium_Membership.status=="active") {
    const user2 = await User.updateOne(
      { _id: val._id },
      { $set: { countCf: val.countCf + 1 } }
    );
  }
});
 // Txn generate*************
 let txn_id_referral = await referralCodes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
});

    //BronzeSmartPool************************

    const Autopool = await User.find();

    Autopool.map(async (val) => {
      if (val.countCf == 2) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 1",
                totalEarnig: 24,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:24,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 4) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 2",
                totalEarnig: 48,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:48,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            }  
          }
        );
      } else if (val.countCf == 6) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 3",
                totalEarnig: 96,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:96,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 8) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 4",
                totalEarnig: 192,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:192,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 10) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 5",
                totalEarnig: 384,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:384,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 12) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 6",
                totalEarnig: 768,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:768,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 14) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 7",
                totalEarnig: 1536,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1536,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 16) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 8",
                totalEarnig: 3072,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:3072,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 18) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 9",
                totalEarnig: 6144,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:6144,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 20) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 10",
                totalEarnig: 24576,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:24576,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 22) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 11",
                totalEarnig: 98304,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:98304,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 24) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 12",
                totalEarnig: 393216,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:393216,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      } else if (val.countCf == 26) {
        let user2 = await User.updateOne(
          { _id: val._id },
          {
            $set: {
              Smart_CF_Premium_Membership: {
                level: "level 13",
                totalEarnig: 1572864,
                status:"active"
              },
            },
            $push: {
              txn_info_CFIncome: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                 earn:1572864,
                  spend: 0,
                  remain_bal:0,
                 
                },
              ],
            } 
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});
//ClubIncome**********************************************
router.get("/clubIncome/:id", async (req, res) => {
  try {
    let finddata = await User.find();
    const _id=await User.findById(req.params.id);
    console.log(_id,"watgaejn")
    let count = 0;
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    let count4 = 0;
    let count5 = 0;
    let count6 = 0;
    let count7 = 0;
    finddata.map(async (val) => {
      if (val.AccountStatus == "active") {
        //4 Star Club***********************

        if (val.users[0] == req.params.id) {
          console.log("true index 0");
          count++;
          // const data=await User.findByIdAndUpdate({_id:"630dfea2f27e6ff9e6381c90"})
        }

        //  else{
        //   console.log("false")
        //  }
        //  16 Star Club************************
        if (val.users[1] == req.params.id) {
          console.log("true index 1");
          count1++;
        }
        //  else{
        //   console.log("false");
        //  }
        // 64 Star Club************************
        if (val.users[2] ==req.params.id) {
          console.log("true index 2");
          count2++;
        }
        //  else{
        //   console.log("false");
        //  }
        // 256 Star Club**********************
        if (val.users[3] == req.params.id) {
          console.log("true index 3");
          count3++;
        }
        //  else{
        //   console.log("false");
        //  }
        // 1024 Star Club*********************
        if (val.users[4] == req.params.id) {
          console.log("true index 4");
          count4++;
        }
        // else{
        //   console.log("false");
        //  }
        //4096 Star Club*******************
        if (val.users[5] ==req.params.id) {
          console.log("true index 5");
          count5++;
        }
        //  else{
        //   console.log("false");
        //  }
        //16324 Club Star**********************
        if (val.users[6] == req.params.id) {
          console.log("true index 6");
          count6++;
        }
        //  else{
        //   console.log("false");
        //  }
        //32648 Club Star************
        if (val.users[7] == req.params.id) {
          console.log("true index 7");
          count7++;
        }
        //  else{
        //   console.log("false");
        //  }
      } else {
        console.log("status not active");
      }
    });
    //4Star Club******
    if (count > 3) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            star_4: 2,
          },
          $push: {
            txn_info_star_4: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
      console.log(user2, "4 star   ");
    } else {
      console.log("helo");
    }
    //16 Star Club Update************
    if (count1 > 6) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            star_16: 2,
          },
        
        $push: {
          txn_info_star_16: [
            {
              Txn_num: txn_id_wallet.toString(),
              Txn_date: Date.now(),
              credit_amt: 2,
              debit_amt:0,
              
              remain_bal:2,
            },
          ],
        }
        }
      );
      console.log(user2, "16 Star  ");
    } else {
      console.log("16 star");
    }
    //   //64 Star Club Update****************

    if (count2 > 8) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            star_64: 2,
          },
          $push: {
            txn_info_star_64: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
      console.log(user2);
    }
    //   //256 Star Club Update**********

    if (count3 > 10) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id},
        {
          $set: {
            star_256: 2,
          },
          $push: {
            txn_info_star_256: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
      // console.log(user2)
    }
    //     //1024 Star Club Update************
    if (count4 > 12) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id},
        {
          $set: {
            star_1024: 2,
          },
          $push: {
            txn_info_star_1024: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
      // console.log(user2)
    }
    //     //4096 Star Club Update************
    if (count5 > 14) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            star_4096: 2,
          },
          $push: {
            txn_info_star_4096: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
      // console.log(user2)
    }
    //     //16324 Star Club Update************
    if (count6 > 16) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            star_16324: 2,
          },
          $push: {
            txn_info_star_16324: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
      // console.log(user2)
    }
    //     //32648 Star Club Update************
    if (count7 > 18) {
      let txn_id_wallet = await referralCodes.generate({
        length: 10,
         count: 1,
         charset: "0123456789",
        });
      let user2 = await User.updateOne(
        { _id: req.params.id },
        {
          $set: {
            star_32648: 2,
          },
          $push: {
            txn_info_star_32648: [
              {
                Txn_num: txn_id_wallet.toString(),
                Txn_date: Date.now(),
                credit_amt: 2,
                debit_amt:0,
                
                remain_bal:2,
              },
            ],
          }
        }
      );
     
    }

    // console.log(count, count1, count2, count3, count4, count5, count6, count7);
  } catch (err) {
    console.log(err);
  }
});
router.post("/fundtransferReferral/:id", async (req, res) => {
  

  try {
    
let txn_id_referral = await referralCodes.generate({
        length: 10,
        count: 1,
        charset: "0123456789",
      });
      const _id = req.params.id;

      const amount = req.body.amount;
      const dscrtion = req.body.desc;
      const userRefIncome = await User.findOne({ _id });

      if (amount % 5 == 0 && userRefIncome.referral_income >amount) {
        
        // console.log(userRefIncome.referral_income);
        // console.log(userRefIncome.wallet);
        // console.log(amount);

        const dataUpdate = await User.findByIdAndUpdate(
          { _id: _id },
          {
            $set: {
              referral_income: userRefIncome.referral_income - amount,
              wallet: userRefIncome.wallet + amount,
            },
            $push: {
              txn_info_referral: [
                {
                  Txn_num: txn_id_referral.toString(),
                  Txn_date: Date.now(),
                  credit_amt: 0,
                  debit_amt: amount,
                  remain_bal: userRefIncome.referral_income - amount,
                },
              ],
              withdrawal_history: [
                {
                  Txn_num: txn_id_referral.toString(  ),
                  Txn_date: Date.now(),
                  amt: amount,
                  description: dscrtion,
                  status: "transfered sucessfully",
                },
              ],
            },
          }
        );
        // console.log(dataUpdate);
      res.status(200).json("transfer succesful");
          
      } else {
        res.status(210).json("Balance not Available ");
      }



  }catch (err) {
    console.log(err.message)
  }



})

router.post("/fundtransferLevel/:id",    async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.levelIncome >amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            levelIncome: userRefIncome.levelIncome - amount,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            txn_info_levelIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                credit_amt: 0,
                debit_amt: amount,
                remain_bal: userRefIncome.levelIncome - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});


router.post("/fundtransferUpgradeIncome/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.UpgradeIncome >amount) {
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            UpgradeIncome: userRefIncome.UpgradeIncome - amount,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            UpgradeIncome_info: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                credit_amt: 0,
                debit_amt: amount,
                remain_bal: userRefIncome. UpgradeIncome - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferAutoPoolBasic/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findById({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolBasic.totalEarnig >amount ) {
     
      // console.log(userRefIncome.AutoPoolBasic);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolBasic.totalEarnig":userRefIncome.AutoPoolBasic.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
              txn_info_BaIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.AutoPoolBasic.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferBronze/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolBronze.totalEarnig >amount) {
  

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolBronze.totalEarnig":userRefIncome.AutoPoolBronze.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_BrIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.AutoPoolBronze.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available  ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferSilver/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    // const _id=req.params.id;
    const userRefIncome = await User.findById({_id});
  
    if (amount % 5 == 0 && userRefIncome.AutoPoolSilver.totalEarnig >amount ) {
     
      // console.log(userRefIncome.AutoPoolSilver.totalEarnig);
      // console.log(userRefIncome.wallet);
      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolSilver.totalEarnig":userRefIncome.AutoPoolSilver.totalEarnig-amount  ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_SiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.AutoPoolSilver.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/fundtransferGold/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolGold.totalEarnig >amount) {
      
   

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolGold.totalEarnig":userRefIncome.AutoPoolGold.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_GIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.AutoPoolGold.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/fundtransferGoldStar/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolGold_Star.totalEarnig >amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolGold_Star.totalEarnig":userRefIncome.AutoPoolGold_Star.totalEarnig-amount  ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_GSIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolGold_Star.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferPlatinum/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolPlatinum.totalEarnig >amount ) {
      
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolPlatinum.totalEarnig":userRefIncome.AutoPoolPlatinum.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_PlIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolPlatinum.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferPearl/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome. AutoPoolPearl.totalEarning >amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolPearl.totalEarnig":userRefIncome.AutoPoolPearl.totalEarnig-amount,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_PeIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolPearl.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available  ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferAutoPoolEmerald/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolEmerald.totalEarnig>amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolEmerald.totalEarnig":userRefIncome.AutoPoolEmerald.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_EmIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolEmerald.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferAutoPoolRuby/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolRuby.totalEarning>amount) {
      
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolRuby.totalEarnig":userRefIncome.AutoPoolRuby.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_RuIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolRuby.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferAutoPoolDiamond/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolDiamond.totalEarning>amount) {
      
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolDiamond.totalEarnig":userRefIncome.AutoPoolDiamond.totalEarnig-amount,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_DiIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolDiamond.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferAutoPoolAntimatter/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findById({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolAntimatter.totalEarnig>amount) {
    
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolAntimatter.totalEarnig":userRefIncome.AutoPoolAntimatter.totalEarnig-amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_AnIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolAntimatter.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/fundtransferAutoPoolCrown_Master/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findById({ _id });
    if (amount % 5 == 0 && userRefIncome.AutoPoolCrown_Master.totalEarning >amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "AutoPoolCrown_Master.totalEarnig":userRefIncome.AutoPoolCrown_Master.totalEarnig-amount  ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_CMIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                AutoPoolCrown_Master.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferSmart_CF_Premium_Membership/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.Smart_CF_Premium_Membership.totalEarnig >amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "Smart_CF_Premium_Membership.totalEarnig":userRefIncome.Smart_CF_Premium_Membership.totalEarnig-amount   ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_CFIncome: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                earn: 0,
                spend: amount,
                remain_bal: userRefIncome.
                Smart_CF_Premium_Membership.totalEarnig - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available ");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransferstar_4/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findOne({ _id });
    if (amount % 5 == 0 && userRefIncome.star_4 >amount) {
     
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            star_4:userRefIncome.star_4- amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_star_4: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                credit_amt: 0,
                debit_amt: amount,
                remain_bal: userRefIncome.
                star_4 - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available");
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/fundtransfestar_16/:id", async (req, res) => {
  try {
    let txn_id_referral = await referralCodes.generate({
      length: 10,
      count: 1,
      charset: "0123456789",
    });
    const _id = req.params.id;

    const amount = req.body.amount;
    const dscrtion = req.body.desc;
    const userRefIncome = await User.findById({ _id });
    if (amount % 5 == 0 && userRefIncome.star_16>amount) {
      
      // console.log(userRefIncome.levelIncome);
      // console.log(userRefIncome.wallet);
      // console.log(amount);
      // console.log(dscrtion);

      const dataUpdate = await User.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            star_16:userRefIncome.star_16- amount ,
            wallet: userRefIncome.wallet + amount,
          },
          $push: {
            
            
            txn_info_star_16: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                credit_amt: 0,
                debit_amt: amount,
                remain_bal: userRefIncome.
                star_16 - amount,
              },
            ],
            withdrawal_history: [
              {
                Txn_num: txn_id_referral.toString(),
                Txn_date: Date.now(),
                amt: amount,
                description: dscrtion,
                status: "transfered sucessfully",
              },
            ],
          },
        }
      );
      // console.log(dataUpdate);
      res.status(200).json("transfer succesful")
    } else {
      res.status(210).json("Balance not Available");
    }
  } catch (err) {
    console.log(err.message);
  }
});


//Login Page***********
router.post("/login", async (req, res) => {
  try {
    // let token;
    const { email, password } = req.body;
    // console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ error: "Fill all details" });
    }
    //findone check krega ki database me email ye wala h ki nhi********
    const userLogin = await User.findOne({ email });
    // console.log(userLogin);

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      if (!isMatch) {
        res.status(400).json({ error: "Invalid username or password" });
      } else {
        //JWT Token Use**********
        const token = await userLogin.generateAuthToken();
        // console.log(token);
        res.cookie("jwtoken", token, {
          expires: new Date(Date.now() + 2589200000),
          httpOnly: true,
        });

        res.status(200).json({ message: "login Successfull", userLogin });
        // console.log(userLogin, "login");
      }
    } else {
      console.log("something went wrong");
      res.status(400).json({ error: "Invalid Detail" });
    }
  } catch (err) {
    console.log(err);
  }
});
//************************************************ */
router.post("/changepass/:id", async (req, res) => {
  // try{
  // const data=await User.findByIdAndUpdate(req.params.id,req.body,{new:true});
  // console.log(data)
  // if (userLogin) {
  //   const isMatch = await bcrypt.compare(password, userLogin.password);
  //   console.log(isMatch);
  //   if (!isMatch) {
  //     res.status(422).json({ error: "password not exist" });
  //   } else if (newpassword != cpassword) {
  //     res.status(423).json({ error: "password not match" });
  //   } else {
  //     let changePass = await User.updateOne(
  //       { _id: userLogin._id },
  //       {
  //         $set: {
  //           password: await bcrypt.hash(newpassword, 6),
  //           cpassword: await bcrypt.hash(cpassword, 6),
  //         },
  //       }
  //     );

  //     console.log(changePass);
  //     res.status(200).json({ message: "successful change Password" });
  //   }
  // } else {
  //   res.status(400).json({ error: "erroror" });
  // }
  // res.status(200).json({success:true,})
  // }
  // catch(err){
  // console.log(err)
  // }

  const { password, newpassword, cpassword } = req.body;

  const userLogin = await User.findById(req.params.id);

  if (userLogin) {
    const isMatch = await bcrypt.compare(password, userLogin.password);
    // console.log(isMatch);
    if (!isMatch) {
      res.status(400).json({ error: "password not exist" });
    } else if (newpassword != cpassword) {
      res.status(423).json({ error: "password not match" });
    } else {
      let changePass = await User.updateOne(
        { _id: userLogin._id },
        {
          $set: {
            password: await bcrypt.hash(newpassword, 6),
            cpassword: await bcrypt.hash(cpassword, 6),
          },
        }
      );

      // console.log(changePass);
      res.status(200).json({ message: "successful change Password" });
    }
  } else {
    res.status(400).json({ error: "erroror" });
  }
});

router.post("/getAllData",authenticate,  async(req, res) => {
 
  res.send(req.rootUser);
});
router.get("/LogOut", (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).json({ message: "User LogOut" });
});

module.exports = router;
