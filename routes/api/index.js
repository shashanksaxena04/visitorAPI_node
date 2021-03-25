var express = require('express');
const multer  = require('multer');
var router = express.Router();
var path = require('path');


var {guardLogin,addVisitor,checkVisitor,InVisitor,OutVisitor,InVisitorList,OutVisitorList,employeeLogin,permission,guardNotificationList,employeeNotificationList,visitorById,logout,pendingVisitorList}=require('./../../app/controllers/api/index');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       // cb(null, 'uploads/visitor');
      cb(null, path.join(__dirname, './../../uploads/visitor/'));
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + file.originalname)
    }
});

const upload = multer({ storage: storage });


router.post('/upload', upload.single('file'), (req, res, next) => {
console.log(req)
    const file = req.file
    if (!file) {
        res.status(400);
        return res.json({code: 400,status:'fail', message: "Please upload a file",  response: file });
    }else{
        res.status(200);
        return res.json({ code: 200,status:'success', message: "File Uploaded",filename: file.filename, path:global.URL+'uploads/visitor/'+file.filename });
    }

});



router.post('/guardLogin',guardLogin);
router.post('/addVisitor',addVisitor);
router.post('/checkVisitor',checkVisitor);
router.post('/InVisitor',InVisitor);
router.post('/OutVisitor',OutVisitor);
router.get('/InVisitorList',InVisitorList);
router.get('/OutVisitorList',OutVisitorList);
router.post('/employeeLogin',employeeLogin);
router.post('/permission',permission);
router.get('/guardNotificationList',guardNotificationList);
router.get('/employeeNotificationList',employeeNotificationList);
router.get('/visitorById',visitorById);
router.post('/logout',logout);
router.get('/pendingVisitorList',pendingVisitorList);





module.exports = router;