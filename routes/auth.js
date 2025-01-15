import express from "express"
import cors from "cors"
import { User } from "../connect.js"
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from "dotenv"
import bcrypt from "bcrypt"

export const router = express.Router()
router.use(cors())
router.use(express.json())
dotenv.config()



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your email provider
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});
// transporter.verify(function(error, success) {
//   if (error) {
//     console.log('SMTP connection error:', error);
//   } else {
//     console.log('SMTP server is ready to send emails');
//   }
// });

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP for Email Verification ',
    text: `Your OTP is: ${otp} \n\nThis OTP will expire in 6 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};




router.post("/api/register", upload.single('image'), async (req, res) => {
  try {

    const { hotel_name, hotel_owner_name, email, phone, password, hotel_address, hotel_reg_number,
      hotel_gstin_number, city, country, amount } = req.body

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^\d{10}$/
  
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" })
      }
  
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Phone number must be 10 digits" })
      }

    const imagePath = req.file.path
   
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({
      hotel_name,
      hotel_owner_name,
      email,
      phone,
      password: passwordHash,
      hotel_address,
      hotel_reg_number,
      hotel_gstin_number,
      city,
      country,
      amount,
      image: imagePath
    })

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }
    await user.save()
    res.status(201).json({ message: "User created" })
  }
  catch (error) {
    res.status(500).json({ message: "Hotel resgister failed" } + error)
  }
})



//Login hotel..
router.post("/api/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 360000;

    await sendOTPEmail(user.email, otp);
    await user.save();

    res.json({ message: "OTP sent to your email. Please verify to complete login." });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});



router.post('/api/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Clear the OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      message: "Login successful",
      user: {
        hotel_owner_name: user.hotel_owner_name,
        hotel_name: user.hotel_name,
        hotel_reg_number: user.hotel_reg_number,
        phone: user.phone,
        hotel_gstin_number: user.hotel_gstin_number,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
});
