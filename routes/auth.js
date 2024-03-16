const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const conn = require("../conn");
const jwt = require("jsonwebtoken");
JWT_SECRET = "mynameisami";
JWT_EXPIRES = "90d";
COOKIE_EXPIRES = "90";
const { body, validationResult } = require("express-validator");

//Dummy Api
router.get("/dummy", (req, res) => {
  res.json([{ message: "Done!", status: "", count: 0, limit: 0 }]);
});

//Register Auth Api
router.post(
  "/register",
  [
    body("username", "Enter a valid username").isLength({ min: 4 }),
    body("email", "Enter a valid email").isEmail(),
    // body('Npassword','Enter a valid passwords').isLength({min:6}),
  ],
  async (req, res) => {
    const { username, email, password: Npassword } = req.body;

    if (!username || !email || !Npassword) {
      return res.json({ status: false, message: "Please enter all fields" });
    }
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    } else {
      try {
        await conn.query(
          "SELECT user_name,user_email FROM users WHERE user_name=? OR user_email=?",
          [username, email],
          async (error, result) => {
            if (error) throw error;
            if (result.length > 0) {
              return res.json({
                status: false,
                message: "Username or email already exists",
              });
            } else {
              const salt = await bcrypt.genSalt(10);
              const password = await bcrypt.hash(Npassword, salt);

              await conn.query(
                "INSERT INTO users (user_name, user_email, upassword) VALUES (?, ?, ?)",
                [username, email, password]
              );

              return res.json({
                success: true,
                message: "User has been registered",
              });
            }
          }
        );
      } catch (error) {
        console.error("Error:", error);
        return res.json({
          status: false,
          message: "An error occurred during registration",
        });
      }
    }
  }
);

// Autheticate a user with login

router.post(
  "/login",
  [body("email", "Enter a valid email").isEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, password } = req.body;
      if (!email || !password) {
        return res.json({ status: false, message: "Please enter all fields" });
      } else {
        await conn.query(
          "SELECT * FROM users WHERE user_email=?",
          [email],
          async (error, result) => {
            if (error) {
              console.error(error);
              return res
                .status(500)
                .json({ status: false, message: "Internal Server Error" });
            }

            if (!result.length) {
              return res.json({
                status: false,
                message: "Email or password is incorrect",
              });
            } else {
              const isPassword = await bcrypt.compare(
                password,
                result[0].upassword
              );
              console.log(password);
              console.log(result[0].upassword);
              console.log(isPassword);

              if (!isPassword) {
                return res.json({
                  status: false,
                  message: "Password is incorrect",
                });
              }

              const token = jwt.sign({ id: result[0].user_id }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES,
                httpOnly: true,
              });

              const CookieOptions = {
                expires: new Date(
                  Date.now() + COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
              };

              res.cookie("userSave", token, CookieOptions);
              return res.json({
                status: true,
                message: "User has been logged in",
                token,
              });
            }
          }
        );
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: false, message: "Internal Server Error" });
    }
  }
);

module.exports = router;
