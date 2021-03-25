const { response, request } = require('express');
const {check,validationResult} = require('express-validator');
const DB = require('../../config/db');
var randomstring = require("randomstring");
const md5=require('md5');





exports.adminLogin=(req,res,next)=>{
    const errors = validationResult(req);
    if (req.body.email==undefined || req.body.email==null ||req.body.email=='') {
        return res.json({ code: 200, status: "fail", message:"Please Enter the Email"}); 
    }else if(req.body.password==undefined || req.body.password==null ||req.body.password==''){
        return res.json({ code: 200, status: "fail", message:"Please Enter the Password"});   
    }else{
        DB.GetQuery("SELECT * FROM `users` WHERE `email`='"+req.body.email+"'").then(result => {
            if(result.length ==0){
                  return res.json({code: 200, status:'fail',message : "Invalid Email"});
            }else{
                 if(result[0].password==md5(req.body.password)){
                return res.json({code: 200,status:'success',message : "Login Successfully",profile:result[0]});
            }else{
                return res.json({code: 200, status:'fail',message : "Invalid Password"});
            }
            }
           
        }).catch(err => {
            return res.status(400).json({code: 400, status:'fail',message : err.message});
        })
    }

}

exports.forgotPassword=(req,res,next)=>{

   var sendTO = req.body.email
   var otp = randomstring.generate({
                    length: 4,
                    charset: 'numeric'
                });
    
    var mailOptions = {
        from:'visitlog1@gmail.com',
        to: sendTO,
        subject: 'Sending Email using Node.js',
        text: 'OTP to reset password is '+otp
      };

    DB.GetRow(TBL_USERS,{email:sendTO}).then(result=>{

        if(result){
          
        DB.UpdateData(TBL_USERS, {otp:otp},{id:result.id}).then(result=>{

            if(result){
                DB.sendMailFunction(mailOptions).then(result => {
                    console.log(result)
                    if(result){
                        return res.json({code: 200,status:'success',message : "Mail sent successfully",data:result});
                    }else{
                        return res.json({code: 200, status:'fail',message : "Failed to sent mail"});
                    }
                }).catch(err => {
                    return res.status(400).json({code: 400, status:'fail',message : err.message});
                })
            }
           
        }).catch(err=>{
            return res.status(400).json({code: 400, status:'fail',message : err.message}); 
        })
        }else{
            return res.json({code: 200, status:'fail',message : "User not found"});
        }


    }).catch(err=>{
        return res.status(400).json({code: 400, status:'fail',message : err.message});
    })

}

exports.verifyOTP=(req,res,next)=>{
console.log(req.body)
    DB.GetRow(TBL_USERS,{email:req.body.email}).then(result=>{
console.log(result)
        if(result.otp == req.body.otp){

            DB.UpdateData(TBL_USERS, {otp:null},{id:result.id}).then(result=>{
                if(result){
                    return res.json({code: 200,status:'success',message : "OTP Matched successfully"});
                }
            }).catch(err=>{
                return res.status(400).json({code: 400, status:'fail',message : err.message});
            })

            
        }else{
            return res.json({code: 200, status:'fail',message : "OTP not matched"});
        }
    }).catch(err=>{
        return res.status(400).json({code: 400, status:'fail',message : err.message});
    })

}

exports.resetPassword=(req,res,next)=>{
    console.log(req)
    var password = md5(req.body.password)
    DB.UpdateData(TBL_USERS, {password:password},{email:req.body.email}).then(result=>{
        if(result){
            return res.json({code: 200,status:'success',message : "Password reset successfully"});
        }else{
            return res.json({code: 200,status:'fail',message : "Failed to reset password"});   
        }
    }).catch(err=>{
        return res.status(400).json({code: 400, status:'fail',message : err.message});
    })

}







