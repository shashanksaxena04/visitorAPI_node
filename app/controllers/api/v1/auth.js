const { response } = require('express');
const {check,validationResult} = require('express-validator');
const DB = require('./../../../config/db');
const md5=require('md5');
exports.login=(req,res,next)=>{
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        DB.GetQuery("SELECT * FROM `users` WHERE `phone`='"+req.body.username+"' OR `email`='"+req.body.username+"'").then(result => {
            if(result[0].password==md5(req.body.password)){
                var data={};
                data.user_id=result[0].id;
                data.first_name=result[0].first_name;
                data.last_name=result[0].last_name;
                data.email=result[0].email;
                data.phone=result[0].phone;
                data.membership_start_date=result[0].membership_start_date;
                data.membership_end_date=result[0].membership_end_date;
                return res.json({status:'success',message : "Login Successfully",profile:data});
            }else{
                return res.status(400).json({status:'fail',message : "Invalid Password"});
            }
        }).catch(err => {
            return res.status(400).json({status:'fail',message : err.message});
        })
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }

}