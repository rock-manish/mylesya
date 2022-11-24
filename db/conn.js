const mongoose=require("mongoose");
const DB=process.env.DataBase;
mongoose.connect(DB,{useNewUrlParser:true,
    useUnifiedTopology:true
    },()=>{
        console.log("database connected");
    });