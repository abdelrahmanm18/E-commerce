const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: "3306",
  database: "e-commerce",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connection is done");
});

module.exports = connection;
