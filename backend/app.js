import express from "express";
import { errorMiddleWare } from "./Middleware/error.js";
import userRoute from "./Routes/userRoutes.js";
import cookieParser from 'cookie-parser'
import session from 'express-session'
const app = express();
app.use(express.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // set to true if you're using HTTPS
      maxAge: 60000 // 1 minute
    }
}))    
app.use(cookieParser());

app.use("/" , userRoute )


app.use(errorMiddleWare)
export default app