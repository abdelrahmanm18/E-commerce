const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to access url encoded
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors()); // allow http request from local hosts

//Modules
const auth = require("./routes/Auth");
const products = require("./routes/Products");
const categories = require("./routes/Categories");
const users = require("./routes/Users");
app.listen(3306, "localhost", () => {
  console.log("server is running now");
});

//API endpoints
app.use("/auth", auth);
app.use("/products", products);
app.use("/categories", categories);
app.use("/users", users);
