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
var async = require('async');
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

    var batchSql = 'INSERT INTO `bio_batches`(`customer_id`, `received_date`, ' +
        '`shipped_date`, `sample_purpose`, `sample_storage_location`, `created_by`, `modified_by`) ' +
        'VALUES (? , ? , ? , ? , ?, ?, ? )';

    var batchParams = [ params.customerId,
                        params.receivedDate,
                        params.shippedDate,
                        params.purpose,
                        params.storageLocation,
                        7, 7];

    db.query(batchSql, batchParams).then(function (data) {
        return data.insertId;
    }).then(function (batchId) {
        var newSamples = [];
        async.eachSeries(params.samples, function (sample, callback) {
            var rep = +sample.replicates;
            var i = 1;
            async.doWhilst(function (cb) {
                var name = sample.name;
                if (rep > 1) {
                    name = name + '_' + i;
                }

                var params = [batchId,
                    sample.type,
                    name,
                    rep,
                    sample.description,
                    sample.speciesId,
                    sample.containerType,
                    sample.collectionDate, '7', '7'];

                newSamples.push(params);
                i++;
                cb();
            }, function () {
                return i < rep;
            }, function (err, n) {
                console.error(err);
                console.log('ran n times: ' + n);
            });
            callback();
        }, function () {
            var sql2 = 'INSERT INTO `bio_samples` (`batch_id`, `type`, `name`, `replicates`, `description`, ' +
                '`species_id`, `container_type`, `collection_date`, `created_by`, `modified_by`) VALUES ?';


            return db.query(sql2, [newSamples]);
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
