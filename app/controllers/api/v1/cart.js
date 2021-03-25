const {check,validationResult} = require('express-validator');
const getfunction = require('./getfunction.js');


exports.addCart=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
        getfunction.addCart(req).then(result => {
            return res.status(200).json({status:'success',message:'Record Found'});;
        }).catch(err => {
	       	return res.status(400).json({status:'fail',message:err.message});
		});
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}

exports.getCartList=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
        getfunction.getCartList(req).then(result => {
            return res.status(200).json({status:'success',message:'Record Found', data : result});;
        }).catch(err => {
	       	return res.status(400).json({status:'fail',message:err.message});
		});
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}

exports.updateCart=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
        getfunction.updateCart(req).then(result => {
            return res.status(200).json({status:'success',message:'Record Found',data:result});;
        }).catch(err => {
	       	return res.status(400).json({status:'fail',message:err.message});
		});
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}

exports.deleteCartItem=(req,res,next)=>{
    const errors = validationResult(req);
   if (errors.isEmpty()) {
       getfunction.deleteCartItem(req).then(result => {
           return res.status(200).json({status:'success',message:'Record Removed successfully',data:result});;
       }).catch(err => {
              return res.status(400).json({status:'fail',message:err.message});
       });
   }else{
       return res.json({status:'fail',errors:errors.mapped()});
   }
}


