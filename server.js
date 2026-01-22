const express = require('express');
require('dotenv').config();
const db = require('./config/db.js');
const path = require('path');

const productRoutes = require('./routes/admin/product-routes.js');


const cors = require('cors');

const app = express();
app.use(cors());
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/admin', productRoutes);


db.connectToDatabase()
.then(function(){
    app.listen(3000)
})
.catch(function(error){
    console.log('Failed to Connect to the Database')
    console.log(error);
})