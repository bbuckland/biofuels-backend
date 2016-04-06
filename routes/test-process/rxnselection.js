/**
 * Created by joa3894 on 4/4/16.
 * Test-Process/RXN Selection - index.js
 * Esterification process
 * @type {*|exports|module.exports}
 */


//Include our libraries
var date = require('moment');
var express = require('express');
var jwt = require('jsonwebtoken');
var Ajv = require('ajv');
var async = require('async');
var authSchema = require('../../json/test-process/rxnselection.json');
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


        async.eachSeries(params.rxndata, function (data, callback) {
            var params = [data.rxnVialId, data.massAddVial, 8, data.sampleId];
            var sql2 = 'UPDATE `bio_samples` SET `rxn_vial_id`= ?, `mass_add_rxn`= ?, `modified_by`= ? WHERE `id` = ?';
            var sqlquery = db.query(sql2, params);
            sqlquery.catch(function (err) {
                    console.error('MySQL: ', err);
                    res.status(500);
                    return res.json({
                        code: 500,
                        error: 'Uh oh! We can\'t even!'
                    });
            });
            callback();
        }, function(err){
            if( err ) {
                console.log('Failed');
            } else {
                console.log('RXN Selection Complete');
                var resp = {
                    status: 'Ok'
                };

                //send down our response
                res.json(resp);
            }

        });

});

//export our router
module.exports = router;