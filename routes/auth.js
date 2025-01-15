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



let tempUserData = {};

router.post("/api/register", upload.single('image'), async (req, res) => {
  try {
    const { hotel_name, hotel_owner_name, email, phone, password, hotel_address, hotel_reg_number,
      hotel_gstin_number, city, country, amount } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 3600000; // OTP expires in 1 hour

    // Send OTP via email
    await sendOTPEmail(email, otp); 

    // Hash the password and store user data temporarily
    const passwordHash = await bcrypt.hash(password, 10);
    tempUserData[email] = {
      hotel_name,
      hotel_owner_name,
      phone,
      password: passwordHash,
      hotel_address,
      hotel_reg_number,
      hotel_gstin_number,
      city,
      country,
      amount,
      image: req.file.path,
      otp,
      otpExpires
    };

    res.status(201).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: "Hotel registration failed", error: error.message });
  }
});


//Login hotel..
router.post("/api/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Login successful
    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});


router.post("/api/verify-login-otp", async (req, res) => {
  try {
    const { otp } = req.body;

    const userEntry = Object.entries(tempUserData).find(
      ([_, data]) => data.otp === otp && data.otpExpires > Date.now()
    );

    if (!userEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const [email, userData] = userEntry;

    // Ensure email is added to the user data before saving
    userData.email = email;

    // Save the user to the database
    const user = new User(userData);
    await user.save();

    // Remove temporary data
    delete tempUserData[email];

    res.json({ message: "Registration completed successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
});  

