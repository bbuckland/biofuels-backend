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
var authSchema = require('../../json/customer/update.json');
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


    var sql = 'UPDATE `bio_customers` SET `customer_name` = ?, `customer_code` = ?, `contact_name1` = ?, `contact_name2` = ?, `billing_name` = ?, `address_1` = ?, `address_2` = ?, `city` = ?, `state` = ?, `postal_code` = ?, `phone_number` = ?, `email` = ? WHERE `id`= ?';
    var sqlParams = [params.customer_name, params.customer_code, params.contact_name1, params.contact_name2, params.billing_name, params.address_1, params.address_2, params.city, params.state, params.postal_code, params.phone_number, params.email, params.id];



    db.query(sql, sqlParams).then(function (data) {

        //setup our response
        var resp = {
            status: 'Ok'
        };

        //send down our response
        res.json(resp);
    }).catch(function (err) {
        console.error('MySQL: ', err);
        res.status(500);
        return res.json({
            code: 500,
            error: 'Uh oh! We can\'t even!'
        });
    });

});

//export our router
module.exports = router;