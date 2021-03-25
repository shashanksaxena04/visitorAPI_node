const DB = require('../../config/db');

exports.addEmployee=(req,res,next)=>{
    var body = req.body;
    var data = {
       name:body.name,
       mobile: body.mobile,
       entity_id: body.entity_id
    
   }
   
   DB.GetRow(TBL_EMPLOYEE,{mobile:body.mobile}).then(result=>{
    if(result){
          return res.json({code: 200,status:'fail',message : "Mobile Already Registered"})
          
    }else{
        
        DB.InsertData(TBL_EMPLOYEE,data).then(result => {
       if(result){
           return res.json({code: 200,status:'success',message : "Employee Added Successfully"})
       }else{
           return res.status(200).json({code: 200,status:'fail',message:'Failed To Add Employee',data:result})
       }
   }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })
        
    }
   }).catch(err => {
       return res.status(400).json({status:'fail',message: err.message})
    })

   
}


exports.getEmployee=(req,res,next)=>{

     var where ='';
     DB.GetResult(TBL_EMPLOYEE, where).then(result => {

         if(result.length !==0){
             return res.status(200).json({code: 200,status:'success',message:'Record Found',data:result})
         }else{
             return res.status(200).json({code: 200,status:'fail',message:'Record Not Found',data:result})
         }
 
     }).catch(err => {
         return res.status(400).json({code: 400,status:'fail',message: err.message})
      })
 
 }

 exports.updateEmployee=(req,res,next)=>{
    var body = req.body;
    var data = {
        name:body.name,
        mobile:body.mobile,
        
        
    }   
       
        DB.UpdateData(TBL_EMPLOYEE,data, {id:req.params.id}).then(result => {
                if(result){
                    return res.status(200).json({code: 200,status:'success',message:'Record Updated Successfully'})
                }else{
                    return res.status(200).json({code: 200,status:'fail',message:'Updation Failed'})
                }
        
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
             })
    
    }

    exports.deleteEmployee=(req,res,next)=>{
        var body = req.body;
             DB.DeleteData(TBL_EMPLOYEE,{id:body.id}).then(result => {
                     if(result){
                         return res.status(200).json({code: 200,status:'success',message:'Record Deleted Successfully'})
                     }else{
                         return res.status(200).json({code: 200,status:'fail',message:'Failed To Delete Record'})
                     }
             
                 }).catch(err => {
                     return res.status(400).json({code: 400,status:'fail',message: err.message})
                  })
         
         }

        //  exports.getEmployee=(req,res,next)=>{
        //        //console.log(1)
        //     var where ='';
        //     DB.GetResult(TBL_EMPLOYEE, where).then(result => {
       
        //         if(result.length !==0){
        //             return res.status(200).json({code: 200,status:'success',message:'Record Found',data:result})
        //         }else{
        //             return res.status(200).json({code: 200,status:'fail',message:'Record Not Found',data:result})
        //         }
        
        //     }).catch(err => {
        //         return res.status(400).json({code: 400,status:'fail',message: err.message})
        //      })
        
        // }

        exports.employeeList=(req,res,next)=>{

            var page = req.query.page ? req.query.page:1;
            var numPerPage = req.query.per_page ? req.query.per_page:10;
            var skip = (page-1) * numPerPage; 
            var limit = skip + ',' + numPerPage;
            console.log(req.query.search_value);
            if(req.query.search_value ==undefined || req.query.search_value ===" " || req.query.search_value ==null ){
            
                var where =  ' WHERE entity_id='+req.query.entity_id; 
                    }else{
                 var where = " WHERE entity_id="+req.query.entity_id+" AND name LIKE '%"+req.query.search_value+"%'";
                    }
        
             console.log("SELECT * FROM "+TBL_EMPLOYEE+ where +" LIMIT "+limit)
             DB.GetQuery("SELECT * FROM "+TBL_EMPLOYEE+ where +" LIMIT "+limit)
            .then(result => {
                if(result.length !==0){
                    var table_result = result
                    DB.GetResult(TBL_EMPLOYEE).then(result => {
        
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

        exports.getEmployeeById=(req,res,next)=>{

            DB.GetRow(TBL_EMPLOYEE, {id:req.params.id} ).then(result => {
                if(result){
                    return res.status(200).json({code: 200,status:'success',message:'Record Found',data:result})
                }else{
                    return res.status(200).json({code: 200,status:'fail',message:'No Record Found',data:result})
                }
                
            }).catch(err => {
                return res.status(400).json({code: 400,status:'fail',message: err.message})
             })
        
        }

        
