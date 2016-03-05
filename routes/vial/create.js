/**
 * Created by joa3894 on 2/27/2016.
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
var authSchema = require('../../json/vial/create.json');
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

    var sql = 'INSERT INTO `bio_vials`(`vial_id`, `day_prepared`, `status`) VALUES (? , ? , ?)';
    var sqlParams = [params.vial_id, params.preparation_date, params.vial_status];

    var sql1 = 'SELECT * FROM bio_vials WHERE vial_id  = ? AND day_prepared = ?';
    var sqlParams1 = [params.vial_id, params.preparation_date];

    db.query(sql1, sqlParams1).then(function (data) {
        if (data.length < 1) {

            db.query(sql, sqlParams).then(function (data) {

                var insertedID = data.insertId;

                if (params.vial_type === "RXN")
                {
                    sql2 = 'INSERT INTO `bio_vials_rxn`(`vial_id`, `fatty_acid_mass`, `c15_istd_concentration`) VALUES (? , ? , ? )';
                    sqlParams2 = [insertedID, params.Mass_50ml_fa, params.Con_C15FA_ISTD];
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
                //else if (params.vial_type === "GC")
                //{
                //    var sql2 = 'INSERT INTO `bio_vials_gc`(`vial_id`, `c13_mass`, `c13_istd_concentration`, `c19_istd_concentration`) VALUES (? , ? , ? , ?)';
                //    var sqlParams2 = [insertedID, params.Mass_50ml_C13, params.Con_C13_ISTD, params.Con_C19_ISTD];
                //    db.query(sql2, sqlParams2).then(function () {
                //
                //
                //    }).catch(function (err) {
                //        console.error('MySQL: ', err);
                //        res.status(500);
                //        return res.json({
                //            code: 500,
                //            error: 'Uh oh! We can\'t even!'
                //        });
                //    });
                //
                //}
                //else if (params.vial_type === "SPK")
                //{
                //    sql2 = 'INSERT INTO `bio_vials_spike`(`vial_id`, `c15_mass`, `Mass_450ml_sample`) VALUES (? , ?, ?)';
                //    sqlParams2 = [insertedID, params.Mass_50ml_C15, params.Mass_450ml_sample];
                //    db.query(sql2, sqlParams2).then(function () {
                //
                //
                //    }).catch(function (err) {
                //        console.error('MySQL: ', err);
                //        res.status(500);
                //        return res.json({
                //            code: 500,
                //            error: 'Uh oh! We can\'t even!'
                //        });
                //    });
                //
                //}

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
            console.error('Customer ' + params.vial_id + ' already exists');
            res.status(409);
            return res.json({
                code: 409,
                error: "Conflict: Vial already exists"
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

});

//export our router
module.exports = router;