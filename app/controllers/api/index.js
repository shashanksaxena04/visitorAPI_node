const DB = require('./../../config/db');
var moment = require('moment');
const getfunction = require('./getfunction.js');
const FCM = require('fcm-node');
const serverKey ='AAAAXDLoeww:APA91bHkpdzzNN3LJioG74LRtALcMsrilK8rwnvn79fQgKYQA11YQhKwp0xrkPQRuzZA65ZbptUFTMp8xUczeh8Np0Qv3ohKxL3z7w6Y-Cpbm-cgqqtcf72zUj3GLK_Y7nGTSX1wl9M7'
const fcm = new FCM(serverKey);

exports.guardLogin=(req,res,next)=>{
    
  
    if (req.body.mobile==undefined || req.body.mobile==null ||req.body.mobile=='') {
        return res.json({ code: 200, status: "fail", message:"Please Enter the Mobile"}); 
      
    }else if(req.body.fcm_token==undefined || req.body.fcm_token==null ||req.body.fcm_token==''){
         return res.json({ code: 200, status: "fail", message:"Please Enter the Fcm token"}); 
    }else{
        savedata = {}
        var access_token = randomString(60, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        DB.GetQuery("SELECT * FROM `guard` WHERE `mobile`='"+req.body.mobile+"'").then(results => {
            if (results.length > 0) {

                savedata.access_token = access_token;
				savedata.fcm_token = req.body.fcm_token;

            DB.UpdateData(TBL_GUARD,savedata, {id:results[0].id}).then(result => {
            
                if(result){
                 DB.GetQuery("SELECT * FROM `guard` WHERE `id`="+results[0].id).then(result => {  

                    if(result){
                        return res.json({code: 200,status:'success',message : "Login Successfully",data:result[0]});
                    }else{
                        return res.json({code: 200,status:'fail',message : "No Record Found",data:result});
                    }
                 }).catch(err=>{
                    return res.json({code: 400, status:'fail',message : err.message});
                 })
                }

            }).catch(err=>{
                return res.json({code: 400, status:'fail',message : err.message});
            })


            }else{
                return res.json({code: 200, status:'fail',message : "Mobile not registered"}); 
            }

           

        }).catch(err => {
            return res.json({code: 400, status:'fail',message : err.message});
        })
    }

}



exports.addVisitor=(req,res,next)=>{
    var body = req.body;
    var header = req.header('access-token');
    var data = {
       name:body.name,
       mobile: body.mobile,
       address: body.address,
       image: body.image,
       id_proof: body.id_proof

   }
 
   DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 

  console.log(result);

    if(result.length !==0){
          var entity_id = result[0].entity_id
          var guard_id = result[0].id
     
        DB.InsertData(TBL_VISITOR,data).then(insert_result => {
            if(insert_result){

                DB.GetRow(TBL_VISITOR,{id:insert_result.insertId}).then(get_result=>{
                //    return res.json({code: 200,status:'success',message : "Visitor Added Successfully",data:get_result})
               
                    getfunction.getUser({id:entity_id}).then(userResult => {
               
               
                             v_data ={
                                visitor_id:get_result.id,
                                entity_id:entity_id,
                                guard_id:guard_id
                            }
                            getfunction.insertVisitorDetail(v_data).then(insertResult=>{
                                if(insertResult){
                                    
                            if(userResult.notification == 1){
            
                            getfunction.getEmployee({entity_id:entity_id}).then(employeeResult => {
                                //console.log(employeeResult.fcm)
                                   var token = []
                                   var notify_add = []
                                   var message_to_send = get_result.name+' wants to enter.'
        
                                for(var i=0; i<employeeResult.length; i++){

                                    if(employeeResult[i].fcm_token !==null){
 
                                        var notify_data = {
                                            message:message_to_send,
                                            entity_id:entity_id,
                                            sender_id:guard_id,
                                            receiver_id:employeeResult[i].id,
                                            visitor_id:get_result.id,
                                            title:'Permission Request Notification',
                                            type:'request',
                                            send_by:'1'
                                        }
            
                                           token.push(employeeResult[i].fcm_token)
                                           notify_add.push(notify_data)

                                    }
        
                                    
                                }
        
                              
                                var message = { 
                                    registration_ids: token,
                                    data: { 
                                        title: 'Permission Request Notification',
                                        message: message_to_send,
                                        type : "request",
                                        visitor_id:get_result.id,
                                        entity_id:entity_id,
        
                                    },
                                   
                                    };
                    
                              //  if(employeeResult.length == token.length){
                  
                                    fcm.send(message, function(err, response){
                                         var error = JSON.parse(err)
                                     if (err) {
                                         
                                           if(error.success == 0){
                                           return res.json({code: 200,status:'success',message : "Notification not send",type:0, err:err, data:get_result})
                                                }else{
                                                    
                                                   return res.json({code: 200,status:'success',message : "Visitor Added Successfully, Wait for confirmation from employee",type:1, data:get_result})  
                                                }
                                         
                                        } else {
        
                             
                                           DB.InsertBatch(TBL_NOTIFICATION,notify_add)
                                           .then(final_result=>{
                                              return res.json({code: 200,status:'success',message : "Visitor Added Successfully, Wait for confirmation from employee",type:1, data:get_result})
                                           }).catch(err => {
                                                    return res.json({code:400,status:'fail',message: err.message})
                                                })
        
                                        }
                                    });
        
                               // }
                            }).catch(err => {
                                return res.json({code:400,status:'fail',message: err.message})
                               })
        
                        }else{
                            return res.json({code: 200,status:'success',message : "Visitor Added Successfully, Contact employee for confirmation",type:0,data:get_result})
                            
                        } 
                                    
                                }else{
                                    return res.json({code: 200,status:'fail',message : "Failed to insert visitor record"}) 
                                }
                            }).catch(err=>{
                                 return res.json({code:400,status:'fail',message: err.message})
                            })
               
               
                      
                    }).catch(err => {
                        return res.json({code:400,status:'fail',message: err.message})
                       })
               
                }).catch(err=>{
                    return res.json({code:400,status:'fail',message: err.message})
                })
               

            }else{
                return res.status(200).json({code: 200,status:'fail',message:'Failed To Add Visitor'})
            }
        }).catch(err => {
            return res.status(200).json({code:400,status:'fail',message: err.message})
         })
    }else{
        return res.status(200).json({code:400, status:'fail',message:'Invalid User'})
    }
   }).catch(err => {
    return res.status(200).json({code:400, status:'fail',message: err.message})
   })

}


exports.checkVisitor=(req,res,next)=>{
    var body = req.body;
    var header = req.header('access-token');
//console.log("SELECT * FROM `guard` WHERE `access_token`='"+header+"'")
    DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 
    
 
   if(result.length !==0){
       
        var entity_id = result[0].entity_id
        var guard_id = result[0].id
        
    DB.GetQuery("SELECT * FROM `visitor` WHERE `mobile`='"+body.mobile+"'").then(result => { 

        if(result.length !==0){
          var visitor_id = result[0].id
            getfunction.getUser({id:entity_id}).then(userResult => {
                
                v_data ={
                    visitor_id:visitor_id,
                    entity_id:entity_id,
                    guard_id:guard_id
                }
                getfunction.insertVisitorDetail(v_data).then(insertResult=>{
                    if(insertResult){
                         if(userResult.notification == 1){
    
                    getfunction.getEmployee({entity_id:entity_id}).then(employeeResult => {
                        console.log(employeeResult.fcm)
                           var token = []
                           var notify_add = []
                           var message_to_send = result[0].name+' wants to enter.'

                        for(var i=0; i<employeeResult.length; i++){

                            if(employeeResult[i].fcm_token !==null){

                                var notify_data = {
                                    message:message_to_send,
                                    entity_id:entity_id,
                                    sender_id:guard_id,
                                    receiver_id:employeeResult[i].id,
                                    visitor_id:visitor_id,
                                    title:'Permission Request Notification',
                                    type:'request',
                                    send_by:'1'
                                 }
    
                                   token.push(employeeResult[i].fcm_token)
                                   notify_add.push(notify_data)
                            }
                         
                        }

                      
                        var message = { 
                            registration_ids: token,
                            data: { 
                                title: 'Permission Request Notification',
                                message: message_to_send,
                                type : "request",
                                visitor_id:result[0].id,
                                entity_id:entity_id,

                            },
                           
                            };
            
                       // if(employeeResult.length == token.length){
          
                            fcm.send(message, function(err, response){
                                var error = JSON.parse(err)
                                if (err) {
                                    
                                      if(error.success == 0){
                                          return res.json({code: 200,status:'success',message : "Notification not send",type:0, err:err, data:result[0]})
                                                }else{
                                                    
                                                    return res.json({code: 200,status:'success',message : "Record Found, Wait for confirmation from employee",type:1, data:result[0]})
                                                }
                                    
                                   
                                } else {

                     
                                   DB.InsertBatch(TBL_NOTIFICATION,notify_add)
                                   .then(final_result=>{
                                      return res.json({code: 200,status:'success',message : "Record Found, Wait for confirmation from employee",type:1, data:result[0]})
                                   }).catch(err => {
                                            return res.json({code:400,status:'fail',message: err.message})
                                        })

                                }
                            });

                       // }
                    }).catch(err => {
                        return res.json({code:400,status:'fail',message: err.message})
                       })

                }else{
                    return res.json({code: 200,status:'success',message : "Record Found, Contact employee for confirmation",type:0, data:result[0]})
                }
                    }else{
                       
                         return res.json({code: 200,status:'fail',message : "Failed to insert visitor record"})
                    }
                }).catch(err=>{
                     return res.json({code:400,status:'fail',message: err.message})
                })
               
               
            }).catch(err => {
                return res.json({code:400,status:'fail',message: err.message})
               })

        }else{
            return res.status(200).json({code: 200,status:'fail',message:'Record Not Found'})
        }

        }).catch(err => {
            return res.json({code:400,status:'fail',message: err.message})
         })
    }else{
        return res.json({code:400, status:'fail',message:'Invalid User'})
    }

    }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })

}


exports.InVisitor=(req,res,next)=>{
    var body = req.body;
    var header = req.header('access-token');

    DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 
       
   if(result.length !==0){
  
     var data = {
        in_time:body.in_time,
        status:'0'
    }
        DB.UpdateData(TBL_VISITOR_DETAIL,data,{id:body.id}).then(result => {
            if(result){
                return res.status(200).json({code: 200,status:'success',message:'In time added successfully'})
            }else{
                return res.status(200).json({code: 200,status:'fail',message:'Failed to add In time'})
            }

        }).catch(err => {
            return res.json({code:400,status:'fail',message: err.message})
        })
    }else{
        return res.json({code:400, status:'fail',message:'Invalid User'})
    }

    }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })

}

exports.OutVisitor=(req,res,next)=>{
    var body = req.body;
    var header = req.header('access-token');

    DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 
       
   if(result.length !==0){
    var data = {
        out_time:body.out_time,
        status:'1'
    }
        DB.UpdateData(TBL_VISITOR_DETAIL,data,{id:body.id}).then(result => {
            if(result){
                return res.status(200).json({code: 200,status:'success',message:'Out time added successfully'})
            }else{
                return res.status(200).json({code: 200,status:'fail',message:'Failed to add out time'})
            }

        }).catch(err => {
            return res.json({code:400,status:'fail',message: err.message})
        })
    }else{
        return res.json({code:400, status:'fail',message:'Invalid User'})
    }

    }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })

}


exports.InVisitorList=(req,res,next)=>{

    var page = req.query.page ? req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
      var d = new Date();
     console.log(d.setHours(0,0,0,0));
     console.log(moment(d.setHours(0,0,0,0)).format('yyyy-MM-DD hh:mm:ss'))
     
     var startdate = moment();
     startdate = startdate.subtract(1, "days");
      var s =  startdate.endOf('day').format('yyyy-MM-DD HH:mm:ss')
      
     var start_day = moment().startOf('day').format('yyyy-MM-DD hh:mm:ss')
     var header = req.header('access-token');

     DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 
        if(result.length !==0){
            DB.GetQuery("SELECT vd.*,v.name as visitor_name,v.image as visitor_image, v.mobile as visitor_mobile,v.address as visitor_address FROM visitor_detail as vd LEFT JOIN visitor as v ON v.`id` = vd.`visitor_id` WHERE vd.entity_id="+req.query.entity_id+" AND (vd.status='0' OR vd.status='2') AND vd.created_at >'"+s+"' ORDER BY vd.created_at DESC   LIMIT "+limit)
            .then(result=>{
    //   console.log("SELECT * FROM visitor_detail WHERE entity_id="+req.query.entity_id+" AND (status='0' OR status='2') AND created_at >'"+s+"'")
                   DB.GetQuery("SELECT * FROM visitor_detail WHERE entity_id="+req.query.entity_id+" AND (status='0' OR status='2') AND created_at >'"+s+"'")
                   .then(result_count=>{
                       console.log(result_count)
                       if(result.length !==0){
                           return res.status(200).json({code: 200,status:'success',message:'Record Found',count:result_count.length, data:result})
                       }else{
                           return res.status(200).json({code: 200,status:'fail',message:'No Record Found',count:result_count.length, data:result})
                       }
                      
                   }).catch(err => {
                       return res.json({code:400,status:'fail',message: err.message})
                   })
               
       
            }).catch(err => {
               return res.json({code:400,status:'fail',message: err.message})
              })
        }else{
            return res.json({code:400, status:'fail',message:'Invalid User'})  
        }

     }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })

}

exports.OutVisitorList=(req,res,next)=>{

    var page = req.query.page ? req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
    
     var startdate = moment();
     startdate = startdate.subtract(1, "days");
      var s =  startdate.endOf('day').format('yyyy-MM-DD HH:mm:ss')
  
     var start_day = moment().startOf('day').format('yyyy-MM-DD hh:mm:ss')
  
     var header = req.header('access-token');

     DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 
 
//  console.log("SELECT vd.*,v.name as visitor_name,v.image as visitor_image, v.mobile as visitor_mobile,v.address as visitor_address FROM visitor_detail as vd LEFT JOIN visitor as v ON v.`id` = vd.`visitor_id` WHERE vd.entity_id="+req.query.entity_id+" AND vd.status='1' AND vd.created_at >'"+s+"' ORDER BY vd.updated_at DESC LIMIT "+limit)
 
        if(result.length !==0){
            DB.GetQuery("SELECT vd.*,v.name as visitor_name,v.image as visitor_image, v.mobile as visitor_mobile,v.address as visitor_address FROM visitor_detail as vd LEFT JOIN visitor as v ON v.`id` = vd.`visitor_id` WHERE vd.entity_id="+req.query.entity_id+" AND vd.status='1' AND vd.created_at >'"+s+"' ORDER BY vd.updated_at DESC LIMIT "+limit)
            .then(result=>{
       
                   DB.GetQuery("SELECT * FROM visitor_detail WHERE entity_id="+req.query.entity_id+" AND status='1' AND created_at >'"+s+"'")
                   .then(result_count=>{
                       if(result.length !==0){
                           return res.status(200).json({code: 200,status:'success',message:'Record Found',count:result_count.length, data:result})
                       }else{
                           return res.status(200).json({code: 200,status:'fail',message:'No Record Found',count:result_count.length, data:result})
                       }
                      
                   }).catch(err => {
                       return res.json({code:400,status:'fail',message: err.message})
                   })
               
       
            }).catch(err => {
               return res.json({code:400,status:'fail',message: err.message})
              })
        }else{
            return res.json({code:400, status:'fail',message:'Invalid User'})   
        }

     }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
    })

}



exports.employeeLogin=(req,res,next)=>{
    
  
    if (req.body.mobile==undefined || req.body.mobile==null ||req.body.mobile=='') {
        return res.json({ code: 200, status: "fail", message:"Please Enter the Mobile"}); 
      
    }else if(req.body.fcm_token==undefined || req.body.fcm_token==null ||req.body.fcm_token==''){
         return res.json({ code: 200, status: "fail", message:"Please Enter the Fcm token"}); 
    }else{
        savedata = {}
        var access_token = randomString(60, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        DB.GetQuery("SELECT * FROM `employee` WHERE `mobile`='"+req.body.mobile+"'").then(results => {
            if (results.length > 0) {

                savedata.access_token = access_token;
				savedata.fcm_token = req.body.fcm_token;

            DB.UpdateData(TBL_EMPLOYEE,savedata, {id:results[0].id}).then(result => {
                if(result){
                 DB.GetQuery("SELECT * FROM `employee` WHERE `id`="+results[0].id).then(result => {  

                    if(result){
                        return res.json({code: 200,status:'success',message : "Login Successfully",data:result[0]});
                    }else{
                        return res.json({code: 200,status:'fail',message : "No Record Found",data:result});
                    }
                 }).catch(err=>{
                    return res.json({code: 400, status:'fail',message : err.message});
                 })
                }

            }).catch(err=>{
                return res.json({code: 400, status:'fail',message : err.message});
            })


            }else{
                return res.json({code: 200, status:'fail',message : "Mobile not registered"}); 
            }

           

        }).catch(err => {
            return res.json({code: 400, status:'fail',message : err.message});
        })
    }

}



exports.permission=(req,res,next)=>{
    var body = req.body;
    var header = req.header('access-token');

    DB.GetQuery("SELECT * FROM `employee` WHERE `access_token`='"+header+"'").then(result => { 
     
        if(result.length !==0){
            
               var entity_id = result[0].entity_id
               var employee_id = result[0].id

            getfunction.getVisitor({id:body.visitor_id}).then(visitorResult => {
                 
                if(visitorResult){
                        
                    getfunction.getGuard({entity_id:entity_id}).then(guardResult => {
                      console.log(guardResult);
                        var token = []
                        var notify_add = []
                        if(body.enter == 0){
                            var message_to_send = 'Allow '+visitorResult.name+' to enter.'
                        }else{
                            var message_to_send = 'Deny '+visitorResult.name+' to enter.'
                        }
                       

                     for(var i=0; i<guardResult.length; i++){

                        if(guardResult[i].fcm_token !==null){

                            var notify_data = {
                                message:message_to_send,
                                entity_id:entity_id,
                                sender_id:employee_id,
                                receiver_id:guardResult[i].id,
                                visitor_id:body.visitor_id,
                                title:'Permission Response Notification',
                                type:'response',
                                send_by:'0'
                            }
   
                               token.push(guardResult[i].fcm_token)
                               notify_add.push(notify_data)
                        }

                         
                     }

                   
                     var message = { 
                         registration_ids: token,
                         data: { 
                             title: 'Permission Response Notification',
                             message: message_to_send,
                             type : "response",
                             visitor_id:body.visitor_id,
                             entity_id:entity_id,

                         },
                        
                         };
                         
                        //   DB.GetRow(TBL_USERS,{id:entity_id})
                        //   .then(entity_result=>{
                        //       var set_p = {}
                        //       var enter = req.body.enter;
                        //       if(enter == 0){
                        //          set_p.permission_status:0 
                        //       }else{
                        //          set_p.permission_status:1 
                        //       }
                        //       var where = {
                        //           visitor_id:body.visitor_id,
                        //           in_time:'00:00:00',
                        //           out_time:'00:00:00'
                        //       }
                        //       if(entity_result.notification == '1'){
                                 
                        //      getfunction.setPermission(set_p, where).then(setResult => {
                                 
                        //      }).catch(err=>{
                                 
                        //      })
                                  
                        //       }else{
                                  
                        //      getfunction.setPermission(set_p, where).then(setResult => {
                                 
                        //      }).catch(err=>{
                                 
                        //      })  
                                  
                        //       }
                        //   }).catch(err=>{
                        //         return res.json({code:400,status:'fail',message: err.message})
                        //   })
       
       
       
       
       
                         fcm.send(message, function(err, response){
                              var error = JSON.parse(err)
                             
                                if (err) {
                                    
                                    if(error.success == 0){
                                          return res.json({code: 200,status:'fail',message : "Failed to send notification", err:err })
                                    }else{
                                         return res.json({code: 200,status:'success',message : "Notification send successfully"})
                                    }
                            
                               
                             } else {

                  
                                DB.InsertBatch(TBL_NOTIFICATION,notify_add)
                                .then(final_result=>{
                                   return res.json({code: 200,status:'success',message : "Notification send successfully"})
                                }).catch(err => {
                                         return res.json({code:400,status:'fail',message: err.message})
                                     })

                             }
                         });

                     
                 }).catch(err => {
                     return res.json({code:400,status:'fail',message: err.message})
                    })



                }else{
                    return res.json({code:200, status:'fail',message:'Visitor Not Found'})   
                }


            }).catch(err => {
                return res.json({code:400,status:'fail',message: err.message})
               })
            
        }else{
            return res.json({code:400, status:'fail',message:'Invalid User'})   
        }

    }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })
}


exports.guardNotificationList=(req,res,next)=>{
           

    var page = req.query.page ? req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
  
     //var start_day = moment().startOf('day').format('yyyy-MM-DD hh:mm:ss')
     var header = req.header('access-token');

     DB.GetQuery("SELECT * FROM `guard` WHERE `access_token`='"+header+"'").then(result => { 
       
       
        if(result.length !==0){
              var receiver_id = result[0].id
            console.log("SELECT `id`,`message`,`title`,`type`,`visitor_id`,`created_at`,`updated_at` from `notification` WHERE send_by = '0' AND receiver_id = "+receiver_id+" LIMIT " +limit)
            DB.GetQuery("SELECT `id`,`message`,`title`,`type`,`visitor_id`,`created_at`,`updated_at` from `notification` WHERE send_by = '0' AND receiver_id = "+receiver_id+" ORDER BY created_at DESC "+" LIMIT " +limit)
            .then(result=>{
       
                   DB.GetQuery("SELECT `id`,`message`,`title`,`type`,`visitor_id`,`created_at`,`updated_at` from `notification` WHERE send_by = '0' AND receiver_id = "+receiver_id)
                   .then(result_count=>{
                       if(result.length !==0){
                           return res.status(200).json({code: 200,status:'success',message:'Record Found',count:result_count.length, data:result})
                       }else{
                           return res.status(200).json({code: 200,status:'fail',message:'No Record Found',count:result_count.length, data:result})
                       }
                      
                   }).catch(err => {
                       return res.json({code:400,status:'fail',message: err.message})
                   })
               
       
            }).catch(err => {
               return res.json({code:400,status:'fail',message: err.message})
              })
        }else{
            return res.json({code:400, status:'fail',message:'Invalid User'})  
        }

     }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })


}

exports.employeeNotificationList=(req,res,next)=>{
           
    var page = req.query.page ? req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
  
     //var start_day = moment().startOf('day').format('yyyy-MM-DD hh:mm:ss')
     var header = req.header('access-token');

     DB.GetQuery("SELECT * FROM `employee` WHERE `access_token`='"+header+"'").then(result => { 
        
      
      
        if(result.length !==0){
               var receiver_id = result[0].id
           
            //console.log("SELECT * from `notification` WHERE send_by = '1' AND receiver_id = "+receiver_id+" LIMIT " +limit)
            DB.GetQuery("SELECT `id`,`message`,`title`,`visitor_id`,`type`,`created_at`,`updated_at` from `notification` WHERE send_by = '1' AND receiver_id = "+receiver_id+" ORDER BY created_at DESC LIMIT " +limit)

            .then(result=>{
       
                   DB.GetQuery("SELECT `id`,`message`,`title`,`visitor_id`,`type`,`created_at`,`updated_at` from `notification` WHERE send_by = '1' AND receiver_id = "+receiver_id)
                   .then(result_count=>{
                       if(result.length !==0){
                           return res.status(200).json({code: 200,status:'success',message:'Record Found',count:result_count.length, data:result})
                       }else{
                           return res.status(200).json({code: 200,status:'fail',message:'No Record Found',count:result_count.length, data:result})
                       }
                      
                   }).catch(err => {
                       return res.json({code:400,status:'fail',message: err.message})
                   })
               
       
            }).catch(err => {
               return res.json({code:400,status:'fail',message: err.message})
              })
        }else{
            return res.json({code:400, status:'fail',message:'Invalid User'})  
        }

     }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })


}

exports.logout=(req,res,next)=>{
    
    var user = req.body.user_type   // 1=guard, 2= employee
    var id = req.body.id
    if(user == 1){
        var table = TBL_GUARD
    }else{
           var table = TBL_EMPLOYEE
    }
    
      DB.UpdateData(table,{access_token:null, fcm_token:null}, {id:id}).then(result => {
          if(result){
              return res.status(200).json({code: 200,status:'success',message:'Logged out successfully'})
          }else{
              return res.status(200).json({code: 200,status:'success',message:'Failed to Log out'})  
          }
      }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })
    
}




exports.visitorById=(req,res,next)=>{
    
    var visitor_id = req.query.visitor_id;
    
    DB.GetRow(TBL_VISITOR,{id:visitor_id})
    .then(result=>{
        if(result){
          return res.status(200).json({code: 200,status:'success',message:'Record Found', data:result}) 
        }else{
          return res.status(200).json({code: 200,status:'fail',message:'No Record Found'})  
        }
    }).catch(err=>{
        return res.json({code:400,status:'fail',message: err.message})
    })
    
}

exports.pendingVisitorList=(req,res,next)=>{

    var page = req.query.page ? req.query.page:1;
    var numPerPage = req.query.per_page ? req.query.per_page:10;
    var skip = (page-1) * numPerPage; 
    var limit = skip + ',' + numPerPage;
      var d = new Date();
     console.log(d.setHours(0,0,0,0));
     console.log(moment(d.setHours(0,0,0,0)).format('yyyy-MM-DD hh:mm:ss'))
     
     var startdate = moment();
     startdate = startdate.subtract(1, "days");
      var s =  startdate.endOf('day').format('yyyy-MM-DD HH:mm:ss')
      
     var start_day = moment().startOf('day').format('yyyy-MM-DD hh:mm:ss')
     var header = req.header('access-token');

     DB.GetQuery("SELECT * FROM `employee` WHERE `access_token`='"+header+"'").then(result => { 
        if(result.length !==0){
            DB.GetQuery("SELECT vd.*,v.name as visitor_name,v.image as visitor_image, v.mobile as visitor_mobile,v.address as visitor_address FROM visitor_detail as vd LEFT JOIN visitor as v ON v.`id` = vd.`visitor_id` WHERE vd.entity_id="+req.query.entity_id+" AND vd.status='2' AND vd.created_at >'"+s+"' ORDER BY vd.created_at DESC   LIMIT "+limit)
            .then(result=>{
    //   console.log("SELECT * FROM visitor_detail WHERE entity_id="+req.query.entity_id+" AND (status='0' OR status='2') AND created_at >'"+s+"'")
                   DB.GetQuery("SELECT * FROM visitor_detail WHERE entity_id="+req.query.entity_id+" AND status='2' AND created_at >'"+s+"'")
                   .then(result_count=>{
                       console.log(result_count)
                       if(result.length !==0){
                           return res.status(200).json({code: 200,status:'success',message:'Record Found',count:result_count.length, data:result})
                       }else{
                           return res.status(200).json({code: 200,status:'fail',message:'No Record Found',count:result_count.length, data:result})
                       }
                      
                   }).catch(err => {
                       return res.json({code:400,status:'fail',message: err.message})
                   })
               
       
            }).catch(err => {
               return res.json({code:400,status:'fail',message: err.message})
              })
        }else{
            return res.json({code:400, status:'fail',message:'Invalid User'})  
        }

     }).catch(err => {
        return res.json({code:400,status:'fail',message: err.message})
       })

}

function randomString(length, chars) {

    var result = '';

    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

	//console.log(result);

    return result;

}