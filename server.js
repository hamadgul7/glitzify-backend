const express = require('express');
require('dotenv').config();
const db = require('./config/db.js');

const productRoutes = require('./routes/admin/product-routes.js');
const authRoutes = require('./routes/user/auth-routes.js');
const reviewRoutes = require('./routes/user/productReview-routes');
const orderRoutes = require('./routes/order-routes');
const dashboardStatsRoutes = require('./routes/admin/dashboardStats-routes.js');
const userDetailsRoutes = require('./routes/user/profileDetail-routes.js');
const wishlistRoutes = require('./routes/user/wishlist-routes.js');


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
app.use('/admin', orderRoutes);
app.use('/admin', dashboardStatsRoutes);
app.use('/admin', reviewRoutes);

app.use('/user', productRoutes);
app.use('/user', userDetailsRoutes);
app.use('/auth', authRoutes);
app.use('/user', reviewRoutes);
app.use('/user', orderRoutes);
app.use('/user', wishlistRoutes);


db.connectToDatabase()
.then(function(){
    app.listen(3000)
})
.catch(function(error){
    console.log('Failed to Connect to the Database')
    console.log(error);
})