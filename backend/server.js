// Import necessary modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt"); // For password hashing

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory located one level up
app.use("/public", express.static(path.join(__dirname, "public")));

// Create a connection to the database
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "redesigned_ecommerce",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});

// User Registration Route
app.post("/register", (req, res) => {
  const {
    username,
    password,
    birthmonth,
    address,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;

    const sql =
      "INSERT INTO users (username, password, birthmonth, address, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        username,
        hashedPassword,
        birthmonth,
        address,
        city,
        state,
        postal_code,
        country,
      ],
      (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
      }
    );
  });
});

// User Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.json({ message: "Login failed" });
    }

    const user = results[0];
    // Compare the hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        res.json({ message: "Login successful", user });
      } else {
        res.json({ message: "Login failed" });
      }
    });
  });
});

// Add to cart
app.post("/cart", (req, res) => {
  const { productId } = req.body;
  const userId = 1; // Temporary static userId for testing
  const sql = "INSERT INTO cart (user_id, product_id) VALUES (?, ?)";
  db.query(sql, [userId, productId], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

// Get cart items
app.get("/cart", (req, res) => {
  const userId = 1; // Just to test it
  const sql = `
        SELECT products.* FROM cart 
        JOIN products ON cart.product_id = products.id 
        WHERE cart.user_id = ?
    `;
  db.query(sql, [userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Delete item from cart
app.delete("/cart/:productId", (req, res) => {
  const { productId } = req.params;
  const userId = 1; // Testing it

  const sql = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error("Error deleting item from cart:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to remove item from cart" });
      return;
    }
    res.json({ success: true, message: "Item removed from cart" });
  });
});

// Route to get all products or filter by sport
app.get("/products", (req, res) => {
  const { sport } = req.query;
  let sql = "SELECT * FROM products";
  const params = [];

  if (sport) {
    sql += " WHERE sport = ?";
    params.push(sport);
  }

  db.query(sql, params, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to add a new product
app.post("/products", (req, res) => {
  const { name, description, price, image_url, product_type, team, sport } =
    req.body;
  const sql =
    "INSERT INTO products (name, description, price, image_url, product_type, team, sport) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, description, price, image_url, product_type, team, sport],
    (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId });
    }
  );
});

// Route to get a product by ID
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// Handle contact form submissions
app.post("/contact", (req, res) => {
  const { name, email, comment } = req.body;
  const sql = "INSERT INTO contacts (name, email, comment) VALUES (?, ?, ?)";
  db.query(sql, [name, email, comment], (err, result) => {
    if (err) {
      console.error("Error storing contact form data:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to submit contact form" });
      return;
    }
    res.json({ success: true, message: "Contact form submitted successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
