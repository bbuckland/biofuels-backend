/**
 * Created by joa3894 on 4/6/16.
 * User/Auth - index.js
 * This sets up our authentication routes for Streams
 * @type {*|exports|module.exports}
 */


//Include our libraries
var express = require('express');
var jwt = require('jsonwebtoken');
var async = require('async');
var Ajv = require('ajv');
var authSchema = require('../../json/vial/update.json');
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



    if (params.vial_type === "RXN")
    {

        var  sql = 'UPDATE `bio_vials_rxn`SET `vial_id` = ?, `date_prepared` = ?, `fatty_acid_mass` = ?, `c15_istd_concentration` = ? WHERE `id` = ?';
        var sqlParams = [
            params.vialId,
            params.preparationDate,
            params.fattyAcidmass,
            params.c15Istdcon,
            params.id
        ];

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

    }
    //else if (params.vial_type === "GC")
    //{
    //    sql = 'INSERT INTO `bio_vials_gc`(`vial_id`, `date_prepared`, `status`, `c13_mass`, `c13_istd_concentration`, `c19_istd_concentration`) VALUES ?';
    //    sqlParams = [];
    //
    //    async.eachSeries(params.vials, function (vial, callback) {
    //        var param = [
    //            vial.vialId,
    //            vial.preparationDate,
    //            vial.vialStatus,
    //            vial.c13Mass,
    //            vial.c13Istdcon,
    //            vial.c19Istdcon
    //        ];
    //
    //        sqlParams.push(param);
    //        callback();
    //    }, function () {
    //        console.log(sqlParams);
    //        db.query(sql, [sqlParams]).then(function (data) {
    //
    //            //setup our response
    //            var resp = {
    //                status: 'Ok'
    //            };
    //
    //
    //            //send down our response
    //            res.json(resp);
    //
    //        }).catch(function (err) {
    //            console.error('MySQL: ', err);
    //            res.status(500);
    //            return res.json({
    //                code: 500,
    //                error: 'Uh oh! We can\'t even!'
    //            });
    //        });
    //
    //    });
    //
    //}
    //else if (params.vial_type === "SPK")
    //{
    //    sql = 'INSERT INTO `bio_vials_spike`(`vial_id`, `date_prepared`, `status`, `c15_mass`, `Mass_450ml_sample`) VALUES ?';
    //    sqlParams = [];
    //
    //    async.eachSeries(params.vials, function (vial, callback) {
    //        var param = [
    //            vial.vialId,
    //            vial.preparationDate,
    //            vial.vialStatus,
    //            vial.c15Mass,
    //            vial.Mass450mlsample
    //        ];
    //
    //        sqlParams.push(param);
    //        callback();
    //    }, function () {
    //        console.log(sqlParams);
    //        db.query(sql, [sqlParams]).then(function (data) {
    //
    //            //setup our response
    //            var resp = {
    //                status: 'Ok'
    //            };
    //
    //
    //            //send down our response
    //            res.json(resp);
    //
    //        }).catch(function (err) {
    //            console.error('MySQL: ', err);
    //            res.status(500);
    //            return res.json({
    //                code: 500,
    //                error: 'Uh oh! We can\'t even!'
    //            });
    //        });
    //
    //    });
    //
    //}





});

//export our router
module.exports = router;