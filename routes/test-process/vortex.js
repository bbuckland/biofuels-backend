/**
 * Created by joa3894 on 4/6/16.
 * Test-Process/vortex - index.js
 * FAME process
 * @type {*|exports|module.exports}
 */


//Include our libraries
var moment = require('moment');
var express = require('express');
var jwt = require('jsonwebtoken');
var Ajv = require('ajv');
var async = require('async');
var authSchema = require('../../json/test-process/vortex.json');
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

    var tempbatchSql = 'INSERT INTO bio_temp_batches (start_date) VALUES (?)';
    var startDate = moment().format("YYYY-MM-DD HH:mm:ss");
    var tempbatchParams = [startDate];

    db.query(tempbatchSql, tempbatchParams).then(function (data) {
        return data.insertId;
    }).then(function (tempbatchId) {
        var newData = [];
        async.eachSeries(params.vortexdata, function (data, callback) {
            var params = [data.sampleId,
                tempbatchId,
                data.waterVol,
                data.postWaterClr,
                data.hexMass,
                data.vortexMxId,
                data.vortexMxTime,
                '6',
                '7', '7'];

            newData.push(params);
            callback();
        }, function () {
            var sql2 = 'INSERT INTO `bio_vortex`(`sample_id`, `temp_batch_id`, `water_volume`, `post_water_color`, `hexane_mass`, `vortex_mx_id`, `vortex_mx_time`, `analyst_id`, `created_by`, `modified_by`) VALUES ?';


            return db.query(sql2, [newData]);
        });
    }).then(function () {
            var resp = {
                status: 'Ok'
            };

            //send down our response
            res.json(resp);
        })
        .catch(function (err) {
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