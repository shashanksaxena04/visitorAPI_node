const DB = require('./../../../config/db');

module.exports = {
    getProductData : function(req,where = '') { 
        return new Promise((resolve, reject) => {
             DB.GetQuery("SELECT p.id,p.category_id,p.product_name,p.product_mrp,p.product_sp,p.product_qty,p.product_detail,p.product_type,p.product_size,p.product_color,p.product_highlight,CONCAT('"+file_base_url+"products/',p.product_image) as product_image, (SELECT count(*) FROM "+TBL_MAPP_CART+" WHERE `merchant_id`="+req.merchant_id+" AND user_id ="+req.user_id+" AND product_id =p.id) as is_cart  FROM "+TBL_MAPP_PRODUCT+" as p WHERE p.merchant_id ="+req.merchant_id+" "+where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },
    getProductGalleryData: function(req,product_id) { 
        return new Promise((resolve, reject) => {
            DB.GetQuery("SELECT CONCAT('"+file_base_url+"product_gallery/',image) as image FROM mapp_product_gallery WHERE product_id = "+product_id).then(result => {
                    resolve(result)
            }).catch(err => {
               reject(err)
            })
        })
    },
    getCategoryData : function(req,where = '') {
        return new Promise((resolve, reject) => {
            DB.GetQuery("SELECT (SELECT count(*) FROM "+TBL_MAPP_PRODUCT+" as p where p.category_id = c.id) as product_count,c.id,c.category_title,CONCAT('"+file_base_url+"category/',c.category_image) as category_image FROM  "+TBL_MAPP_CATEGORY+" as c WHERE c.merchant_id="+req.merchant_id+" "+where+"  HAVING product_count > 0").then(result => {
                    resolve(result)
            }).catch(err => {
               reject(err)
            })
        })
    },
    getSliderData : function(req,where = '') {
        return new Promise((resolve, reject) => {
            DB.GetQuery("SELECT *,CONCAT('"+file_base_url+"slider/',slider_image) as slider_image FROM "+TBL_MAPP_SLIDER+" WHERE `merchant_id`="+req.merchant_id+" "+where).then(result => {
                    resolve(result)
            }).catch(err => {
               reject(err)
            })
        })
    },
    addCart : function(req) {
        return new Promise((resolve, reject) => {
            var data = {
                user_id : req.user_id,
                merchant_id : req.merchant_id,
                product_id : req.body.product_id,
                quantity : 1
            }
            console.log(data)
            DB.GetQuery("SELECT * FROM "+TBL_MAPP_CART+" WHERE `merchant_id`="+req.merchant_id+" AND user_id ="+req.user_id+" AND product_id ="+req.body.product_id).then(result => {
           
                if(result.length !==0) {
                   
                } else {
                
                     resolve('re')
                    DB.InsertData(TBL_MAPP_CART,data).then(result => {
                            resolve(result)
                    }).catch(err => {
                       reject(err)
                    })
                }
            }).catch(err => {
               reject(err)
            })
        })
    },
    updateCart : function(req) {
        return new Promise((resolve, reject) => {
            var data = {
                quantity : req.body.quantity
            }
            var where = {
                user_id : req.user_id,
                merchant_id : req.merchant_id,
                product_id : req.body.product_id,
            }
            DB.UpdateData(TBL_MAPP_CART,data,where).then(result => {
                    resolve(this.getCartList(req))
            }).catch(err => {
               reject(err)
            })
        })
    },
    getCartList: function(req,where = '') {
        return new Promise((resolve, reject) => {
            DB.GetQuery("SELECT c.*, p.* FROM "+TBL_MAPP_CART+" as c LEFT JOIN "+TBL_MAPP_PRODUCT+" as p ON p.`id` = c.`product_id` WHERE c.`merchant_id`="+req.merchant_id+" AND c.`user_id` ="+req.user_id+"  "+where).then(result => {
                this.getCartTotal(result).then(cart_result => {
                    resolve({result:result,
                    cartDetail:[
                        {key : 'Discount' , value : '₹ 0'},
                         {key : 'Delivery Charges' , value : 'FREE'},
                        {key : 'Amount Payable' , value : '₹ ' +cart_result}
                        ]})
                    
                })
            }).catch(err => {
               reject(err)
            })
        })
    }, 
     deleteCartItem : function(req) {
        return new Promise((resolve, reject) => {
            var where = {
                cart_id : req.body.cart_id,
            }
            DB.DeleteData(TBL_MAPP_CART,where).then(result => {
                     resolve(this.getCartList(req))
            }).catch(err => {
               reject(err)
            })
        })
    },
    getCartTotal: function(result) {
        return new Promise((resolve, reject) => {
          var cartTotal= 0;
          result.forEach(function(value, index, arry){
            cartTotal += value.product_sp*value.quantity;
          });
          resolve(cartTotal)
        })
    }
}

 
