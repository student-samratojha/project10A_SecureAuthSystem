const express = require("express");
const {
  getAdmin,
  getUser,
  verifyUser,
  deleteUser,
  restoreUser,
  geteditUser,
  editUser,
} = require("../controllers/secure.controller");
const { verifyAdmin, verifyUser: checkUserRole } = require("../middleware/auth.middleware");

const router = express.Router();

// Admin Routes
router.get("/admin", verifyAdmin, getAdmin);
router.post("/verify-user", verifyAdmin, verifyUser);
router.post("/delete-user", verifyAdmin, deleteUser);
router.post("/restore-user", verifyAdmin, restoreUser);

// User Routes
router.get("/user", checkUserRole, getUser);
router.get("/edit-user", checkUserRole, geteditUser);
router.post("/update", checkUserRole, editUser);

module.exports = router;