const DB = require('./../../../config/db');
const getfunction = require('./getfunction');
const {check,validationResult} = require('express-validator');


 
exports.productDetail=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
            var where = ' AND id = ' +req.params.product_id;
            getfunction.getProductData(req,where).then(result => {
                var data={};
                if(result) {
                    getfunction.getProductGalleryData(req,result[0].id).then(gallery_result => {
                            data.id=result[0].id;
                            data.category_id=result[0].category_id;
                            data.product_name=result[0].product_name;
                            data.product_mrp=result[0].product_mrp;
                            data.product_sp=result[0].product_sp;
                            data.product_qty=result[0].product_qty;
                            data.product_detail=result[0].product_detail;
                            data.product_type=result[0].product_type;
                            data.product_image=result[0].product_image;
                            data.product_size=result[0].product_size;
                            data.product_color=result[0].product_color;
                            data.product_highlight=result[0].product_highlight;
                            data.is_cart=result[0].is_cart;
                            data.product_gallery=gallery_result;
                            return res.status(200).json({status:'success',message:'Record Found',data:data});
                    }).catch(err => {
            	       	 return res.status(400).json({status:'fail',message:err.message});
            		});
                } else {
                  return res.status(400).json({status:'fail',message:'Record  Not Found'})
                }
            }).catch(err => {
    	       	 return res.status(400).json({status:'fail',message:err.message});
    		});
    }else{
        return res.json({status:'fail',errors:errors.mapped()});
    }
}


exports.productByCategoryID=(req,res,next)=>{
     const errors = validationResult(req);
    if (errors.isEmpty()) {
            var where = ' AND category_id = ' +req.params.category_id;
            var category_where = ' AND id = ' +req.params.category_id;
            getfunction.getCategoryData(req,category_where).then(category_result => {
                getfunction.getProductData(req,where).then(product_result => {
                    if(product_result) {
                        var data = {
                            category : category_result[0],
                            product : product_result
                        }
                        return res.status(200).json({status:'success',message:'Record Found',data:data});
                    } else {
                      return res.status(400).json({status:'fail',message:'Record  Not Found'})
                    }
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
