import mongoose from "mongoose"

const hotel_register = new mongoose.Schema({ 
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
    }

},
{timestamps: true}
)


export const connect_model = new mongoose.model('hotel_register', hotel_register)