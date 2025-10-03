const UserModel = require("../models/User")

const adminAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        const user = await UserModel.findById(req.user.id).select('role').lean()

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }

        if (user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            })
        }

        req.adminUser = user

        next();

    } catch (err) {
        console.error("Admin middleware Error", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}

const adminAccessSimple = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        if (req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            })
        }

        next()

    } catch (error) {
        console.error("Admin middleware Error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const adminPermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                })
            }

            const user = await UserModel.findById(req.user.id).select('role permissions')

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                })
            }

            if (user.role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required."
                })
            }

            if (user.permissions && !user.permissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Permission '${permission}' required.`
                })
            }

            req.adminUser = user

            next()

        } catch (error) {
            console.error("Admin middleware Error", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}

module.exports = {
    adminAccess,
    adminAccessSimple,
    adminPermission
}