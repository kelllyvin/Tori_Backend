const router = require('express').Router()
const {handleRegister,handleVerifyEmail, handelLogin}= require ("../controller/userController")


router.post("/register", handleRegister)
router.post ("/verify-email/:token",handleVerifyEmail)
router.post ("/Login",handelLogin)

module.exports = router