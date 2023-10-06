const express = require('express');
const Router = express.Router();
const Product =require('../models/Product');
const CryptoJS= require('crypto-js');

const  {verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken') ;
Router.post('/', verifyTokenAndAdmin,async (req, res) => {
    const newProduct = new Product(req.body)
    try{
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    }catch(err){
        res.status(500).json(err);
    }
})
Router.put('/:id', verifyTokenAndAuthorization , async (req, res)=>{
    try{

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id
        ,{
        $set :req.body
        },{new:true});
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
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
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product deleted Successfully...");
    }
    catch(error){
        res.status(500).json(error);
    }   
})
//GET Product
Router.get("/",async (req,res)=>{
    const qNew = req.query.new
    const qCategory = req.query.category
    try{
        let products;
        if(qNew){
            products = await Product.find().sort({createdAt:-1}).limit(5);
        }else if(qCategory){
            products = await Product.find({categories:{
            $in:[qCategory],
            }
        });
        }else{
            products = await Product.find();
        }
        res.status(200).json(products);
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