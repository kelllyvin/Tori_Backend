
const USER = require("../models/user")
const bcrypt = require('bcryptjs')
const generateToken = require("../helpers/generatetoken")
const {sendWelcomeEmail} = require ('../email/sendEmail')
const jwt = require("jsonwebtoken")

const handleRegister = async (req, res) =>{
    const {fullName, email, password, phoneNumber, role} = req.body
   try {
    
    // check if user already exist(email and phoneNumber)

    const existingUser = await USER.findOne({
        $or:[
           {email: email || null },{phoneNumber: phoneNumber || null}
        ],
    })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists" });
    }
    // protect user password
    const salt = await bcrypt.genSalt()
    const hashedPasssword = await bcrypt.hash(password, salt) 
    
    // verify process 

    const verificationToken = generateToken()
    const verificationTokenExpires =  Date.now() + 24 * 60 * 60 * 1000
    // save to database

    const user = await USER .create({
        fullName, email,
        password: hashedPasssword,
        role: role || "tenant",
        phoneNumber,
        verificationToken,
        verificationTokenExpires,
    })

    // send an email

  const clientUrl = `${process.env.FRONTEND-URL}/verify-email/${verificationToken}`

  await sendWelcomeEmail({email: user.email,
    fullName: user.fullName,
    clientUrl
  })

    return res.status(201).json({sucess: true, message: "User Registered successfully", user})

   } catch (error) {
    console.error(error);
    res.status(500).json({message:error.message})
    
   }
}

const handleVerifyEmail = async(req, res) =>{
  const {token} = req.params
       try {
        // find by token
         const user = await USER.findOne({
          verificationToken:token,
          
         })
           if(!user){
            return res.status(404).json({message: "invalid verificaton token"})
           }
           // check if token has expired
           if(user.verificationToken < Date.now()){
             return res.status(400).json({ message:" verification token has expired",
              email: user.email
             })
           }
           //3. check if user is already verified
           if(user.isVerified){
            return res.status(400).json({message: "email is already verified"})
           }
           // mark user as verified
           user.isVerified = true
           user.verificationToken = undefined
           user.verificationTokenExpires = undefined

           await user.save()

           return res.status(200)
           .json({ sucess: true, message: "email Verified successfully"})
       } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
       }
}
const handelLogin = async(req, res) =>{
  const {email, password, role} = req.body
  if(!email || !password || !role) {
    return res
    .status(400)
    .json({message: "email, password, and role are required"})
  }
  try {
    const user = await USER.findOne({email})
    if (!user){
      return res.status(401).json({message: "Account Not Found, please Register"})
    }
    if(user.role !== role){
      return res.status(403).json ({message:"Access Denied for This role"})
    }
    if(!user.isVerified){
      return res.status(403).json ({message: "Email is NOt Verified, Check your mail "})
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect){
      return res.json(401).json({message: " invalid email  or password"})
    }
    
    // generate a token ( token always has validity and expired period)

    const token = jwt.sign({email:user.email, role: user.role}, process.env.JET_SECRET, {expiresIn: " 3 days"})


    return res.ststus(200).json({sucess: true,  token, user:{
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilepicture,
     }})


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {handleRegister,handleVerifyEmail, handelLogin }