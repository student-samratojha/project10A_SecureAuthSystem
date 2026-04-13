const userModel = require("../db/models/user.model");
const auditModel = require("../db/models/audit.model");
const { auditLog } = require("./auth.controller");
async function verifyUser(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await auditLog(req, "verification failed-userNotFound");
      return res.redirect("/secure/admin?UserNotFound");
    }
    user.isVerified = true;
    await user.save();
    await auditLog(req, "User Verified by Admin");
    res.redirect("/secure/admin?User_Verified");
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await auditLog(req, "Deletion failed-userNotFound");
      return res.redirect("/secure/admin?UserNotFound");
    }
    user.isDeleted = true;
    user.isVerified = false;
    await user.save();
    await auditLog(req, "User Deleted by Admin");
    res.redirect("/secure/admin?User_Deleted");
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}
async function restoreUser(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await auditLog(req, "Restoration failed-userNotFound");
      return res.redirect("/secure/admin?UserNotFound");
    }
    user.isVerified = true;
    user.isDeleted = false;
    await user.save();
    await auditLog(req, "User Restored by Admin");
    res.redirect("/secure/admin?User_Restored");
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}

async function getAdmin(req, res) {
  try {
    const pendingUsers = await userModel.find({
      isVerified: false, // Changed from isVerify to match logic
      role: "user",
    });
    const verifiedUsers = await userModel.find({
      isVerified: true,
      isDeleted: false,
      role: "user",
    });
    const deletedUsers = await userModel.find({
      isDeleted: true,
      role: "user",
    });
    const audits = await auditModel.find({}).populate("user", "name email").sort({ createdAt: -1 }).limit(10);

    res.render("admin", {
      admin: req.user,
      pendingUsers,
      verifiedUsers,
      deletedUsers,
      audits,
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}

async function getUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.redirect("/auth/login?error=UserNotFound");
    }
    const audits = await auditModel.find({user:req.user._id}).sort({createdAt:-1}).limit(10).populate("user")
    res.render("user", { user,audits });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}

async function geteditUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.redirect("/auth/login?error=UserNotFound");
    }
    res.render("editUser", { user });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}

async function editUser(req, res) {
  try {
    const { name, profilePic, bio, city, education } = req.body;
    const user = await userModel.findById(req.user.id); // Use ID from token for security
    if (!user) {
      await auditLog(req, "edit failed-userNotFound");
      return res.redirect("/auth/login?error=UserNotFound");
    }
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user.city = city || user.city;
    user.education = education || user.education;
    await user.save();
    await auditLog(req, "Update Finished");
    res.redirect(`/secure/${user.role}?updated`);
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
}

module.exports = {
    editUser,
    geteditUser,
    getAdmin,
    getUser,
    verifyUser,
    deleteUser,
    restoreUser
}
