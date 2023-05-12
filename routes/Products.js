const router = require("express").Router();
const conn = require("../db/db");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper method
const upload = require("../middleware/upload");
const fs = require("fs");
module.exports = router;

//ADMIN [CREATE, UPDATE, DELETE, LIST ]
router.post(
  "/create",
  admin,
  upload.single("image"),
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .isString()
    .withMessage("please enter a valid product name")
    .bail()
    .isLength({ min: 5 })
    .withMessage("product name should be at least 5 characters"),

  body("price")
    .not()
    .isEmpty()
    .withMessage("Please enter product price")
    .isNumeric()
    .bail()
    .withMessage("please enter price in numbers"),

  body("description")
    .not()
    .isEmpty()
    .withMessage("Please enter product description")
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

    if (!req.file) {
      return res.status(400).json({
        errors: [
          {
            msg: "Image is Required!!",
          },
        ],
      });
    }

    //prepare product object

    const product = {
      name: req.body.name,
      price: req.body.price,
      category_id: req.body.category,
      description: req.body.description,
      image_url: req.file.filename,
    };

    const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
    await query("insert into product set ?", product);
    res.status(200).json({
      msg: req.file,
    });
  }
);

router.put(
  "/update/:id",
  admin,
  upload.single("image"),
  body("name")
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .isString()
    .withMessage("please enter a valid product name")
    .bail()
    .isLength({ min: 5 })
    .withMessage("product name should be at least 5 characters"),

  body("price")
    .not()
    .isEmpty()
    .withMessage("Please enter product price")
    .isNumeric()
    .bail()
    .withMessage("please enter price in numbers"),

  body("description")
    .not()
    .isEmpty()
    .withMessage("Please enter product description")
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
    //checking if product already exists
    const product = await query("select * from product where id = ?", [
      req.params.id,
    ]);

    if (!product[0]) {
      res.status(404).json({
        msg: "product not found!",
      });
    }

    const productObject = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image_url: req.file.filename,
    };

    if (req.file) {
      productObject.image_url = req.file.filename;
      fs.unlinkSync("./upload/" + product[0].image_url);
    }
    console.log(product[0].id);
    await query("update product set ? where id = ?", [
      productObject,
      product[0].id,
    ]);

    res.status(200).json({
      msg: "product updated successfully",
    });
  }
);

router.delete("/delete/:id", admin, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async

  //prepare product object
  const product = await query("select * from product where id = ?", [
    req.params.id,
  ]);

  if (!product[0]) {
    res.status(404).json({
      msg: "product not found!",
    });
  }

  fs.unlinkSync("./upload/" + product[0].image_url);
  await query("delete from product where id = ?", [product[0].id]);

  res.status(200).json({
    msg: "product deleted successfully",
  });
});

// router.post("/list" ,(req,res) => {
//   res.status(200).json({
//     msg: "product created!!"
//   })
// })
//USER [LIST, ]

//list
router.get("", async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
  const products = await query("select * from product");
  res.status(200).json({
    products,
  });
});

router.get("/:id", async (req, res) => {
  const query = util.promisify(conn.query).bind(conn); // to change my sql query to a promise that can be used with await async
  const product = await query("select * from product where id = ?", [
    req.params.id,
  ]);

  if (!product[0]) {
    res.status(404).json({
      msg: "movie not found! ",
    });
  }

  product[0].image_url =
    "http://" + req.hostname + ":4000/" + product[0].image_url;
  res.status(200).json(product[0]);
});
