const express = require("express")
const authRouter = express.Router()
const authController = require("./auth.controller")
const {
    authenticationToken,
    authorizeRoles
} = require("./../../middleware/Auth")

const {
    adminAccess,
    adminAccessSimple,
    adminPermission
} = require("./../../middleware/IsAdmin")

authRouter
    .route("/userAll")
    .get(authenticationToken, adminAccessSimple, authController.getAll)

authRouter
    .route("/findOne")
    .get(authenticationToken, adminPermission("view_user"), authController.getOne)

authRouter
    .route("/signup")
    .post(authController.signup)

authRouter
    .route("/login")
    .post(authController.login)

authRouter
    .route("/guest")
    .post(authController.guest)

authRouter
    .route("/logout")
    .post(authenticationToken, authController.logout)

authRouter
    .route("/user/remove")
    .delete(authenticationToken, adminAccess, authController.removeUser)

authRouter
    .route("/user/update/:id")
    .put(authenticationToken, authController.updateUser)

module.exports = authRouter