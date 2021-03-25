const { response } = require('express');
const {check,validationResult, body} = require('express-validator');
const DB = require('../../config/db');
var moment = require('moment');
const md5=require('md5');
const getfunction = require('./getfunction.js');
var Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_YIdyHcpdnfh9mm',
    key_secret: 'SxMPb0Hr0uqJqHvQU14bQYia'
  });

  let RazorpayConfig={
    key_id: 'rzp_test_YIdyHcpdnfh9mm',
    key_secret: 'SxMPb0Hr0uqJqHvQU14bQYia'
  }



exports.addPackage=(req,res,next)=>{
    var body = req.body;
    var data = {
        name:body.name,
        amount:body.amount,
        duration: body.duration
    }

    DB.InsertData(TBL_PACKAGE,data).then(result => {
        if(result){
            return res.json({code: 200,status:'success',message : "Package Added Successfully"})
        }else{
            return res.status(200).json({code: 200,status:'fail',message:'Failed To Add Package',data:result})
        }
    }).catch(err => {
        return res.status(400).json({status:'fail',message: err.message})
     })

}


exports.getPackage=(req,res,next)=>{

   var where ='';
    DB.GetResult(TBL_PACKAGE, where).then(result => {
    // DB.GetQuery("SELECT * FROM "+TBL_PACKAGE).then(result => {
        if(result.length !==0){
            return res.status(200).json({code: 200,status:'success',message:'Record Found',data:result})
        }else{
            return res.status(200).json({code: 200,status:'fail',message:'Record Not Found',data:result})
        }

    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })

}


exports.updatePackage=(req,res,next)=>{
var body = req.body;
    var data = {
        name:body.name,
        amount:body.amount,
        duration: body.duration
    }
    
    DB.UpdateData(TBL_PACKAGE,data, {id:body.id}).then(result => {
        // DB.GetQuery("SELECT * FROM "+TBL_PACKAGE).then(result => {
            if(result){
                return res.status(200).json({code: 200,status:'success',message:'Record Updated Successfully'})
            }else{
                return res.status(200).json({code: 200,status:'fail',message:'Updation Failed'})
            }
    
        }).catch(err => {
            return res.status(400).json({code: 400,status:'fail',message: err.message})
         })

}


exports.deletePackage=(req,res,next)=>{
   var body = req.body;
   
        DB.DeleteData(TBL_PACKAGE,{id:body.id}).then(result => {
                if(result){
                    return res.status(200).json({code: 200,status:'success',message:'Record Deleted Successfully'})
                }else{
                    return res.status(200).json({code: 200,status:'fail',message:'Failed To Delete Record'})
                }
        
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
             })
    
    }


exports.packageList=(req,res,next)=>{


    var page = req.query.page ?req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
    console.log(req.query.search_value);
    if(req.query.search_value ==undefined || req.query.search_value ===" " || req.query.search_value ==null ){
    
        var where =  '' ; 
            }else{
         var where = " WHERE name LIKE '%"+req.query.search_value+"%'";
            }

console.log("SELECT * FROM "+TBL_PACKAGE+ where +" LIMIT "+limit)
    DB.GetQuery("SELECT * FROM "+TBL_PACKAGE+ where +" LIMIT "+limit)
    .then(result => {
        if(result.length !==0){
            var table_result = result
            DB.GetResult(TBL_PACKAGE).then(result => {

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

exports.getPackageById=(req,res,next)=>{

    DB.GetRow(TBL_PACKAGE, {id:req.params.id} ).then(result => {
        if(result){
            return res.status(200).json({code: 200,status:'success',message:'Record Found',data:result})
        }else{
            return res.status(200).json({code: 200,status:'fail',message:'No Record Found',data:result})
        }
      
    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })


}

exports.checkPackageExpiration=(req,res,next)=>{

    var body = req.query;
   console.log(body)
    DB.GetQuery("SELECT * FROM entity_package WHERE package_id="+body.package_id+" AND entity_id="+body.entity_id+" ORDER BY id DESC ")
    .then(result=>{
        DB.GetQuery("SELECT * FROM guard WHERE entity_id="+body.entity_id)
        .then(guard_result=>{

            DB.GetQuery("SELECT * FROM employee WHERE entity_id="+body.entity_id)
            .then(employee_result=>{

                if(new Date(result[0].end_date) > new Date() == true){
                    var package_expiration = 1
                }else{
                    var package_expiration = 0
                }
              var data = {
                  package_expiration : package_expiration,
                  guard_length:guard_result.length,
                  employee_length:employee_result.length,
              }

              return res.status(200).json({code: 200,status:'success',message:'package not expired', data:data})
            }).catch(err => {
            return res.status(400).json({code: 400,status:'fail',message: err.message})
            })    

        }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
        })



        //   if(new Date(result[0].end_date) > new Date()){
        //     return res.status(200).json({code: 200,status:'success',message:'package not expired'})
        //   }else{
        //     return res.status(200).json({code: 200,status:'fail',message:'package expired'})
        //   }
    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })
}



exports.currentPackage=(req,res,next)=>{

    var body = req.query;
    
    getfunction.getCurrentPackage(body)
    .then(entity_result=>{
        var p_data = {
            current_package:entity_result[0],  
        }
console.log(entity_result)
    DB.GetQuery("SELECT * FROM "+TBL_PACKAGE)
    .then(result => {
        if(result){
            p_data.package_list = result
            return res.status(200).json({code: 200,status:'success',message:'Record Found', data:p_data})
        }else{
            return res.status(200).json({code: 200,status:'success',message:'No Record Found', data:p_data})
        }
    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })
    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })

}


exports.purchase=(req,res,next)=>{

    var body = req.body

    getfunction.getUser({id:body.entity_id})
    .then(result=>{
        if(result){
            var options = {
                currency: "INR",
                amount:body.amount*100,
                receipt: result.email,
                payment_capture: '0'
    
            }

            instance.orders.create(options, function (razor_error, order) {
    
                if(razor_error){
                    console.log('error')
                    console.log(razor_error)
                     res.status(400).json({
                        message: razor_error.message,
                        payload: null,
                        error: "razor pay order creation unsuccessful"
                    });
                }else{
                
                    console.log(order)
                    let report = {};
                    report.order = order;
                    report.amount = body.amount;
                    report.entity_id = body.entity_id;
                    report.package_name = body.name;
                   // report.plan_expire = data.plan_expire
                    report.package_id = body.id
                    report.key = RazorpayConfig.key_id;

                    return res.status(200).json({code: 200,status:'success',message:'Successfully Added',key: RazorpayConfig.key_id, response: report })
                 
                }
    
            })
        }else{
            return res.json({code: 200,status:'fail',message:'User Not Found'})
        }

    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })
    
   console.log(body)
      
}


exports.payment=(req,res,next)=>{
   
    var body = req.body;
    var entity_id = body.entity_id;
    var amount_payed = body.amount_payed;
    var order_id = body.order_id;
    var package_id = body.package_id;

    console.log(body)
    DB.GetRow(TBL_USERS,{id:entity_id})
    .then(result=>{

        DB.GetRow(TBL_PACKAGE, {id:package_id})
        .then(package_result=>{

            var currentDate = moment();
           
            if(package_result.duration == 0){
            //monthly
                var futureMonth = moment(currentDate).add(1, 'M');  
            }else if(package_result.duration == 1){
            //quartely
            var futureMonth = moment(currentDate).add(3, 'M');
            }else if(package_result.duration == 2){
            //six monthly
            var futureMonth = moment(currentDate).add(6, 'M');
            }else if(package_result.duration == 3){
            //annually
            var futureMonth = moment(currentDate).add(12, 'M');
            }
    
              
            var futureMonthEnd = moment(futureMonth).endOf('month');
    
            if(currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
                futureMonth = futureMonth.add(1, 'd');
            }
    
            console.log(currentDate)
            console.log(futureMonth)    

        var current_package_detail = result.current_package_detail_id
        if(result.package_id == package_id){

            DB.GetRow(TBL_ENTITY_PACKAGE,{id:current_package_detail})
            .then(c_result=>{

                if(c_result.status == 2){
                    var data = {
                        order_id:order_id,
                        start_date:currentDate.format('yyyy-MM-DD hh:mm:ss'),
                        end_date:futureMonth.format('yyyy-MM-DD hh:mm:ss'),
                        status:'1',
                        payment_status:'1',
                        amount_payed :amount_payed,
                    }
                    DB.UpdateData(TBL_ENTITY_PACKAGE,data,{id:current_package_detail})
                    .then(result=>{
        
                    if(result){
                        return res.status(200).json({code: 200,status:'success',message:'Payment Done Successfully'})
                    }else{
                        return res.status(200).json({code: 200,status:'fail',message:'Payment Failed'}) 
                    }
                }).catch(err => {
                    return res.status(400).json({code: 400,status:'fail',message: err.message})
                    })
                }else if(c_result.status == 0 || c_result.status == 1){
                    var insert_data = {
                        order_id:order_id,
                        start_date:currentDate.format('yyyy-MM-DD hh:mm:ss'),
                        end_date:futureMonth.format('yyyy-MM-DD hh:mm:ss'),
                        status:'1',
                        payment_status:'1',
                        amount_payed :amount_payed,
                        package_id:package_id,
                        entity_id:entity_id,
                    }
                      DB.InsertData(TBL_ENTITY_PACKAGE,insert_data)
                      .then(result=>{
        
                        var d = {
                            current_package_detail_id: result.insertId,
                            package_id:package_id
                         }
                        DB.UpdateData(TBL_USERS,d,{id:entity_id})
                        .then(result=>{
                            if(result){
                                return res.status(200).json({code: 200,status:'success',message:'Payment Done Successfully'})
                            }else{
                                return res.status(200).json({code: 200,status:'fail',message:'Payment Failed'}) 
                            }
                           
                        }).catch(err => {
                        return res.status(400).json({code: 400,status:'fail',message: err.message})
                        })
        
                      }).catch(err => {
                        return res.status(400).json({code: 400,status:'fail',message: err.message})
                        })
                }else{
                    return res.status(200).json({code: 200,status:'fail',message:' package is not expired'})
                }

            }).catch(err => {
            return res.status(400).json({code: 400,status:'fail',message: err.message})
            })

        }else{

            var insert_data = {
                order_id:order_id,
                start_date:currentDate.format('yyyy-MM-DD hh:mm:ss'),
                end_date:futureMonth.format('yyyy-MM-DD hh:mm:ss'),
                status:'1',
                payment_status:'1',
                amount_payed :amount_payed,
                package_id:package_id,
                entity_id:entity_id,
            }
              DB.InsertData(TBL_ENTITY_PACKAGE,insert_data)
              .then(result=>{

                var d = {
                    current_package_detail_id: result.insertId,
                    package_id:package_id
                 }
                DB.UpdateData(TBL_USERS,d,{id:entity_id})
                .then(result=>{
                    if(result){
                        return res.status(200).json({code: 200,status:'success',message:'Payment Done Successfully'})
                    }else{
                        return res.status(200).json({code: 200,status:'fail',message:'Payment Failed'}) 
                    }
                   
                }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
                })

              }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
                })

        }

        }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
        })
    

    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })

}

exports.changeStatus=(req,res,next)=>{
  //  currentDate.format('yyyy-MM-DD hh:mm:ss'),
  

  var where = " WHERE end_date < '"+ moment().format('yyyy-MM-DD hh:mm:ss')+"'"

  DB.GetQuery("UPDATE entity_package SET status='0'"+ where)
  .then(result=>{
    //  console.log(result)
      if(result){
        return res.status(200).json({code: 200,status:'success',message:'Status changed successfully'}) 
      }else{
        return res.status(200).json({code: 200,status:'fail',message:'Failed to change status'}) 
      }

   
}).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
     })
}







