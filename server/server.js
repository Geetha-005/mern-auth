import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';

import  authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
connectDB();


const allowedOrigins=['http://localhost:5173/']

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from frontend
  credentials: true
})); 
// app.use(cors({
//   origin: allowedOrigins, // Adjust based on your frontend
//   credentials: true
// }));

console.log("Starting server...");

//9JOF30jNCIbtm8A5.....pass
//geetachilla4 ...name


// api endpoints

app.get('/',(req,res)=>{
    res.send('get method is running!')
})

app.use('/api/auth',authRouter)

app.use('/api/user',userRouter);



app.listen(port, () => console.log(`Server started on PORT: ${port}`));
