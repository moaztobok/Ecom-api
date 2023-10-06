const express = require('express');
const Router = express.Router();
const User = require('../models/User');
const CryptoJS= require('crypto-js');
const jwt = require('jsonwebtoken');
Router.post('/register', async (req,res)=>{
    var encryptedPass = CryptoJS.AES.encrypt(req.body.password, process.env.PASSWORD_SEC).toString();
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: encryptedPass,
    });
    try{
        const response = await newUser.save()
        console.log(response);
        res.status(201).json(response);


    }
    catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})
Router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne({username: req.body.username})
        !user && res.status(401).json("Wrong Credientials")
        const hashedPass =CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_SEC);
        const OriginalPassword = hashedPass.toString(CryptoJS.enc.Utf8);
        OriginalPassword !== req.body.password && res.status(401).json("Wrong Credientials")
        const acessToken = jwt.sign({
            id:user._id,
            isAdmin : user.isAdmin,
        },process.env.JWT_SEC,
        {expiresIn:"3d"});
        const {password , ...others}= user._doc;
        res.status(200).json({others,acessToken});
    }catch(err){
        console.log(err)
    }
})
module.exports = Router