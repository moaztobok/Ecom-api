const { error } = require('console');
const express = require('express');
const app = express();
const port = 5000
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data
dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then((client)=>{
    console.log('Connectted to MongoDB');
}
).catch((err)=>{
    console.log(err);
});

app.use(express.json());
app.use('/api/products',productRoute)
app.use('/api/card',cartRoute)
app.use('/api/users',userRoute);
app.use('/api/auth', authRoute);
app.listen(process.env.PORT||port, ()=>{
    console.log('listening on port : ' + port);
});