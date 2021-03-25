const DB = require('../../config/db');

module.exports = {

 
    getPackage : function(req,where = '') { 
        return new Promise((resolve, reject) => {
            DB.GetResult(TBL_PACKAGE, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },

    getGuard : function(req,where = '') { 
        return new Promise((resolve, reject) => {
          
            DB.GetQuery("SELECT *, CONCAT(name) as text FROM guard").then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },

    getEmployee : function(req,where = '') { 
        return new Promise((resolve, reject) => {
            DB.GetQuery("SELECT *, CONCAT(name) as text FROM employee").then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },

    getCurrentPackage : function(req,where = '') { 
      console.log("SELECT * FROM entity_package WHERE package_id= "+req.package_id+" AND entity_id="+req.entity_id+" AND status='1' OR status='2'")
        return new Promise((resolve, reject) => {
            this.getUser({id:req.entity_id})
            .then(result=>{
      var current_package_detail_id	 = result.current_package_detail_id	
      
      DB.GetQuery("SELECT * FROM entity_package WHERE package_id= "+req.package_id+" AND entity_id="+req.entity_id+" AND id="+current_package_detail_id).then(result => {
                            resolve(result)
                    }).catch(err => {
                    reject(err)
                    })
            }).catch(err => {
               reject(err)
            })
           
        })
    },

    getUser : function(where) { 
        return new Promise((resolve, reject) => {
            DB.GetRow(TBL_USERS, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },


    




















}


