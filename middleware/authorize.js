const conn = require("../db/db");
const util = require("util"); // helper method

const authorized = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
  const { token } = req.headers;
  const user = await query("select * from user where token = ?", [token]);
  if (user[0]) {
    next();
  } else {
    res.status(403).json({
      msg: "you are not authorized to access this role",
    });
  }
};

module.exports = authorized;
