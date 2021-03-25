var express = require('express');
const multer  = require('multer');
var router = express.Router();
var path = require('path');

var {adminLogin,forgotPassword,verifyOTP,resetPassword}=require('./../../app/controllers/admin/admin');
var {addPackage, getPackage, updatePackage, deletePackage, packageList,getPackageById,checkPackageExpiration,currentPackage,purchase,payment,changeStatus}=require('./../../app/controllers/admin/package');
var {addEntity,getEntity,updateEntity,deleteEntity,getEntityById,entityList,getAll,getDashboardCount}=require('./../../app/controllers/admin/entity');
var {addGuard,getGuard,updateGuard,deleteGuard,getGuardList,getGuardById}=require('../../app/controllers/admin/guard');
var {addEmployee,getEmployee,updateEmployee,deleteEmployee,employeeList,getEmployeeById}=require('./../../app/controllers/admin/employee');
var {getVisitorList}=require('./../../app/controllers/admin/visitor');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       // cb(null, 'uploads');
        cb(null, path.join(__dirname, './../../uploads/'));
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + file.originalname)
    }
});

const upload = multer({ storage: storage });


router.post('/upload', upload.single('file'), (req, res, next) => {

    const file = req.file
    if (!file) {
        res.status(400);
        return res.json({code: 400,status:'fail', message: "Please upload a file",  response: file });
    }else{
        res.status(200);
        return res.json({ code: 200,status:'success', message: "File Uploaded",filename: file.filename });
    }

});



router.post('/adminLogin',adminLogin);
router.post('/forgotPassword',forgotPassword);
router.post('/verifyOTP',verifyOTP);
router.post('/resetPassword',resetPassword);

router.post('/addPackage',addPackage);
router.get('/getPackage',getPackage);
router.post('/updatePackage',updatePackage);
router.post('/deletePackage',deletePackage);
router.get('/packageList',packageList);
router.get('/getPackageById/:id',getPackageById);
router.get('/checkPackageExpiration',checkPackageExpiration);
router.get('/currentPackage',currentPackage);
router.post('/purchase',purchase);
router.post('/payment',payment);
router.get('/changeStatus',changeStatus);

router.post('/addEntity',addEntity);
router.get('/getEntity',getEntity);
router.post('/updateEntity/:id',updateEntity);
router.post('/deleteEntity',deleteEntity);
router.get('/entityList',entityList);
router.get('/getEntityById/:id',getEntityById);
router.get('/getAll',getAll);
router.get('/getDashboardCount',getDashboardCount);


router.post('/addGuard',addGuard);
router.get('/getGuard',getGuard);
router.post('/updateGuard/:id',updateGuard);
router.post('/deleteGuard',deleteGuard);
router.get('/getGuardList',getGuardList);
router.get('/getGuardById/:id',getGuardById);

router.post('/addEmployee',addEmployee);
router.get('/getEmployee',getEmployee);
router.post('/updateEmployee/:id',updateEmployee);
router.post('/deleteEmployee',deleteEmployee);
router.get('/employeeList',employeeList);
router.get('/getEmployeeById/:id',getEmployeeById);


router.get('/getVisitorList',getVisitorList);


module.exports = router;