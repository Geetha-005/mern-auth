import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
const { JsonWebTokenError } = jwt;

import userModel from "../models/userModel.js"; // Ensure correct path



export const register = async (req,res)=>{
    const {name,email,password} = req.body;


    if(!name || !email || !password){
        return res.json({success:false,message:'missing details'})

    }
    try{
        const existingUser=await userModel.findOne({email})
        if(existingUser){
            return res.json({success:false,message:"user already existed"});


        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user=new userModel({name,email,password:hashedPassword})
        await user.save();

        //const token= jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'7d'});
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });


        res.cookie('token',token, {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production' ? 'none':'strict',
            maxAge:7*24*60*60*1000

        });
// sending the welcome email
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:'welcome to our team',
            text:`welcome to our team hpe you are doing great ad all the best 
            your account has been created with email id:${email}`

        }
        await transporter.sendMail(mailOptions);



        return res.json({success:true});

    }
    catch(error){
        res.json({success:false,message:error.message})

    }
}

export const login= async (req,res)=>{
    const {email,password}=req.body;

    if(!email ||! password){
        return res.json({success:false,message:"email and password are required"});
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'invalid eamil'})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:'invalid passwrd'});

        }
        
        const token= jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token, {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production' ? 'none':'strict',
            maxAge:7*24*60*60*1000

        });
        return res.json({success:true});



    }
    catch(err)
    {
        return res.json({success:false,message:err.message});

    }



}

export const logout=async (req,res)=>{

    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production' ? 'none':'strict',

        })
        return res.json({success:true , message:'logged out'});

    }
    catch(err){
        return res.json({success:false,message:err.message});
    }
}

//  verify the otp of user email id
export const sendVerifyOtp=async (req,res)=>{
    try{
        const {userId}=req.body;

        const user=await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success:false,message:'account already verified'});

        }
        const otp=String(Math.floor(100000+Math.random()*900000));

        user.verifyOtp=otp;
        user.verifyOtpExpireAt=Date.now()+ 24*60*60*1000

        await user.save();

        const mailOption={
            from:process.env.SENDER_EMAIL,
            to: user.email,
            subject:'Account verification OTP',
            text:`Your otp is:${otp}. Verify your account using this otp. `

        }

        await transporter.sendMail(mailOption);
        res.json({success:true,message:'Verification otp set on your registered email'});


    }
    catch(err){
        res.json({success:false,message:err.message});

    }
}

//verify teh email using otp


export const verifyEmail=async (req,res)=>{
    const {userId,otp}=req.body;

    if(!userId || !otp){
        return res.json({success:false,message:'missing details'});

    }

    try{
        const user=await userModel.findById(userId);


        if(!user){
            return res.json({success:false,message:'user not  found'});
        }

        if(user.verifyOtp==='' || user.verifyOtp!==otp){

            return res.json({success:false,message:'invalid otp'});

        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:'otp expired'});
        }

        user.isAccountVerified=true;
        user.verifyOtp='';
        user.verifyOtpExpireAt=0;

        await user.save();

        return res.json({success:true,message:'email verified successfully'});


    }
    catch(err){
         res.json({success:false,message:err.message});


    }


}

// chek if user is authenticated

export const isAuthenticated=async(req,res)=>{

    try{
        return res.json({success:true});

    }
    catch(err){
        res.json({success:false,message:err.message})
    }

}


// send password reset otp


export const sendResetOtp=async(req,res)=>{
    const{email}=req.body;

    if(!email){
        return res.json({success:false,message:'email is required'});

    }
    try{

        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'user not found'});
        }
        const otp=String(Math.floor(100000+Math.random()*900000));

        user.resetOtp=otp;
        user.resetOtpExpireAt=Date.now()+ 15*60*60*1000

        await user.save();

        const mailOption={
            from:process.env.SENDER_EMAIL,
            to: user.email,
            subject:'password reset  OTP',
            text:`Your otp for resetting  your password is ${otp}.
            Use this otp to procedd with resetting your password`

        }
        await transporter.sendMail(mailOption);

        return res.json({success:true,message:'OTP sent to your email'});


    }
    catch(err){
        return res.json({success:false,message:err.message});

    }
}


// reset user password

export const resetPassword=async(req,res)=>{
    const{email,otp,newPassword}=req.body;


    if(!email || !otp|| !newPassword){
        return res.json({success:false,message:'Email,Otp  amd NewPassord is required'});

    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'user not found'});
        }
        if(user.resetOtp==='' || user.resetOtp!==otp){
            return res.json({success:false,message:'invalid otp'});
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false,message:'OTP expired'});

        }

        const hashedPassword=await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        user.resetOtp='';
        user.resetOtpExpireAt=0;

        await user.save();


        return res.json({success:true,message:'password has been reset successfully'});
    }
    catch(err){
        return res.json({success:false,message:err.message});
    }
}