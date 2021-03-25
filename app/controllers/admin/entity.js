const { response } = require('express');
const {check,validationResult, body} = require('express-validator');
const DB = require('../../config/db');
const getfunction = require('./getfunction.js');
var moment = require('moment');
const md5=require('md5');
const { GetQuery } = require('../../config/db');


exports.addEntity=(req,res,next)=>{
     var body = req.body;
     var data = {
        name:body.name,
        email:body.email,
        password: md5(body.password),
        mobile: body.mobile,
        address: body.address,
        aggrement: body.agreement,
        package_id: body.package_id,
        user_type: 1,
        notification: body.notification,
        // guard_id:body.guard,
        // employee_id:body.employee

    }
    DB.GetRow(TBL_USERS,{email:body.email}).then(result => {

        if(result){
            return res.status(200).json({code: 200,status:'fail',message:'Entity already added'})
        }else{
            DB.GetRow(TBL_PACKAGE,{id:body.package_id}).then(result => {
                console.log(result)
              
        
               var currentDate = moment();
           
               if(result.duration == 0){
               //monthly
                   var futureMonth = moment(currentDate).add(1, 'M');  
               }else if(result.duration == 1){
               //quartely
               var futureMonth = moment(currentDate).add(3, 'M');
               }else if(result.duration == 2){
               //six monthly
               var futureMonth = moment(currentDate).add(6, 'M');
               }else if(result.duration == 3){
               //annually
               var futureMonth = moment(currentDate).add(12, 'M');
               }
       
                 
               var futureMonthEnd = moment(futureMonth).endOf('month');
       
               if(currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
                   futureMonth = futureMonth.add(1, 'd');
               }
       
               console.log(currentDate)
               console.log(futureMonth)
       
               DB.InsertData(TBL_USERS,data).then(result => {
       var entity_id = result.insertId
                   entity_data={
                       package_id:body.package_id,
                       entity_id:result.insertId,
                    //    start_date:currentDate.format('yyyy-MM-DD hh:mm:ss'),
                    //    end_date:futureMonth.format('yyyy-MM-DD hh:mm:ss')
                       end_date:moment(body.trial_date).format('yyyy-MM-DD hh:mm:ss'),
                       status:2
                    
                   }
          
                   DB.InsertData(TBL_ENTITY_PACKAGE,entity_data).then(result => {
                     
                     var d = {
                        current_package_detail_id: result.insertId
                     }
                        DB.UpdateData(TBL_USERS,d,{id:entity_id}).then(result => {

                            if(result){
                                return res.json({code: 200,status:'success',message : "Entity Added Successfully",data:result})
                            }else{
                                return res.status(200).json({code: 200,status:'fail',message:'Failed To Add Entity',data:result})
                            }
                        }).catch(err => {
                            return res.status(400).json({status:'fail',message: err.message})
                         })

                   }).catch(err => {
                       return res.status(400).json({status:'fail',message: err.message})
                    })
           
               }).catch(err => {
                   return res.status(400).json({status:'fail',message: err.message})
                })
       
       
       
           }).catch(err => {
                   return res.status(400).json({status:'fail',message: err.message})
                }) 
        }

    }).catch(err=>{
        return res.status(400).json({status:'fail',message: err.message}) 
    })

}

exports.getEntity=(req,res,next)=>{

    var where ='';
     DB.GetResult(TBL_USERS, where).then(result => {
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

 exports.updateEntity=(req,res,next)=>{
    var body = req.body;
    console.log(body)
    var data = { 
        name:body.name,
        email:body.email,
        password: body.password,
        mobile: body.mobile,
        address: body.address,
        aggrement: body.agreement,
        package_id: body.package_id,
        notification: body.notification,
        guard_id:body.guard,
        employee_id:body.employee
        
    }
        DB.UpdateData(TBL_USERS,data, {id:req.params.id}).then(result => {
            DB.GetRow(TBL_USERS,{id:req.params.id}).then(get_result=>{
                var updated_end_date =   body.trial_date 
          
                DB.UpdateData(TBL_ENTITY_PACKAGE,{end_date:updated_end_date}, {id:get_result.current_package_detail_id}).then(result => {
                    if(result){
                  
                        return res.status(200).json({code: 200,status:'success',message:'Record Updated Successfully'})
                    }else{
                        return res.status(200).json({code: 200,status:'fail',message:'Updation Failed'})
                    }
                }).catch(err => {
                    return res.status(400).json({code: 400,status:'fail',message: err.message})
                 })
                
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
             })
              
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
             })
    
    }

exports.deleteEntity=(req,res,next)=>{
  var body = req.body;
        DB.DeleteData(TBL_USERS,{id:body.id}).then(result => {
                if(result){
                    return res.status(200).json({code: 200,status:'success',message:'Record Deleted Successfully'})
                }else{
                    return res.status(200).json({code: 200,status:'fail',message:'Failed To Delete Record'})
                }
        
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
            })
    
    }


exports.entityList=(req,res,next)=>{
  var m =   moment().format('YYYY-MM-DD hh:mm:ss');
           console.log(m)
    var page = req.query.page ? req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = " LIMIT "+skip + ',' + numPerPage;

    var condition =" WHERE user_type='1'"
    if(req.query.search_value ==undefined || req.query.search_value ===" " || req.query.search_value ==null ){
   
        var searc =  '' ; 
            }else{
            var searc = req.query.search_value;
            }
 

    DB.GetQuery("SELECT u.*,p.name as packagename FROM users as u LEFT JOIN package as p ON p.`id` = u.`package_id` WHERE user_type='1' AND u.name LIKE '%"+searc+"%' "+limit)
    .then(result => {
        if(result.length !==0){
            var table_result = result
            DB.GetResult(TBL_USERS,{user_type:1}).then(result => {

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
    
exports.getEntityById=(req,res,next)=>{
console.log("SELECT u.* MAX(ep.end_date) as end_date FROM users as u LEFT JOIN entity_package as ep ON u.package_id=ep.package_id WHERE ep.entity_id="+req.params.id)
    DB.GetQuery("SELECT u.*,ep.end_date as end_date FROM users as u LEFT JOIN entity_package as ep ON u.current_package_detail_id=ep.id WHERE ep.entity_id="+req.params.id)
   // DB.GetRow(TBL_USERS, {id:req.params.id} )
    .then(result => {
        if(result){
            return res.status(200).json({code: 200,status:'success',message:'Record Found',data:result[0]})
        }else{
           return res.status(200).json({code: 200,status:'fail',message:'No Record Found',data:result[0]}); 
        }
        
    }).catch(err => {
        return res.status(400).json({code: 400,status:'fail',message: err.message})
        })


}


exports.getAll=(req,res,next)=>{

    getfunction.getPackage(req).then(packageResult => {
        getfunction.getGuard(req).then(guardResult => {
            getfunction.getEmployee(req).then(employeeResult => {
                var data = {
                    package : packageResult,
                    guard : guardResult,
                    employee : employeeResult
                }
                 if(data){
                    return res.status(200).json({code:200, status:'success',message:'Record Found', data : data});
                 }else{
                    return res.status(200).json({code: 200,status:'fail',message:'No Record Found',data:result});
                 }
               
            }).catch(err => {
                   return res.status(400).json({code:400,status:'fail',message:err.message});
            });

        }).catch(err => {
               return res.status(400).json({code:400,status:'fail',message:err.message});
        });

    }).catch(err => {
           return res.status(400).json({code:400,status:'fail',message:err.message});
    });


}

exports.getDashboardCount=(req,res,next)=>{
console.log("SELECT count(id) as entity_count FROM "+TBL_USERS+" WHERE user_type=1")
    DB.GetQuery("SELECT COUNT(id) as entity_count FROM "+TBL_USERS+" WHERE user_type=1")
    .then(entity_result=>{

        DB.GetQuery("SELECT COUNT(id) as package_count FROM "+TBL_PACKAGE)
        .then(package_result=>{
            var result={
                entity_count:entity_result[0].entity_count ? entity_result[0].entity_count : 0,
                package_count:package_result[0].package_count ? package_result[0].package_count :0
            }
    return res.status(200).json({code:200, status:'success',message:'Record Found', data : result});
        }).catch(err => {
           return res.status(400).json({code:400,status:'fail',message:err.message});
       });
       
    }).catch(err => {
           return res.status(400).json({code:400,status:'fail',message:err.message});
    });


}

