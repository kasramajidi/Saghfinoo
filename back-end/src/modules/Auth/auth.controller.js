const { assert } = require("console")
const UserModel = require("./../../models/User.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const {
    findOneUserSchema,
    loginSchema,
    removeUserSchema,
    signUpSchema,
    updateUserSchemaAdmin,
    updateUserSchemaUser
} = require("./auth.validation.js")


exports.getAll = async (req, res) => {
    try {
        const getAllUser = await UserModel.find({}).lean()
        res.status(200).json(getAllUser)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getOne = async (req, res) => {
    try {

        const { phone } = req.body
        await findOneUserSchema.validate({ phone })
        const findOne = await UserModel.findOne({ phone }).select("-passwordHash")
        if (!findOne) {
            return res.status(404).json({ message: "user not found" })
        }
        res.status(200).json(findOne)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.signup = async (req, res) => {
    try {
        const { email, phone, passwordHash } = req.body

        await signUpSchema.validate({ email, phone, passwordHash })

        const emailUser = await UserModel.findOne({ email })

        if (emailUser) {
            return res.status(409).json({
                message: "Email is already registered."
            })
        }

        const phoneUser = await UserModel.findOne({ phone })

        if (phoneUser) {
            return res.status(409).json({
                message: "Phone is already registered."
            })
        }

        const hashPassword = await bcrypt.hash(passwordHash, 10)

        const newUser = await UserModel.create({
            email,
            phone,
            passwordHash: hashPassword
        })

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        )

        newUser.token = token
        await newUser.save()

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        const userResponse = newUser.toObject()
        delete userResponse.passwordHash

        res.status(201).json({
            message: "User SignUp successfully!",
            token,
            user: userResponse
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, passwordHash } = req.body

        await loginSchema.validate({ email, passwordHash })

        const findUser = await UserModel.findOne({ email }).select('+passwordHash')

        if (!findUser) {
            return res.status(404).json({ message: "Invalid email or password." })
        }

        const comparePassword = await bcrypt.compare(passwordHash, findUser.passwordHash)

        if (!comparePassword) {
            return res.status(404).json({ message: "Invalid email or password." })
        }

        const newToken = jwt.sign(
            { id: findUser._id, role: findUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        await UserModel.findByIdAndUpdate(findUser._id, { token: newToken })

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "Login successful!",
            user: {
                id: findUser._id,
                email: findUser.email,
                role: findUser.role
            },
            token: newToken
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.guest = async (req, res) => {
    try {
        const guestToken = jwt.sign(
            { role: "guest" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        )

        res.cookie("token", guestToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        })

        res.status(200).json({
            message: "Guest login successful!",
            token: guestToken
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        })

        res.status(200).json({ message: "Logged out successfully!" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.removeUser = async (req, res) => {
    try {
        const { email, phone } = req.body

        if (email) {
            await removeUserSchema.validate({ email })
        } else if (phone) {
            await removeUserSchema.validate({ phone })
        } else {
            return res.status(400).json({ message: "Email or phone is required" })
        }

        const deletedUser = await UserModel.findOneAndDelete(email ? { email } : { phone })

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.errors[0] })
        }
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id
        const updateData = req.body
        const isAdmin = req.user.role === "Admin"

        const schema = isAdmin ? updateUserSchemaAdmin : updateUserSchemaUser

        await schema.validate(updateData)

        if (updateData.password) {
            const hashPassword = await bcrypt.hash(updateData.password, 10)
            updateData.passwordHash = hashPassword
            delete updateData.password
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-passwordHash')

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser })

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.errors[0] })
        }
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
