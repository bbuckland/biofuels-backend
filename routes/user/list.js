/**
 * Created by joa3894 on 4/5/2016.
 * User/Auth - index.js
 * This sets up our authentication routes for Streams
 * @type {*|exports|module.exports}
 */


//Include our libraries
var express = require('express');
var jwt = require('jsonwebtoken');
var Ajv = require('ajv');

var db = require('../../library/mysql-pool.js');

//init express router
var router = express.Router();

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
router.get('/', function (req, res) {

    var sql = 'SELECT `id`, `email`, `full_name`, `admin_privileges` FROM `bio_users` WHERE 1';


    db.query(sql).then(function (data) {
        if (data.length == 0) {
            res.status(401);
            return res.json({
                code: 401,
                error: "No users were found"
            });
        }

        var resp = {
            data: data

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
