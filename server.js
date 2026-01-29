const express = require('express');
require('dotenv').config();
const db = require('./config/db.js');

const productRoutes = require('./routes/admin/product-routes.js');
const authRoutes = require('./routes/user/auth-routes.js');
const reviewRoutes = require('./routes/user/productReview-routes');
const orderRoutes = require('./routes/order-routes');


const cors = require('cors');

const app = express();
app.use(cors());
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/admin', productRoutes);
app.use('/user', productRoutes);
app.use('/auth', authRoutes);
app.use('/user', reviewRoutes);
app.use('/user', orderRoutes);


db.connectToDatabase()
.then(function(){
    app.listen(3000)
})
.catch(function(error){
    console.log('Failed to Connect to the Database')
    console.log(error);
})