/**
 * User/Auth - index.js
 * This sets up our authentication routes for Streams
 * @type {*|exports|module.exports}
 */


//Include our libraries
var express = require('express');
var jwt = require('jsonwebtoken');
var Ajv = require('ajv');
var authSchema = require('../../json/user/create.json');
var db = require('../../library/mysql-pool.js');

//init express router
var router = express.Router();

//init validation
var ajv = Ajv(); // options can be passed
var validate = ajv.compile(authSchema);

/**
 * @api {post} /user/auth Authenticate
 * @apiName authUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiParam {String} email Email of the user logging in
 * @apiParam {String} password Encrypted user's password
 *
 * @apiSuccess {Int} user_id The ID of the User.
 * @apiSuccess {String} full_name Full name of the User.
 * @apiSuccess {String} email  The email of the User.
 * @apiSuccess {String} token Token for future request headers
 */
router.post('/', function (req, res) {
  var params = req.body;

  if (!validate(params)) {
    console.error('JSON: ', validate.errors);

    res.status(422);
    return res.json({
      code: 422,
      error: validate.errors
    });
  }

  var sql = 'INSERT INTO `bio_users`(`full_name`, `email`, `password_hash`) VALUES (? , ? , ?)';
  var sqlParams = [params.full_name, params.email, params.password];

  var sql1 = 'SELECT * FROM bio_users WHERE email = ?';
  var sqlParams1 = [params.email];

   db.query(sql1, sqlParams1).then(function (data) {
       if (data.length != 1) {


           db.query(sql, sqlParams).then(function () {
               //setup our response
               var resp = {
                   status: 'OK'
               };
               //send down our response
               res.json(resp);
           }).catch(function (err) {
               console.error('MySQL: ', err);
               res.status(500);
               return res.json({
                   code: 500,
                   error: 'Uh oh! We can\'t even!',
                   data: process.env
               });
           });
       }
       else
       {   console.error('User already exists');
           res.status(409);
           return res.json({
           code: 409,
           error: "Conflict: User already exists"
           });
       }
   }).catch(function (err) {
       console.error('MySQL: ', err);
       res.status(500);
        return res.json({
           code: 500,
           error: 'Uh oh! We can\'t even!',
           data: process.env
        });
  });

});

//export our router
module.exports = router;
