'use strict';

var mysql = require('mysql');
var Promise = require("bluebird");


var host,
    port,
    user,
    pass;

var db = 'biofuels';

// grab our environment variables
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  host = process.env.OPENSHIFT_MYSQLDB_DB_HOST;
  port = process.env.OPENSHIFT_MYSQLDB_DB_PORT;
  user = process.env.OPENSHIFT_MYSQLDB_DB_USERNAME;
  pass = process.env.OPENSHIFT_MYSQLDB_DB_PASSWORD;
} else {
  host = 'localhost';
  port = '3306';
  user = 'root';
  pass = 'root';
}

var pool = mysql.createPool({
  host: host,
  port: port,
  user: user,
  password: pass,
  database: db,
  connectionLimit: 10,
  supportBigNumbers: true
});


// Get records from a city
exports.query = function(sql, variables) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }

      // make the query
      connection.query(sql, variables, function (err, results) {
        connection.release();
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(results);
      });
    });
  });
};
