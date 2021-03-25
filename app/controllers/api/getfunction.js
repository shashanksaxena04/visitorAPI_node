const DB = require('../../config/db');

module.exports = {

 
    getUser : function(where) { 
        return new Promise((resolve, reject) => {
            DB.GetRow(TBL_USERS, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },

    getGuard : function(where) { 
        return new Promise((resolve, reject) => {
          
            DB.GetResult(TBL_GUARD, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },

    getEmployee : function(where) { 
        return new Promise((resolve, reject) => {
            DB.GetResult(TBL_EMPLOYEE, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },

   

    getVisitor : function(where) { 
        return new Promise((resolve, reject) => {
            DB.GetRow(TBL_VISITOR, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },
    
    insertVisitorDetail: function(data) { 
        return new Promise((resolve, reject) => {
            DB.InsertData(TBL_VISITOR_DETAIL, data).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },
    
     setPermission : function(data,where) { 
        return new Promise((resolve, reject) => {
            
            DB.UpdateData(TBL_VISITOR_DETAIL,data, where).then(result => {
                    resolve(result)
             }).catch(err => {
               reject(err)
            })
        })
    },




















}


