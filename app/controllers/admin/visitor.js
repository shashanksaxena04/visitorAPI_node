const { response } = require('express');
const {check,validationResult, body} = require('express-validator');
const getfunction = require('./getfunction.js');
var moment = require('moment');
const md5=require('md5');
const DB = require('../../config/db');


exports.getVisitorList=(req,res,next)=>{

    var page = req.query.page ?req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
    console.log(req.query.search_value);
    var searc = req.query.search_value
    
    
    //  console.log("SELECT visitor_detail.*,guard.name as guard_name,visitor.name as visitor_name,visitor.mobile as visitor_mobile_no,visitor.address as visitor_address ,users.name as entity_name FROM visitor_detail LEFT JOIN visitor on visitor.id=visitor_detail.visitor_id LEFT JOIN guard on guard.id=visitor_detail.guard_id LEFT JOIN users on users.id = visitor_detail.entity_id WHERE visitor_detail.entity_id="+req.query.entity_id+" AND visitor.name LIKE '%"+searc+"%' ORDER BY id desc LIMIT "+limit)
    DB.GetQuery("SELECT visitor_detail.*,guard.name as guard_name,visitor.name as visitor_name,visitor.mobile as visitor_mobile_no,visitor.address as visitor_address ,users.name as entity_name FROM visitor_detail LEFT JOIN visitor on visitor.id=visitor_detail.visitor_id LEFT JOIN guard on guard.id=visitor_detail.guard_id LEFT JOIN users on users.id = visitor_detail.entity_id WHERE visitor_detail.entity_id="+req.query.entity_id+" AND visitor_detail.status !='2' AND visitor.name LIKE '%"+searc+"%' ORDER BY id desc LIMIT "+limit) 

    .then(result => {
        if(result.length !==0){
            var table_result = result
            DB.GetResult(TBL_VISITOR_DETAIL).then(result => {

                return res.status(200).json({code: 200,status:'success',message:'Record Found',count:result.length,data:table_result})
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
             })
        }else{
            return res.status(200).json({code: 200,status:'fail',message:'No Record Found',data:result})
        }
    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })


}
