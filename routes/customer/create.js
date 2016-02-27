/**
 * Created by joa3894 on 2/22/2016.
 */
/**
 * User/Auth - index.js
 * This sets up our authentication routes for Streams
 * @type {*|exports|module.exports}
 */


//Include our libraries
var express = require('express');
var jwt = require('jsonwebtoken');
var Ajv = require('ajv');
var authSchema = require('../../json/customer/create.json');
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

    var sql = 'INSERT INTO `bio_customers` (`customer_name`, `customer_code`, `contact_name1`, `contact_name2`, `billing_name`, `address_1`, `address_2`, `city`, `state`, `postal_code`, `phone_number`, `email`) VALUES (? , ? , ? , ? , ?, ? , ? , ? , ? , ?, ?, ?)';
    var sqlParams = [params.customer_name, params.customer_code, params.contact_name1, params.contact_name2, params.billing_name, params.address_1, params.address_2, params.city, params.state, params.postal_code, params.phone_number, params.email ];

    var sql1 = 'SELECT * FROM bio_customers WHERE customer_code = ?';
    var sqlParams1 = [params.customer_code];

    db.query(sql1, sqlParams1).then(function (data) {
        if (data.length < 1) {
            db.query(sql, sqlParams).then(function (data) {



                var insertedID = data.insertId;
                for (var count=0; count<params.po_num.length; count++)
                {
                    var sql2 = 'INSERT INTO `bio_po_numbers` (`customer_id`, `po_number`) VALUES (? , ? )';
                    var sqlParams2 = [insertedID, params.po_num[count]];
                    db.query(sql2, sqlParams2).then(function () {


                    }).catch(function (err) {
                        console.error('MySQL: ', err);
                        res.status(500);
                        return res.json({
                            code: 500,
                            error: 'Uh oh! We can\'t even!'
                        });
                    });

                }
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
        }
        else {
            console.error('Customer ' + params.customer_name + ' already exists');
            res.status(409);
            return res.json({
                code: 409,
                error: "Conflict: Customer already exists"
            });
        }
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