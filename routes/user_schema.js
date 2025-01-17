import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const hotel_register = new mongoose.Schema({ 
    Username: {
        type: String,
        required: true,
    },
    addar_number:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },

    date_registration:{
        type: Date,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    gender:{
        type: String,
        enum:['male', 'female', 'other'],
        required: true,
    },
    
    room_number:{
        type: String,
        required: true,
    },

    check_in:{
        type: Date,
        required: true,
    },
    check_in_date:{
        type: Date,
        required: true,
    },
    check_out_time:{
        type: String,
        required: true,
    },
    amount_paid:{
        type: String,
        required: true,
    },
    
    number_of_people:{
        type: String,
        required: true,
    },
    
    verifed:{
        type: String,
        enum:['yes', 'no'],
        default: true,
    },

    image: {
        type: String,
        required: true,
    },


},
{timestamps: true})

export const connect_model =  mongoose.model('hotel_users', hotel_register)