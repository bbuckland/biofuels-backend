/**
 * Created by joa3894 on 2/26/2016.
 */
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
var authSchema = require('../../json/batch/create.json');
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



    var sql1 = 'SELECT `id` FROM bio_customers WHERE customer_code = ?';
    var sqlParams1 = [params.customer_code];

    db.query(sql1, sqlParams1).then(function (data) {
        if (data.length != 1) {
            res.status(401);
            return res.json({
                code: 401,
                error: "That customer was not found"
            });
        }
        var response = data[0];

        var cust_id = response.id;
        console.log(cust_id);
        var sql = 'INSERT INTO `bio_batches`(`customer_id`, `received_date`, `shipped_date`, `sample_purpose`, `sample_storage_location`) VALUES (? , ? , ? , ? , ?)';
        var sqlParams = [cust_id, params.received_date, params.shipped_date, params.sample_purpose, params.sample_storage_location];

        db.query(sql, sqlParams).then(function (data) {

            var batch_id = data.insertId;
            for (var count=0; count<params.sample_data.length; count++)
            {
                var sql2 = 'INSERT INTO `bio_samples`( `batch_id`, `type`, `name`, `description`, `species_id`, `container_type`, `collection_date`, `is_limited`) VALUES (? , ?, ? , ? , ? , ? , ?, ? )';
                var sqlParams2 = [batch_id, params.sample_data[count].sample_type, params.sample_data[count].sample_name, params.sample_data[count].sample_description, params.sample_data[count].species_id, params.sample_data[count].container_type, params.sample_data[count].collection_date, params.sample_data[count].is_limited];
                db.query(sql2, sqlParams2).then(function () {

                    console.log("entered sample" + count + "for the batch");
                    //setup our response


                    }).catch(function (err) {
                        console.error('MySQL: ', err);
                        res.status(500);
                        return res.json({
                            code: 500,
                            error: 'Uh oh! We can\'t even!3'
                        });
                    });

                }
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
                    error: 'Uh oh! We can\'t even2!'
                });
            });


    }).catch(function (err) {
        console.error('MySQL: ', err);
        res.status(500);
        return res.json({
            code: 500,
            error: 'Uh oh! We can\'t even1!'
        });
    });

});

//export our router
module.exports = router;