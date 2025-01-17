import express from "express"
import {connect_model} from "./user_schema.js"
import multer from "multer";

export const user_router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'user_addar/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});


const upload = multer({ storage: storage });

user_router.post("/api/user_register", upload.single('image'), async (req, res) => {
    try {
        const {Username, addar_number, phone,date_registration,address, gender, room_number, check_in,
        check_in_date, check_out_time, amount_paid, verifed, number_of_people }= req.body;

     
        const users = {
            Username,
            addar_number,
            phone,
            date_registration,
            address,
            gender,
            room_number,
            check_in,
            check_in_date,
            check_out_time,
            amount_paid,
            number_of_people,
            verifed,
            image: req.file.path
        };
    
        const phoneRegex = /^\d{10}$/;

        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Phone number must be 10 digits" });
        }
        
        const user = new connect_model(users);
        await user.save();

        res.status(201).json({ message: "User entry successfull" });


    } catch (error) {
        res.status(500).json({ message: "Hotel registration failed", error: error.message });
    } 
});


user_router.get("/api/get_user", async (req, res) => {
    try {
        const users = await connect_model.find({},"Username addar_number phone");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Not found", error: error.message });
    }
});


user_router.get("/api/get_user/:id", async (req, res) => {
    try {
        const user = await connect_model.findById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Not found", error: error.message });
    }
});