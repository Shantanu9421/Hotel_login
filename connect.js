import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import { router } from "./routes/auth.js"
import { user_router } from "./routes/user_register.js";
dotenv.config()


const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT ;
const app = express()

app.use("/", router)
app.use("/", user_router)

mongoose.connect(MONGO_URI, {
    
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

const UserSchema = new mongoose.Schema({
    hotel_name:{
        type: String,
        required: true,
    }, 
    hotel_owner_name: {
        type:String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    
    password: {
        type: String,
        required: true,
    },
    
    hotel_address: {
        type: String,
        required: true,
    },
    hotel_reg_number:{
        type: String,
        required: true,
    },
    hotel_gstin_number:{
        type: String,
        required: true,
    },

    city:{
        type: String,
        required: true,
    },
    country:{
        type: String,
        required: true,
    },

    amount:{
        type: String,
        required: true,
    },

    image: {
        type: String,
        required: true,
    },

    otp: { type: String },
    otpExpires: { type: Date },
    
}, {timestamps: true}
);

export const User = mongoose.model('User', UserSchema)


app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.listen(PORT, () => {
  console.log("Server is running on port 8000")
})
