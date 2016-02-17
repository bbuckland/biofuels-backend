/**
 * User/Auth - index.js
 * This sets up our authentication routes for Streams
 * @type {*|exports|module.exports}
 */


//Include our libraries
var express = require('express');
var jwt = require('jsonwebtoken');
var Ajv = require('ajv');
var authSchema = require('../../json/user/auth.json');
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

  var sql = 'SELECT * FROM bio_users WHERE email = ? AND password_hash = ?';
  var sqlParams = [params.email, params.password];

  db.query(sql, sqlParams).then(function (data) {
    if (data.length != 1) {
      res.status(401);
      return res.json({
        code: 401,
        error: "That user was not found"
      });
    }

    //setup our response
    var response = data[0];

    console.log(data[0]);
    //validate password
    if (response.password_hash !== params.password) {
      //TODO setup error handler for unified error responses
      res.status(401);
      return res.json({
        code: 401,
        error: "Passwords do not match! "
      });
    }

    //get jwt secret
    var secret = process.env.SECRET_KEY || 'dev :: biofuels makes algae cool again';

    //setup jwt options
    var options = {
      algorithm: 'HS256',
      expiresInMinutes: '1440',
      subject: 'biofuels-dev',
      issue: 'biofuels',
      audience: data[0].email
    };

    //setup jwt payload
    var payload = {
      email: data[0].email,
      date: new Date()
    };

    //generate JWT
    var token = jwt.sign(payload, secret, options);

    var resp = {
      user_id: data[0].user_id,
      full_name: data[0].full_name,
      email: data[0].email,
      token: token
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
});

//export our router
module.exports = router;
