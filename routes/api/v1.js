var express = require('express');
var router = express.Router();
var auth=require('./../../app/controllers/api/v1/auth');
var {home}=require('./../../app/controllers/api/v1/home');
var {profile,updateProfile,changePassword,addAddress,updateAddress,getAddressList,getAddressByID, selectAddress, registerUser}=require('./../../app/controllers/api/v1/user');


const {productDetail,productByCategoryID} = require('./../../app/controllers/api/v1/product');

const {addCart,updateCart,getCartList, deleteCartItem} = require('./../../app/controllers/api/v1/cart');

const {createOrder, getOrderList} = require('./../../app/controllers/api/v1/order');




/* Requests */
var {loginValidate}= require('./../../app/requests/api/v1/login');

/* Middleware */
var {logincheck}=require('./../../app/middleware/api/v1/login-check');


/* GET users listing. */
//router.get('/',[loginValidate], auth.login);
router.post('/login',[loginValidate],auth.login);

router.use(logincheck);


router.get('/profile',profile);
router.post('/updateProfile',updateProfile);
router.post('/changePassword',changePassword);
router.post('/addAddress',addAddress);
router.get('/getAddressList',getAddressList);
router.get('/getAddressByID/:addressId',getAddressByID);
router.post('/updateAddress/:addressId',updateAddress);
router.get('/selectAddress/:addressId',selectAddress);
router.post('/registerUser',registerUser);

router.get('/home',home);
router.get('/product_detail/:product_id',productDetail);
router.get('/productByCategoryID/:category_id',productByCategoryID);

router.post('/addCart',addCart);
router.post('/updateCart',updateCart);
router.post('/getCartList',getCartList);
router.post('/deleteCartItem',deleteCartItem);

router.post('/createOrder',createOrder);
router.get('/getOrderList',getOrderList);




module.exports = router;
