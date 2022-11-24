

const User=require("../model/userSchema");




const StatusCheck=async(req,res,next)=>{
try{
 const _id=req.params.id;
  const user=await User.findById(_id);
  // console.log(user)
  let userReferral = await User.findOne(user.users[0] );
  console.log(userReferral.AccountStatus)

if(user.AccountStatus=="active" && user.AutoPoolBasic.status=="active" && userReferral.AccountStatus=="active"){
  next()

}

else{
  console.log("Plz Active your Account")
}
}catch(err){
    res.status(401).send('UnAuthorazied token');
    console.log(err);
}
}

const BronzeStatus=async(req,res,next)=>{
  try{
    const _id=req.params.id;
  const user=await User.findById(_id);
  if(user.AutoPoolBasic.status=="active" && user.AutoPoolBronze.status=="active" ){
    next()
    console.log("sdgsdjhtsk")
  }
  
  else{
    console.log("LevelIncome not work plz Active")
  }
  }catch(err){
      res.status(401).send('UnAuthorazied token');
      console.log(err);
  }
  }
  const SilverStatus=async(req,res,next)=>{
    try{
      const _id=req.params.id;
      const user=await User.findById(_id);
    if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
      next()
      console.log("sdgsdjhtsk")
    }
    
    else{
      console.log("LevelIncome not work plz Active")
    }
    }catch(err){
        res.status(401).send('UnAuthorazied token');
        console.log(err);
    }
    }
    const GoldStatus=async(req,res,next)=>{
      try{
        const _id=req.params.id;
        const user=await User.findById(_id);
      if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
        next()
        console.log("sdgsdjhtsk");
      }
      
      else{
        console.log("LevelIncome not work plz Active")
      }
      }catch(err){
          res.status(401).send('UnAuthorazied token');
          console.log(err);
      }
      }
      const GoldStarStatus=async(req,res,next)=>{
        try{
          const _id=req.params.id;
  const user=await User.findById(_id);
        if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
          next()
          console.log("sdgsdjhtsk")
        }
        
        else{
          console.log("LevelIncome not work plz Active")
        }
        }catch(err){
            res.status(401).send('UnAuthorazied token');
            console.log(err);
        }
        }
        const PlatinumStatus=async(req,res,next)=>{
          try{
            const _id=req.params.id;
            const user=await User.findById(_id);
          if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
            next()
            console.log("sdgsdjhtsk")
          }
          
          else{
            console.log("LevelIncome not work plz Active")
          }
          }catch(err){
              res.status(401).send('UnAuthorazied token');
              console.log(err);
          }
          }
          const PearlStatus=async(req,res,next)=>{
            try{
              const _id=req.params.id;
              const user=await User.findById(_id);
            if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
              next()
              console.log("sdgsdjhtsk")
            }
            
            else{
              console.log("LevelIncome not work plz Active")
            }
            }catch(err){
                res.status(401).send('UnAuthorazied token');
                console.log(err);
            }
            }
            const RubyStatus=async(req,res,next)=>{
              try{
                const _id=req.params.id;
                const user=await User.findById(_id);
              if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
                next()
                console.log("sdgsdjhtsk")
              }
              
              else{
                console.log("LevelIncome not work plz Active")
              }
              }catch(err){
                  res.status(401).send('UnAuthorazied token');
                  console.log(err);
              }
              }
              const EmeraldStatus=async(req,res,next)=>{
                try{
                  const _id=req.params.id;
                  const user=await User.findById(_id);
                if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
                  next()
                  console.log("sdgsdjhtsk")
                }
                
                else{
                  console.log("LevelIncome not work plz Active")
                }
                }catch(err){
                    res.status(401).send('UnAuthorazied token');
                    console.log(err);
                }
                }
                const DimondStatus=async(req,res,next)=>{
                  try{
                    const _id=req.params.id;
                    const user=await User.findById(_id);
                  if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
                    next()
                    console.log("sdgsdjhtsk")
                  }
                  
                  else{
                    console.log("LevelIncome not work plz Active")
                  }
                  }catch(err){
                      res.status(401).send('UnAuthorazied token');
                      console.log(err);
                  }
                  }
                  const AntimatterStatus=async(req,res,next)=>{
                    try{
                      const _id=req.params.id;
                      const user=await User.findById(_id);
                    if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
                      next()
                      console.log("sdgsdjhtsk")
                    }
                    
                    else{
                      console.log("LevelIncome not work plz Active")
                    }
                    }catch(err){
                        res.status(401).send('UnAuthorazied token');
                        console.log(err);
                    }
                    }
                    const CrownStatus=async(req,res,next)=>{
                      try{
                        const _id=req.params.id;
                        const user=await User.findById(_id);
                      if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
                        next()
                        console.log("sdgsdjhtsk")
                      }
                      
                      else{
                        console.log("LevelIncome not work plz Active")
                      }
                      }catch(err){
                          res.status(401).send('UnAuthorazied token');
                          console.log(err);
                      }
                      }
                      const CFStatus=async(req,res,next)=>{
                        try{
                          const _id=req.params.id;
                          const user=await User.findById(_id);
                        if(user.AutoPoolBasic.status=="active" && user. AutoPoolBronze.status=="active",user.AutoPoolSilver.status=="active" ){
                          next()
                          console.log("sdgsdjhtsk")
                        }
                        
                        else{
                          console.log("LevelIncome not work plz Active")
                        }
                        }catch(err){
                            res.status(401).send('UnAuthorazied token');
                            console.log(err);
                        }
                        }
module.exports={StatusCheck,BronzeStatus,SilverStatus,GoldStatus,GoldStarStatus,PlatinumStatus,PearlStatus,
  RubyStatus,EmeraldStatus,DimondStatus,AntimatterStatus,CrownStatus,CFStatus};