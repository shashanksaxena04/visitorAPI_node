const DB = require('./../../../config/db');

module.exports = {
    getData : function(req) {
        return new Promise((resolve, reject) => {
             DB.GetQuery(function(result){
                    resolve(result)
             },"SELECT id,category_title,CONCAT('"+file_base_url+"category/',category_image) as category_image FROM `mapp_category` WHERE `merchant_id`='"+req.merchant_id+"'")
        })
    }
}