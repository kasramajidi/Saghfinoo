const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()
const path = require("path")

const apiRouter = require("./modules/api/swagger.route") 
const authRouter = require("./modules/Auth/auth.route")

//* Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//* Cookie Parser
app.use(cookieParser())
app.use(cors())

//* Routes

app.use("/api", apiRouter)
app.use("/auth", authRouter)

//* 404 Error Handler
app.use((req, res, next) => {
    console.log("this path is not found", req.path);
    res.status(404).json({ message: "404! Path Not Found. Please check the path/method" })
})

module.exports = app