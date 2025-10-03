const jwt = require("jsonwebtoken")

const authenticationToken = (req, res, next) => {
    try {
        let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access - Authentication token not found"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()

    } catch (err) {
        console.error("JWT verification error:", err.message)

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            })
        }

        return res.status(401).json({
            success: false,
            message: "Token is invalid"
        })
    }
}

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "You must log in first."
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this section"
            })
        }

        next()
    }
}

module.exports = {
    authenticationToken,
    authorizeRoles
}
