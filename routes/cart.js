const express = require('express');
const Router = express.Router();
const Cart =require('../models/Cart');
const CryptoJS= require('crypto-js');

const  {verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken') ;
Router.post('/', verifyTokenAndAuthorization,async (req, res) => {
    const newCart = new Product(req.body)
    try{
        const savedCart = await newCart.save();
        res.status(200).json(savedCart);
    }catch(err){
        res.status(500).json(err);
    }
})
Router.put('/:id', verifyTokenAndAuthorization , async (req, res)=>{
    
    try{
        console.log(req.params.id);
        console.log(req.body);
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id
        ,{
        $set :req.body
        },{new:true});
        if (!updatedProduct) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedProduct)
    }
    catch(err){
        res.status(500).json(err);
    }
})
//DELETE
Router.delete("/:id",verifyTokenAndAuthorization,async (req,res)=>{
    try{
        await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json("Cart deleted Successfully...");
    }
    catch(error){
        res.status(500).json(error);
    }   
})
//GET CARTS
Router.get("/",verifyTokenAndAdmin,async (req,res)=>{

    try{
        const Carts = await Cart.find();
        res.status(200).json(Carts);
        }
    catch(error){
        res.status(500).json(error);
    }   
})
//GET USER CART
Router.get("/find/:userId",verifyTokenAndAuthorization,async (req,res)=>{
    try{
        const cart = await Cart.findOne({userId:req.params.userId});
        const {password , ...others}= cart._doc;
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