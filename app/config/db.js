var nodemailer = require('nodemailer');

// const DB = CreateConnection()
// function CreateConnection() {
//      var mysql = require('mysql');
//           return mysql.createConnection({
//             host: "localhost",
//             user: "visitor",
//             password: "ARsnjcywiPByZiXB",
//             database:"visitor"
//         });
// }

module.exports = {
   

    CreateMailConnection:function(){

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'visitlog1@gmail.com',
              pass: 'visitor@123'
            }
          });
    },
    
    InsertData: function(table, data) {
        return new Promise((resolve, reject) => {
          //  const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var column = [];
                var values = [];
                for (const [key, value] of Object.entries(data)) {
                    column.push("`" + key + "`");
                    if(value!=null){
                        values.push("'" + value + "'");
                    }else{
                        values.push(NULL);
                    }
                }
                var InsertKey = column.toString();
                var InsertVal = values.toString();
                var sql = "INSERT INTO " + table + "(" + InsertKey + ") VALUES(" + InsertVal + ")";
                //console.log(sql);
                DB.query(sql, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
           // });
        })

    },
    UpdateData: function(table, data, where) {
        return new Promise((resolve, reject) => {
    
           // const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var set_data = [];
                var wheredata = [];
                for (const [key, value] of Object.entries(data)) {
                    if(value!=null){
                        set_data.push("`" + key + "`='" + value + "'");
                    }else{
                        set_data.push("`" + key + "`=NULL");
                    }
                }
                if(where){
                    var i = 1;
                    for (const [key, value] of Object.entries(where)) {
                        if (i == 1) {
                            if(value!=null){
                            wheredata.push("`" + key + "`='" + value + "'");
                            } else {
                            wheredata.push("`" + key + "`=NULL");
                            }
                        } else {
                            if(value!=null){
                                wheredata.push(" AND `" + key + "`='" + value + "'");
                            }else {
                                wheredata.push(" AND `" + key + "`=NULL");
                            }
                        }
                        i++;
                    }
                }
                var SetData = set_data.toString();
                var SetWhere = wheredata.toString();
                var SetWhere = SetWhere.replace(/\,/g, "");
                var sql = "UPDATE `" + table + "` SET " + SetData + " WHERE " + SetWhere;
                console.log(sql);
                DB.query(sql, function(err, result) {
                    if(err){
                        reject(err);
                    } // else if (result) {
                        resolve(true); 
                    // } else {
                    //     callback(false);
                    // }
                });
            // });
        });
    },
    GetRow: function(table, where, field = '*') {
        return new Promise((resolve, reject) => {

           // const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var wheredata = [];
                if(where){
                    var i = 1;
                    for (const [key, value] of Object.entries(where)) {
                        if (i == 1) {
                            wheredata.push("`" + key + "`='" + value + "'");
                        } else {
                            wheredata.push(" AND `" + key + "`='" + value + "'");
                        }
                        i++;
                    }
                    var SetWhere = wheredata.toString();
                    var SetWhere = " WHERE "+SetWhere.replace(/\,/g, "");
                }else{
                    var SetWhere ="";
                }
               
                var sql = "SELECT " + field + " FROM " + table + SetWhere;
                //console.log(sql);
                DB.query(sql, function(err, result, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        // if(result.length>0){
                            resolve(result[0]);
                        // }else{
                        //     callback(false);
                        // }
                    }
                });
            // });
        });
    },
    GetResult: function(table, where, field = "*", ) {
        return new Promise((resolve, reject) => {
            //const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var i = 1;
                var wheredata = [];
                if (where) {
                    for (const [key, value] of Object.entries(where)) {
                        if (i == 1) {
                            wheredata.push("`" + key + "`='" + value + "'");
                        } else {
                            wheredata.push(" AND `" + key + "`='" + value + "'");
                        }
                        i++;
                    }
                    var SetWhere = wheredata.toString();
                    var SetWhere = " WHERE " + SetWhere.replace(/\,/g, "");
                } else {
                    var SetWhere = "";
                }
                var sql = "SELECT " + field + " FROM " + table + SetWhere;
                //console.log(sql);
                DB.query(sql, function(err, result, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        // if(result.length>0){
                            resolve(result);
                        // }else{
                        //     callback(false);
                        // }
                    }
                });
            // });
        });
    },
    GetWhereIn: function(table, where, field = "*") {
        return new Promise((resolve, reject) => {
          //  const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var set_key;
                var set_array = {};
                for (const [key, value] of Object.entries(where)) {
                    set_key = key;
                    set_array = value;
                }
                var set_in = set_array.toString();
                var sql = "SELECT " + field + " FROM `" + table + "` WHERE `" + set_key + "` IN(" + set_in + ")";
                //console.log(sql);
                DB.query(sql, function(err, result, fields) {
                    if(err){
                        reject(err);
                    }else{
                        //if(result.length>0){
                            resolve(result);
                        // }else{
                        //     callback(false);
                        // }
                    }
                });
            // });
        });
    },
    InsertBatch: function(table, data) {
       return new Promise((resolve, reject) => {
          // const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var BatchValue = [];
                var BatchKey;
                var i = 0;
                data.forEach(function(row) {
                    var column = [];
                    var values = [];
                    for (const [key, value] of Object.entries(row)) {
                        column.push("`" + key + "`");
                        values.push("'" + value + "'");
                    }
                    if (i == 0) {
                        BatchKey = column.toString();
                        BatchValue.push("(" + values.toString() + ")");
                    }else{
                        BatchValue.push("(" + values.toString() + ")"); 
                    }
                  //  BatchValue.push("(" + values.toString() + ")");
                    i++;
                });
                var BatchValues = BatchValue.toString();
                var sql = "INSERT INTO `" + table + "`(" + BatchKey + ") VALUES" + BatchValues;
                //console.log(sql);
                DB.query(sql, function(err, result) {
                    if(err){
                        reject(err);
                    }else{
                        resolve(result);
                    }
                });
            // });
       });
    },
    DeleteData: function(table, where) {
        return new Promise((resolve, reject) => {
         //   const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var wheredata = [];
                var i = 1;
                for (const [key, value] of Object.entries(where)) {
                    if (i == 1) {
                        wheredata.push("`" + key + "`='" + value + "'");
                    } else {
                        wheredata.push(" AND `" + key + "`='" + value + "'");
                    }
                    i++;
                }
                var SetWhere = wheredata.toString();
                var SetWhere = SetWhere.replace(/\,/g, "");
                var sql = "DELETE FROM `" + table + "` WHERE " + SetWhere;
                //console.log(sql);
                DB.query(sql, function(err, result) {
                    if (err) {
                        reject(false);
                    } else {
                        resolve(result);
                    }
                });
            // });
        });
    },
    CountData: function(table, where) {
        return new Promise((resolve, reject) => {
//
         //   const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var wheredata = [];
                if(where){
                    var i = 1;
                    for (const [key, value] of Object.entries(where)) {
                        if (i == 1) {
                            wheredata.push("`" + key + "`='" + value + "'");
                        } else {
                            wheredata.push(" AND `" + key + "`='" + value + "'");
                        }
                        i++;
                    }
                }
                
                var sql = "SELECT COUNT(*) FROM `" + table+"`";
                var SetWhere = wheredata.toString();
                if(SetWhere!=""){
                    var SetWhere = SetWhere.replace(/\,/g, "");
                    sql+= " WHERE " + SetWhere;
                }
                //console.log(sql);
                DB.query(sql, function(err, result) {
                    if(err){
                        reject(err);
                    }else{
                        // if(result.length>0){
                            resolve(result[0]);
                        // }else{
                        //     callback(false);
                        // }
                    }
                });
            // });
        });
    },
    GetWhereNot: function(table, whernot, field = "*") {
        return new Promise((resolve, reject) => {

           // const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var i = 1;
                var wheredata = [];
                if (whernot) {
                    for (const [key, value] of Object.entries(whernot)) {
                        if (i == 1) {
                            wheredata.push(" NOT `" + key + "`='" + value + "'");
                        } else {
                            wheredata.push(" AND NOT `" + key + "`='" + value + "'");
                        }
                        i++;
                    }
                    var SetWhere = wheredata.toString();
                    var SetWhere = " WHERE " + SetWhere.replace(/\,/g, "");
                } else {
                    var SetWhere = "";
                }
                var sql = "SELECT " + field + " FROM " + table + SetWhere;
                //console.log(sql);
                DB.query(sql, function(err, result, fields) {
                    if(err){
                        reject(false);
                    }else{
                    //     if (result) {
                            resolve(result);
                    //     } else {
                    //         callback(false);
                    //     }
                    }
                });
            // });
        });
    },
    GetWhereNotIn: function(table, where, field = "*") {
        return new Promise((resolve, reject) => {
          //  const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var set_key;
                var set_array = {};
                for (const [key, value] of Object.entries(where)) {
                    set_key = key;
                    set_array = value;
                }
                var set_in = set_array.toString();
                var sql = "SELECT " + field + " FROM `" + table + "` WHERE NOT `" + set_key + "` IN(" + set_in + ")";
                //console.log(sql);
                DB.query(sql, function(err, result, fields) {
                    if(err){
                        reject(err);
                    }else{
                        // if (result) {
                            resolve(result);
                        // } else {
                        //     callback(false);
                        // }
                    }
                });
            // });
        });
    },
    GetWhereWithNot: function(table, where, whernot, field = "*") {
        return new Promise((resolve, reject) => {
           // const DB = this.CreateConnection();
            // DB.connect(function(err) {
            //     if(err) throw err;
                var i = 1;
                var wheredata = [];
                if (where) {
                    for (const [key, value] of Object.entries(where)) {
                        if (i == 1) {
                            wheredata.push("`" + key + "`='" + value + "'");
                        } else {
                            wheredata.push(" AND `" + key + "`='" + value + "'");
                        }
                        i++;
                    }
                    var SetWhere = wheredata.toString();
                    var SetWhere = " WHERE " + SetWhere.replace(/\,/g, "");
                } else {
                    var SetWhere = "";
                }
    
                var whereNotdata = [];
                if (whernot) {
                    for (const [key, value] of Object.entries(whernot)) {
                        whereNotdata.push(" AND NOT `" + key + "`='" + value + "'");
                    }
                    var SetWhereNot = whereNotdata.toString();
                    var SetWhereNot = SetWhereNot.replace(/\,/g, "");
                } else {
                    var SetWhereNot = "";
                }
                var sql = "SELECT " + field + " FROM " + table + SetWhere + SetWhereNot;
                //console.log(sql);
                DB.query(sql, function(err, result, fields) {
                    if(err){
                        reject(err);
                    }else{
                        //if (result) {
                            reject(result);
                        // } else {
                        //     callback(false);
                        // }
                    }
                });
            // });
        });
    },
    GetQuery: function(sql) {
        return new Promise((resolve, reject) => {
          //  const DB = this.CreateConnection();
            DB.query(sql, function(err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },



    sendMailFunction : function(mailOptions){
        return new Promise((resolve, reject) => {
            const m = this.CreateMailConnection();
            m.sendMail(mailOptions, function(err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }); 
    }

}