const userModel = require("../db/models/user.model");
const auditModel = require("../db/models/audit.model");
const questionModel = require("../db/models/question.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ✅ AUDIT LOG
async function auditLog(req, action, user = null) {
  try {
    await auditModel.create({
      user: user?._id || req.user?._id || null,
      action,
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
    });
  } catch (error) {
    console.log("Audit Error:", error);
  }
}

// ✅ PAGES
async function getRegister(req, res) {
  res.render("register", { 
    error: req.query.error, 
    success: req.query.success 
  });
}

async function getLogin(req, res) {
  res.render("login", { 
    error: req.query.error, 
    success: req.query.success 
  });
}

// ✅ REGISTER (User + Questions)
async function register(req, res) {
  try {
    let { name, email, password, questions, answers } = req.body;

    // Ensure questions and answers are arrays (Express might parse a single item as a string)
    if (!Array.isArray(questions)) questions = [questions];
    if (!Array.isArray(answers)) answers = [answers];

    // validation
    if (!questions[0] || !answers[0] || questions.length !== answers.length) {
      return res.redirect("/auth/register?error=Please fill all security questions");
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      await auditLog(req, "Register failed - User exists", existingUser);
      return res.redirect("/auth/register?error=User Already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // ✅ hash answers
    const hashedAnswers = await Promise.all(
      answers.map((ans) => bcrypt.hash(ans, 10)),
    );

    await questionModel.create({
      email,
      questions,
      answers: hashedAnswers,
    });

    await auditLog(req, "Register successful", newUser);

    return res.redirect("/auth/login?success=Registered Successfully");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

// ✅ LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      await auditLog(req, "Login failed - user not found");
      return res.redirect("/auth/login?error=Invalid Credentials");
    }

    if (!user.isVerified) {
      await auditLog(req, "Login failed - not approved", user);
      return res.redirect("/auth/login?error=User Not Approved");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await auditLog(req, "Login failed - wrong password", user);
      return res.redirect("/auth/login?error=Invalid Credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    await auditLog(req, "Login successful", user);

    return res.redirect(`/secure/${user.role}?Welcome_sir`);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

// ✅ GET EMAIL STEP
async function getForgetEmail(req, res) {
  res.render("forgetEmail");
}

async function postForgetEmail(req, res) {
  const { email } = req.body;
  res.redirect(`/auth/forget-password/${email}`);
}

// ✅ FORGET PASSWORD PAGE
async function forgetPassword(req, res) {
  try {
    const { email } = req.params;

    const ques = await questionModel.findOne({ email });

    if (!ques) {
      await auditLog(req, "ForgetPass - data not found");
      return res.redirect("/auth/login?error=DataNotFound");
    }

    res.render("forgetPass", { question: ques });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

// ✅ VERIFY ANSWERS (FIXED 🔥)
async function forgetPass(req, res) {
  try {
    let { email, answers } = req.body;

    if (!Array.isArray(answers)) answers = [answers];

    const ques = await questionModel.findOne({ email });

    if (!ques) {
      await auditLog(req, "ForgetPass failed - no data");
      return res.redirect("/auth/login?error=DataNotFound");
    }

    let isCorrect = true;

    // ✅ bcrypt compare (IMPORTANT FIX)
    for (let i = 0; i < ques.answers.length; i++) {
      const match = await bcrypt.compare(answers[i], ques.answers[i]);

      if (!match) {
        isCorrect = false;
        break;
      }
    }

    if (!isCorrect) {
      await auditLog(req, "Wrong security answers");
      return res.send("Wrong answers ❌");
    }

    await auditLog(req, "Security answers verified");

    return res.redirect(`/auth/reset-password/${email}`);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

// ✅ RESET PASSWORD
async function resetPassword(req, res) {
  try {
    const { email } = req.params;
    const { newPassword } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.send("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await auditLog(req, "Password reset successful", user);

    return res.redirect("/auth/login?success=Password Reset Done");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

// ✅ LOGOUT
async function logout(req, res) {
  try {
    res.clearCookie("token");
    await auditLog(req, "User logged out");
    return res.redirect("/auth/login?success=Logged Out");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

module.exports = {
  getRegister,
  getLogin,
  register,
  login,
  forgetPassword,
  forgetPass,
  auditLog,
  resetPassword,
  logout,
  getForgetEmail,
  postForgetEmail
};
