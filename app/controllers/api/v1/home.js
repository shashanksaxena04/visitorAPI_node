const { response } = require('express');
const {check,validationResult} = require('express-validator');
const DB = require('./../../../config/db');
const getfunction = require('./getfunction.js');


exports.home=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
        getfunction.getSliderData(req).then(slider_result => {
            getfunction.getCategoryData(req).then(category_result => {
                getfunction.getProductData(req).then(product_result => {
                    var data = { 
                        slider : slider_result,
                        category : category_result,
                        product : product_result
                    }
                    return res.status(200).json({status:'success',message:'Record Found',data:data});
                }).catch(err => {
        	       	 return res.status(400).json({status:'fail',message:err.message});
        		});
            }).catch(err => {
    	       	 return res.status(400).json({status:'fail',message:err.message});
    		});
        }).catch(err => {
	       	 return res.status(400).json({status:'fail',message:err.message});
		});
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}