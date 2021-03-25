const {check,validationResult} = require('express-validator');
const DB = require('./../../../config/db');
const md5=require('md5');

exports.profile=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
            DB.GetQuery("SELECT *, CONCAT('"+profile_url+"',avatar) as avatar FROM "+TBL_USERS+" WHERE `id`='"+req.user_id+"'").then(result => {
                 var data={};
                 if(result) { 
                    data.user_id=result[0].id;
                    data.first_name=result[0].first_name;
                    data.last_name=result[0].last_name;
                    data.email=result[0].email;
                    data.phone=result[0].phone;
                    data.avatar=result[0].avatar;
                    data.membership_start_date=result[0].membership_start_date;
                    data.membership_end_date=result[0].membership_end_date;
                    return res.status(200).json({status:'success',message:'Record Found',data:data})
                 } else { 
                    return res.status(400).json({status:'fail',message:'Record  Not Found'})
                 }
            }).catch(err => {
               return res.status(400).json({status:'fail',message: err.message})
            })
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}

exports.updateProfile=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
            DB.UpdateData(TBL_USERS,{first_name:req.body.first_name,last_name:req.body.last_name},{id:req.user_id}).then(result => {
                if(result) {
                   return res.status(200).json({status:'success',message:'Update Record Successfully'})
                } else { 
                   return res.status(400).json({status:'fail',message:'Record  Not Updated'})
                }
            }).catch(err => {
               return res.status(400).json({status:'fail',message: err.message})
            })
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}


exports.changePassword=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
        DB.GetQuery("SELECT * FROM "+TBL_USERS+" WHERE `id`='"+req.user_id+"'").then(result => {
            if(result) {
                if(result[0].password==md5(req.body.old_password)){
                    DB.UpdateData(TBL_USERS,{password:md5(req.body.new_password)},{id:req.user_id}).then(result => {
                        if(result) {
                            return res.status(200).json({status:'success',message:'Password Updated Successfully'})
                        } else { 
                            return res.status(400).json({status:'fail',message:'Password Not Updated'})
                        }
                    }).catch(err => {
                       return res.status(400).json({status:'fail',message: err.message})
                    })
                }else{
                      return res.status(400).json({status:'fail',message:'Your new password must not match your old password'})
                }
            } else {
                return res.status(400).json({status:'fail',message:'User not exist'})
            }
        }).catch(err => {
           return res.status(400).json({status:'fail',message: err.message})
        })
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}

exports.addAddress=(req,res,next)=>{
    var data={
        "user_id":req.user_id,
        "merchant_id":req.merchant_id,
        "full_name":req.body.full_name,
        "phone":req.body.phone,
        "pincode":req.body.pincode,
        "address1":req.body.address1,
        "address2":req.body.address2,
        "city":req.body.city,
        "state":req.body.state,
        "is_select" : 1
    }

    DB.GetQuery("SELECT * FROM "+TBL_MAPP_USER_ADDRESS+" WHERE `user_id`="+req.user_id+" AND  merchant_id="+req.merchant_id).then(result => {
        if(result){
            DB.UpdateData(TBL_MAPP_USER_ADDRESS,{is_select:0},{user_id:req.user_id, merchant_id:req.merchant_id}).then(result => {
                if(result) {
                    DB.InsertData(TBL_MAPP_USER_ADDRESS,data).then(result => {
                        if(result) {
                                return res.status(200).json({status:'success',message:'Address Added Successfully'})
                            } else { 
                                return res.status(400).json({status:'fail',message:'Failed to add Address'})
                            }
                    }).catch(err => {
                       return res.status(400).json({status:'fail',message: err.message})
                    })
                } else { 
                   return res.status(400).json({status:'fail',message:'Record Not Updated'})
                }
            }).catch(err => {
               return res.status(400).json({status:'fail',message: err.message})
            })
        }else{
            DB.InsertData(TBL_MAPP_USER_ADDRESS,data).then(result => {
                if(result) {
                    return res.status(200).json({status:'success',message:'Address Added Successfully'})
                } else { 
                    return res.status(400).json({status:'fail',message:'Failed to add Address'})
                }
            }).catch(err => {
               return res.status(400).json({status:'fail',message: err.message})
            })
        }
    }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })
   
}
 
exports.getAddressList=(req,res,next)=>{ 
    DB.GetQuery("SELECT * FROM "+TBL_MAPP_USER_ADDRESS+" WHERE `user_id`="+req.user_id+" AND  merchant_id="+req.merchant_id).then(result => {
        return res.status(200).json({status:'success',message:'Record Found',data:result})
    }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })
}


exports.getAddressByID=(req,res,next)=>{ 
    DB.GetQuery("SELECT * FROM "+TBL_MAPP_USER_ADDRESS+" WHERE `user_id`="+req.user_id+" AND  merchant_id="+req.merchant_id+" AND id = "+req.params.addressId).then(result => {
        if(result) {
           return res.status(200).json({status:'success',message:'Record Found',data:result[0]})
        } else {
            return res.status(400).json({status:'fail',message:'Record Not Found'})
        }
    }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })
}


exports.updateAddress=(req,res,next)=>{ 
    var data={
        "full_name":req.body.full_name,
        "phone":req.body.phone,
        "pincode":req.body.pincode,
        "address1":req.body.address1,
        "address2":req.body.address2,
        "city":req.body.city,
        "state":req.body.state,
        "is_select" : 1
    }
    DB.UpdateData(TBL_MAPP_USER_ADDRESS,{is_select:0},{user_id:req.user_id, merchant_id:req.merchant_id}).then(result => {
        if(result) {
            DB.UpdateData(TBL_MAPP_USER_ADDRESS,data,{id:req.params.addressId}).then(result => {
                if(result) {
                        return res.status(200).json({status:'success',message:'Address updated Successfully'})
                    } else { 
                        return res.status(400).json({status:'fail',message:'Failed to add Address'})
                    }
            }).catch(err => {
               return res.status(400).json({status:'fail',message: err.message})
            })
        } else { 
           return res.status(400).json({status:'fail',message:'Record Not Updated'})
        }
    }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })
}


exports.selectAddress=(req,res,next)=>{ 
    DB.UpdateData(TBL_MAPP_USER_ADDRESS,{is_select:0},{user_id:req.user_id, merchant_id:req.merchant_id}).then(result => {
        if(result) {
            DB.UpdateData(TBL_MAPP_USER_ADDRESS,{is_select:1},{id:req.params.addressId}).then(result => {
                if(result) {
                        return res.status(200).json({status:'success',message:'Address Selected Successfully'})
                    } else { 
                        return res.status(400).json({status:'fail',message:'Failed to add Address'})
                    }
            }).catch(err => {
               return res.status(400).json({status:'fail',message: err.message})
            })
        } else { 
           return res.status(400).json({status:'fail',message:'Record Not Updated'})
        }
    }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })
}

exports.registerUser=(req,res,next)=>{
    const errors = validationResult(req);
   if (errors.isEmpty()) {
    DB.GetQuery("SELECT * FROM "+TBL_USERS+" WHERE `email`='"+req.body.email+"'").then(result => {
        
        if(result.length !==0){
            return res.status(400).json({status:'fail',message:'Email already register'})
        }else{

    DB.GetQuery("SELECT * FROM "+TBL_USERS+" WHERE `phone`='"+req.body.phone+"'").then(resultData => {  
        
        if(resultData.length){
            return res.status(400).json({status:'fail',message:'Phone number already taken'})
        }else{

            var data = {
                email : req.body.email,
                phone : req.body.phone,
                password : md5(req.body.password),

            }

        DB.InsertData(TBL_USERS,data).then(result => {
            if(result){
                return res.status(200).json({status:'success',message:'User Registered Successfully'})
            }else{
                return res.status(400).json({status:'fail',message:'User Registration failed'})
            }
        }).catch(err => {
            return res.status(400).json({status:'fail',message:'Unexpected error',error:err.message})
        })
        }

    })

        }
        
    })
   }else{
       return res.json({status:'fail',errors:errors.mapped()});
   }
}



