var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs290_walkupd',
  password: '7654',
  database: 'cs290_walkupd'
});

module.exports.pool = pool;

