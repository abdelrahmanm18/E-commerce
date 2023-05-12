const router = require("express").Router();
const conn = require("../db/db");
const admin = require("../middleware/admin");
const authorized = require("../middleware/authorize");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper method

module.exports = router;

//ADMIN[CREATE, RETRIVE ,UPDATE, DELETE]
router.post(
  "/create",
  admin,
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter category")
    .bail()
    .isString()
    .withMessage("please enter a valid category name")
    .bail()
    .isLength({ min: 5 })
    .withMessage("product category should be at least 5 characters"),

  body("title")
    .not()
    .isEmpty()
    .withMessage("please enter category title")
    .bail()
    .isString()
    .withMessage("please enter valid tilte")
    .bail()
    .isLength({ min: 5 })
    .withMessage("product category title should be at least 5 characters"),

  body("description")
    .not()
    .isEmpty()
    .withMessage("Please enter product category description")
    .bail()
    .isString()
    .withMessage("please enter valid description")
    .bail()
    .isLength({ min: 10 })
    .withMessage("description is too short!!"),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ result: result.array() });
    }
    const category = {
      name: req.body.name,
      title: req.body.title,
      description: req.body.description,
    };
    const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
    await query("insert into category set ?", category);
    res.status(200).json({
      msg: "category created successfully",
    });
  }
);

router.put(
  "/update/:id",
  admin,
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter category")
    .bail()
    .isString()
    .withMessage("please enter a valid category name")
    .bail()
    .isLength({ min: 5 })
    .withMessage("product category should be at least 5 characters"),

  body("title")
    .not()
    .isEmpty()
    .withMessage("please enter category title")
    .bail()
    .isString()
    .withMessage("please enter valid tilte")
    .bail()
    .isLength({ min: 5 })
    .withMessage("product category title should be at least 5 characters"),

  body("description")
    .not()
    .isEmpty()
    .withMessage("Please enter product category description")
    .bail()
    .isString()
    .withMessage("please enter valid description")
    .bail()
    .isLength({ min: 10 })
    .withMessage("description is too short!!"),
  async (req, res) => {
    const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ result: result.array() });
    }
    //checking if product category already exists
    const category = await query("select * from category where id = ?", [
      req.params.id,
    ]);

    if (!category[0]) {
      res.status(404).json({
        msg: "product category not found!",
      });
    }

    const categoryObject = {
      name: req.body.name,
      title: req.body.title,
      description: req.body.description,
    };

    await query("update category set ? where id = ?", [
      categoryObject,
      category[0].id,
    ]);

    res.status(200).json({
      msg: "product category updated successfully",
    });
  }
);

router.delete("/delete/:id", admin, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async

  //prepare product object
  const category = await query("select * from category where id = ?", [
    req.params.id,
  ]);

  if (!category[0]) {
    res.status(404).json({
      msg: "product category not found!",
    });
  }

  await query("delete from category where id = ?", [category[0].id]);
});

router.get("/", async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
  const categories = await query("select * from category");
  res.status(200).json({
    categories,
  });
});
