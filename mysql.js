var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'q1591215',
  database : 'fintech'
});
 
connection.connect();
 
connection.query('select name from user', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].name);
});
 
connection.end();