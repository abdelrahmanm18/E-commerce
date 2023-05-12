const { Router } = require("express");

const router = require("express").Router();
const conn = require("../db/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//' body ' to get the data in body request
// "validationResult" to check if there is an error in request or not
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper method
const { errorMonitor } = require("events");
//Login ---- registeration

//Register Auth apis
router.post(
  "/register",
  body("email")
    .not()
    .isEmpty()
    .withMessage("Please enter your email")
    .bail()
    .isEmail()
    .withMessage("NOT Valid!, please enter a valid email"),
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .isString()
    .withMessage("NOT Valid!, please enter a valid name")
    .bail()
    .isLength({ min: 10, max: 20 })
    .withMessage("name length should be between (10-20) character"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Please enter your password")
    .bail()
    .isLength({ min: 8, max: 16 })
    .withMessage("password length should be between (8-16) character"),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ result: result.array() });
      }

      const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
      const checkIfEmailExists = await query(
        "select * from user where email = ?",
        [req.body.email]
      );

      if (checkIfEmailExists.length > 0) {
        res.status(400).json({
          result: [
            {
              msg: "Email already exists!!",
            },
          ],
        });
      }

      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"),
      };

      await query("insert into user set ? ", userData);
      delete userData.password;
      res.status(200).json(userData);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: err });
    }
  }
);

//Login Auth apis
router.post(
  "/login",
  body("email")
    .not()
    .isEmpty()
    .withMessage("Please enter your email!!")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email!!"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Please enter your password !!")
    .bail()
    .isLength({ min: 8, max: 16 })
    .withMessage("password length should be between (8 -16) character"),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({
          result: result.array(),
        });
      }

      const query = util.promisify(conn.query).bind(conn);
      const user = await query("select * from user where email = ? ", [
        req.body.email,
      ]);
      console.log(user);
      if (user.length == 0) {
        res.status(404).json({
          errors: [
            {
              msg: "Email does not exist !!",
            },
          ],
        });
      }

      const checkPassword = await bcrypt.compare(
        req.body.password,
        user[0].Password
      );

      if (checkPassword) {
        console.log(user[0].Password);
        delete user[0].Password;
        res.status(200).json(user);
      } else {
        res.status(404).json({
          errors: [
            {
              msg: "password is not right !",
            },
          ],
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
);

module.exports = router;
