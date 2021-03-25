const { response } = require('express');
const {check,validationResult} = require('express-validator');
const DB = require('./../../../config/db');
const getfunction = require('./getfunction.js');
var serialize = require('serialize-javascript');

exports.createOrder=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
        DB.GetQuery("SELECT * FROM "+TBL_MAPP_USER_ADDRESS+" WHERE is_select = 1 AND merchant_id="+req.merchant_id+" AND user_id = "+req.user_id).then(delivery_address => {
            if(delivery_address) {
                getfunction.getCartList(req).then(cart_result => {
                    if(cart_result.result.length) {
                        var OrderData = {
                            merchant_id : req.merchant_id,
                            user_id : req.user_id,
                            delivery_address : serialize(delivery_address[0]),
                            note : req.body.note,
                            payment_type : req.body.payment_type,
                            payment_status : req.body.payment_type == 'CASH' ?  'COMPLETE' : 'PENDING',
                            total_price : cart_result.cartTotal
                        }
                        DB.InsertData(TBL_MAPP_ORDERS,OrderData).then(order_data => {
                            
                            
                        //   return res.status(200).json({status:'success',message:'Record Found',data:order_data})
                            for(var i=0; i<result.length; i++) {
                                
                            }
    
                           
                        }).catch(err => {
                	       	 return res.status(400).json({status:'fail',message:err.message});
                		});
                		
                    } else {
                        return res.status(400).json({status:'fail',message:"Your cart empty id empty"});
                    }
                    //     // for(var i=0; i<result.length; i++) {
                        
                    //     // }
                    //             return res.status(200).json({status:'success',message:'Record Found',data:cart_result,order_result:order_result});
    
                        
                    // },TBL_MAPP_ORDERS,OrderData)
                    // for(var i=0; i<result.length; i++) {
                        
                    // }TBL_MAPP_ORDER_DETAILS
                
            //         getfunction.getProductData(req).then(product_result => {
            //             var data = { 
            //                 merchant_id : req.merchant_id,
            //                 user_id : req.user_id,
            //                 order_number : req.order_number,
            //                 delivery_address : req.delivery_address,
            //                 note : req.note,
            //                 payment_type : req.payment_type,
            //                 payment_status : req.payment_status,
            //                 total_price : 
            //             }
            //             return res.status(200).json({status:'success',message:'Record Found',data:data});
            //         }).catch(err => {
            // 	       	 return res.status(400).json({status:'fail',message:err.message});
            // 		});
                }).catch(err => {
        	       	 return res.status(400).json({status:'fail',message:err.message});
        		});
            } else {
                return res.status(400).json({status:'fail',message:'Please Add Delivery Address'});
            }
        }).catch(err => {
    	       	 return res.status(400).json({status:'fail',message:err.message});
        })
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}


exports.getOrderList=(req,res,next)=>{

    DB.GetQuery("SELECT * FROM "+TBL_MAPP_ORDERS+" WHERE merchant_id="+req.merchant_id+" AND user_id = "+req.user_id)
    .then(result => {
     if(result){
        return res.status(200).json({status:'success',message:'Record Found',data:result});
     }else{
        return res.status(400).json({status:'fail',message:'Record  Not Found'})
     }

    });

}


