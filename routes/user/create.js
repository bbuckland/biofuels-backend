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

  db.query(sql, sqlParams, function(err){

      if(err)
          throw err;
      else
        console.log("OK");

  });
});

//export our router
module.exports = router;
