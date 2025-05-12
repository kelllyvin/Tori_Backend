const router = require('express').Router()
const {handleRegister}= require ("../controller/userController")

router.post("/register", handleRegister)

module.exports = router