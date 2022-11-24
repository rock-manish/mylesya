const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ObjectId}=mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
  ReferralCode: {
    type: String,
  
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,

  },

isAdmin:{
  type:Boolean,
  default:false
},
  phone: {
    type: String,
    required: true,
  },

 
 
    city:{
     type: String,
    },
    state:{
      type:String
    },
    upiId:{
      type:String
    },
    country:{
      type:String
    },
    ReferralCase: {
      type: String,
      enum: [
        "Null",
        "first",
        "second",
        "third",
        "fourth"
      
      ],
     default: "Null"
    },
  users:[
    {
    type:ObjectId,
   
    }
  ]   
,
clublevel:{
  type:Array,
  default:[]
},
  seqId:{
    type:String,
    default:"Avnish"
  } , 
// users:[]
  
 count:{
  type:Number,
  default:0
 },
 countBr:{
  type:Number,
  default:0
 },
 counts:{
  type:Number,
  default:0
 },
 countG:{
  type:Number,
  default:0
 },
 countSG:{
  type:Number,
  default:0
 },
 countP:{
  type:Number,
  default:0
 },
 countPe:{
  type:Number,
  default:0
 },
 countR:{
  type:Number,
  default:0
 },
 countEm:{
  type:Number,
  default:0
 },
 countDi:{
  type:Number,
  default:0
 },
 countAn:{
  type:Number,
  default:0
 },
 countCr:{
  type:Number,
  default:0
 },
 countCf:{
  type:Number,
  default:0
 },

 RefCount:{
  type:Number,
  default:0
 },
 wallet: { type: Number,default:0 },
 txn_info_wallet: [
  {
    Txn_num: Number,
    Txn_date: Date,
    credit_amt: Number,
    debit_amt:Number,
    sponerId:String,
    remain_bal:Number,
  }

],
 
 referral_income:{type:Number ,default:0},
 txn_info_referral: [
   {
     Txn_num: Number,
     Txn_date: Date,
     credit_amt: Number,
     debit_amt:Number,
     remain_bal:Number,
   }

 ],
  
 txn_info_Activation: [
  {
    Txn_num: Number,
    Txn_date: Date,
    amount:Number,
    sponerId:String,
    
  }

],
UpgradeIncome:{
    type: Number,
    default:0},
    UpgradeIncome_info:[
      { Txn_num: Number,
        Txn_date: Date,
        credit_amt: Number,
        debit_amt:Number,
        sponerId:String,
        remain_bal:Number
        }],
  
  level: {
    type: Number,
    enum: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    default:0
  },
  levelIncome: {
    type: Number,
    default:0},
    txn_info_levelIncome: [
      {
        Txn_num: Number,
        Txn_date: Date,
        credit_amt: Number,
        debit_amt:Number,
        remain_bal:Number,
        sponsorId:String
      }
   
    ],
    withdrawal_history: [
      {
        Txn_num: Number,
        Txn_date: Date,
        amt: Number,
        description: String,
        status:String
      },
    ],
  AccountStatus:{
  type : String,
  enum: ["active" , "disable", "pending"],
    default:"active"
  
   },
  AutoPoolBasic:{
    totalEarnig:{
      type:Number,
      default:0

    },
  
    totalSpend:{
      type:Number,
      default:0
    },
   
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
  
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192]
    },

   
   
   
   
   
  },
  txn_info_BaIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolBronze:{
    status:{
      type:String,
      enum:["active","disable","pending"],
        default:"active",
      },
      totalEarnig:{
        type:Number,
        default:0
      },
      totalSpend:{
        type:Number
      },
     
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
   
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
    
  },
  txn_info_BrIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolSilver:{
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
   
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
   
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

  
   
  
  },
  txn_info_SiIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolGold:{
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
    
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
  
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
    
   
  },
  txn_info_GIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolGold_Star:{
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number
      , default:0
    },
   
   
   
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
   
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
  },
  txn_info_GSIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolPlatinum:{
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
   
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
   
   
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
   
   
  
  },
  txn_info_PlIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolPearl:{
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
  
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
   
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
 
  },
  txn_info_PeIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolRuby:{
   
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
    
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
   
  },
  txn_info_RuIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolEmerald:{
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
   
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
  
  },
  txn_info_EmIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolDiamond:{
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
 
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
  },
  txn_info_DiIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolAntimatter:{
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
   
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
    
  },
  txn_info_AnIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  AutoPoolCrown_Master:{
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
 
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
   
  },
  txn_info_CMIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  Smart_CF_Premium_Membership:{
    totalEarnig:{
      type:Number,
      default:0
    },
    totalSpend:{
      type:Number,
      default:0
    },
  
    status:{
      type:String,
      enum:["active","disable","pending"],
      default:"active",
    },
    level:{
      type: String,
      enum: ["level 0","level 1", "level 2", "level 3", "level 4", "level 5","level 6","level 7","level 8","level 9","level 10","level 11","level 12","level 13"],

      default: "level 0",
    },
    patners:{
      type:Number,
      enum:[4,8,16,32,64,128,256,512,1024,2024,4096,8192,16384]
    },

   
  },
  txn_info_CFIncome: [
    {
      Txn_num: Number,
      Txn_date: Date,
      earn: Number,
      spend:Number,
      remain_bal:Number,
      
    }
 
  ],
  
  star_4:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
   
  },
  txn_info_star_4: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
  star_16:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
  
  },
  txn_info_star_16: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
  star_64:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
   
  },
  txn_info_star_64: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
  star_256:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
   
  },
  txn_info_star_256: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
  star_1024:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
  
  },
  txn_info_star_1024: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
  star_4096:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
  
  },
  txn_info_star_4096: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
 star_16324:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
   
  },
  txn_info_star_16324: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],
 star_32648:{
    type:Number,
    default:0,
    totalSpend:{
      type:Number,
      default:0,
    },
   
  },
  txn_info_star_32648: [
    {
      Txn_num: Number,
      Txn_date: Date,
      credit_amt: Number,
      debit_amt:Number,
      remain_bal:Number,
    }],

},{timestamps:true});
//password hashing save se pahle*******
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});
//we are generateing token************
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY).toString();
    // this.tokens = this.tokens.concat({ token: token });
    // await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("User", userSchema);
//hum apne Collection ko export kra denge dusre file me use krne ke liye***
module.exports = User;
