const router = require("express").Router();
const conn = require("../db/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const util = require("util"); // helper method

const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
module.exports = router;

body("name");
router.post(
  "/create",
  admin,
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .isString()
    .withMessage("NOT Valid!, please enter a valid name")
    .bail()
    .isLength({ min: 10, max: 30 })
    .withMessage("name length should be between (10-30) character"),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Please enter your email")
    .bail()
    .isEmail()
    .withMessage("NOT Valid!, please enter a valid email"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Please enter your password")
    .bail()
    .isLength({ min: 8, max: 16 })
    .withMessage("password length should be between (8-16) character"),
  body("phone")
    .not()
    .isEmpty()
    .withMessage("Please enter your phone")
    .bail()
    .isMobilePhone()
    .withMessage("not valid mobilephone")
    .isLength({ min: 8, max: 16 })
    .withMessage("phone length should be between (8-16) character"),
  body("role")
    .not()
    .isEmpty()
    .withMessage("please enter user role")
    .bail()
    .isInt({ min: 0, max: 1 }),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ result: result.array() });
    }

    const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
    const checkIfuserExists = await query(
      "select * from user where email = ?",
      [req.body.email]
    );

    if (checkIfuserExists.length > 0) {
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
      phone: req.body.phone,
      password: await bcrypt.hash(req.body.password, 10),
      role: req.body.role,
    };

    await query("insert into user set ? ", userData);
    delete userData.password;
    res.status(200).json(userData);
  }
);

router.put(
  "/update/:id",
  admin,
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .isString()
    .withMessage("NOT Valid!, please enter a valid name")
    .bail()
    .isLength({ min: 10, max: 30 })
    .withMessage("name length should be between (10-30) character"),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Please enter your email")
    .bail()
    .isEmail()
    .withMessage("NOT Valid!, please enter a valid email"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Please enter your password")
    .bail()
    .isLength({ min: 8, max: 16 })
    .withMessage("password length should be between (8-16) character"),
  body("phone")
    .not()
    .isEmpty()
    .withMessage("Please enter your phone")
    .bail()
    .isMobilePhone()
    .withMessage("not valid mobilephone")
    .isLength({ min: 8, max: 16 })
    .withMessage("phone length should be between (8-16) character"),
  body("role")
    .not()
    .isEmpty()
    .withMessage("please enter user role")
    .bail()
    .isInt({ min: 0, max: 1 }),
  async (req, res) => {
    const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ result: result.array() });
    }

    const user = await query("select * from user where id = ?", [
      req.params.id,
    ]);

    if (!user[0]) {
      res.status(404).json({
        msg: "user not found!",
      });
    }
    const userObject = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: await bcrypt.hash(req.body.password, 10),
      role: req.body.role,
    };
    await query("update user set ? where id = ?", [userObject, user[0].id]);

    res.status(200).json({
      msg: "user deleted successfully",
    });
  }
);

router.delete("/delete/:id", admin, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async

  //prepare product object
  const user = await query("select * from user where id = ?", [req.params.id]);

  if (!user[0]) {
    res.status(404).json({
      msg: "user not found!",
    });
  }

  await query("delete from user where id = ?", [user[0].id]);
});

router.get("/", admin, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
  const users = await query("select * from user");
  res.status(200).json({
    users,
  });
});
