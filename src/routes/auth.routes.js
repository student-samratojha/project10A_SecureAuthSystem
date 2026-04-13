const express = require("express");
const {
  getRegister,
  register,
  getLogin,
  getForgetEmail,
  postForgetEmail,
  login,
  forgetPassword,
  forgetPass,
  resetPassword,
  logout,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/register", getRegister);
router.post("/register", register);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/forget-password", getForgetEmail);
router.post("/forget-password/init", postForgetEmail);
router.get("/forget-password/:email", forgetPassword);
router.post("/forget-password", forgetPass);
router.get("/reset-password/:email", (req, res) => res.render("resetPassword", { email: req.params.email }));
router.post("/reset-password/:email", resetPassword);
router.get("/logout", logout);

module.exports = router;
