const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    number: {
        type: String,
        match: [/^\d{11}$/, "Phone number must be 11 digits"],
        unique: true
    },
    profile: {
        fullName: { type: String, trim: true, required: true },
        phone: {
            type: String,
            match: [/^\d{11}$/, "Phone number must be 11 digits"],
            unique: true
        },
        avatar: { type: String, default: null }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: null
    }
}, { timestamps: true })

const UserModel = mongoose.model("User", userSchema)

module.exports = UserModel
