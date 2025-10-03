const app = require("./src/app")
const dotenv = require("dotenv")
const mongoose = require("mongoose")

//* load env variables

const productionMode = process.env.NODE_ENV === "production"
if (!productionMode) {
    dotenv.config()
}

//* DataBase Connection 

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to DataBase ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`Error Connecting to DataBase: ${error.message}`);
        process.exit(1)
    }
}

//* start the server

function startServer() {
    const port = process.env.PORT || 9500;
    app.listen(port, () => {
        console.log(`server is running on port ${productionMode ? "production" : "development"} mode on port ${port}`);
    })
}

//* start the application

async function run() {
    try {
        await connectDB();
        startServer();
    } catch (error) {
        console.log(`Error in running the application ${error.message}`);
        process.exit(1)
    }
}

run();