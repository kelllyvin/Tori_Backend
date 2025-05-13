
const USER = require("../models/user")
const bcrypt = require('bcryptjs')
const generateToken = require("../helpers/generatetoken")
const {sendWelcomeEmail} = require ('../email/sendEmail')

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
         const user = await USER.findOne({
          verificationToken:token,
          verificationTokenExpires: {$gt: Date.now()}
         })
           if(!user){
            return res.status(404).json({message: "invalid or expires token", email: user.email})
           }
           // mark user as verified
           user.isVerfied = true
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

module.exports = {handleRegister,handleVerifyEmail }