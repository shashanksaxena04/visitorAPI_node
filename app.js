var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./app/config/constants');
const cron = require('cron');
const axios = require('axios');


var adminRouter = require('./routes/admin');
var apiRouter = require('./routes/api');


var app = express();

 var mysql = require('mysql');
var connection = mysql.createConnection({
            host: "localhost",
            user: "visitor",
            password: "jNriNi5W2H66sk3r",
            database:"visitor"
});

global.DB=connection;
//app.set('db', connection);



connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});








//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})



app.use('/admin', adminRouter);

app.use('/api', apiRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


var job1 = new cron.CronJob({
  // cronTime: '*/10 * * * * *',
   cronTime:'0 0 * * *',
   onTick: function() { 
     
        var url = global.BASE+'admin/changeStatus'
       axios({
           method:'get',
           url,
       })
       .then(function (response,err) {
       if(response.data.status == true){
          // console.log(response.data)
           console.log('job inactive success')
       }else{
         //  console.log(err)
           console.log('job inactive fail')
       }
       })
       .catch(err=>{
           console.log('job inactive fail')
       })

   },
   start: true
 });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
