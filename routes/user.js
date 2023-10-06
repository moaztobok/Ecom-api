const express = require('express');
const Router = express.Router();
const User =require('../models/User');
const CryptoJS= require('crypto-js');

const  {verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken') ;
Router.put('/:id', verifyTokenAndAuthorization , async (req, res)=>{
    if(req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password,
             process.env.PASSWORD_SEC
             ).toString();
    }
    try{
        console.log(req.params.id);
        console.log(req.body);
        const updateUser = await User.findByIdAndUpdate(req.params.id
        ,{
        $set :req.body
        },{new:true});
        if (!updateUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updateUser)
    }
    catch(err){
        res.status(500).json(err);
    }
})
//DELETE
Router.delete("/:id",verifyTokenAndAuthorization,async (req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User deleted Successfully...");
    }
    catch(error){
        res.status(500).json(error);
    }   
})
//GET USERS
Router.get("/",verifyTokenAndAdmin,async (req,res)=>{
    const query = req.query.new
    try{
        const users = query ? await User.find().sort({_id:-1}).limit(5): await User.find();
        res.status(200).json(users);
    }
    catch(error){
        res.status(500).json(error);
    }   
})
//GET USER
Router.get("/find/:id",verifyTokenAndAdmin,async (req,res)=>{
    try{
        const user = await User.find(req.params.id);
        const {password , ...others}= user._doc;
        res.status(200).json({others});
    }
    catch(error){
        res.status(500).json(error);
    }   
})
Router.get("/stats",verifyTokenAndAdmin, async (req, res) => {
    const date  = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    try{
        const data = await User.aggregate([
            {$match : { createdAt: {$gte:lastYear}  }   },
            {
                $project:{
                    month:{ $month: "$createdAt"}
                }
            },
            {
                $group: {
                    _id:"$month",
                    total:{$sum: 1},
                },
            },
        ])
        console.log(data);
        res.status(200).json(data);
    }catch(error){
        res.status(500).json(error);
    }
})
module.exports = Router