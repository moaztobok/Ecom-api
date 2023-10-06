const express = require('express');
const Router = express.Router();
const Order =require('../models/Order');
const CryptoJS= require('crypto-js');

const  {verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken') ;
Router.post('/', verifyTokenAndAuthorization,async (req, res) => {
    const newOrder = new Product(req.body)
    try{
        const savedOrder = await newCart.save();
        res.status(200).json(savedOrder);
    }catch(err){
        res.status(500).json(err);
    }
})
Router.put('/:id', verifyTokenAndAdmin , async (req, res)=>{
    
    try{

        const updatedOrder = await Order.findByIdAndUpdate(req.params.id
        ,{
        $set :req.body
        },{new:true});
        if (!updatedOrder) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedOrder)
    }
    catch(err){
        res.status(500).json(err);
    }
})
//DELETE
Router.delete("/:id",verifyTokenAndAdmin,async (req,res)=>{
    try{
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order deleted Successfully...");
    }
    catch(error){
        res.status(500).json(error);
    }   
})
//GET ORDER
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
        const orders = await Order.find({userId:req.params.userId});
        const {password , ...others}= orders._doc;
        res.status(200).json({others});
    }
    catch(error){
        res.status(500).json(error);
    }   
})
Router.get("/stats",verifyTokenAndAdmin, async (req, res) => {
    const date  = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

    try{
        const income = await Order.aggregate([
            {$match : { createdAt: {$gte:previousMonth}  }   },
            {
                $project:{
                    month:{ $month: "$createdAt"},
                    sales:"$amount"
                }
            },
            {
                $group: {
                    _id:"$month",
                    total:{$sum: $sales},
                },
            },
        ])
        console.log(income);
        res.status(200).json(income);
    }catch(error){
        res.status(500).json(error);
    }
})
module.exports = Router