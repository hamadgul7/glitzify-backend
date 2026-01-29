const mongoose = require("mongoose");  

const variantSchema = new mongoose.Schema({
    size: { 
        type: String, 
    },

    color: { 
        type: String, 
    },

    quantity: { 
        type: Number, 
        required: true, 
    }
});

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    imagePath: {
        type: [String],
        default: []
    },

    price: {
        type: Number,
        required: true
    }, 

    category: {
        type: String,
        enum: ["jewellery", "hair-accessories", "bags", "press-on-nails"],
        required: true
    },

    subCategory: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                const allowed = {
                    "jewellery": ["ring", "earrings", "bracelet", "pendants", "necklace", "hand-cuffs"],
                    "hair-accessories": ["bows", "clips"],
                    "bags": ["hand-bags", "wallets", "clutches"],
                    "press-on-nails": ["daily-wear", "festive-collection"]
                };
                return allowed[this.category]?.includes(value);
            },
            message: props => {
                const category = props.instance.category;
                return `Oops! "${props.value}" is not a valid subcategory for "${category}". Please choose a correct option.`;
            }
        }
    },


    variants: {
        type: [variantSchema],
        default: []
    },

    totalQuantity: {
        type: Number,
        default: 0
    },

    isBestSeller: {
        type: Boolean,
        default: false
    },

    isNewArrival: {
        type: Boolean,
        default: false
    },

    isFeatured: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;












































// const mongoose = require('mongoose');


// const colorSchema = new mongoose.Schema({
//     color: { 
//         type: String, 
//     },

//     quantity: { 
//         type: Number, 
//         required: [true, "Quantity is required"] 
//     },
// });

// const variantSchema = new mongoose.Schema({
//     colors: [colorSchema], 

//     size: { 
//         type: String, 
//     }, 

//     sizeQuantity: { 
//         type: Number, 
//         default: 0 
//     },
    
//     variantTotal: { 
//         type: Number, 
//         required: true 
//     },
// });


// const productSchema = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: [true, "Product title is required"]
//         },

//         description: {
//             type: String,
//             required: [true, "Product Description is require"]
//         },

//         imagePath: {
//             type: [String]
//         },

//         price: {
//             type: Number,
//             required: [true, "Product Price is required"]
//         },

//         category: {
//             type: String,
//             enum: ["Jwellery", "Hair Accessories"],
//             required: [true, "Product Category is required"]
//         },

//         subCategory: {
//             type: String,
//             required: [true, "Product SubCategory is required"],
//             validate: {
//                 validator: function(value) {
//                     const allowed = {
//                         "Jwellery": ["Ring", "Earrings", "Bracelet", "Pendants"],
//                         "Hair Accessories": ["Bows", "Clips"]
//                     };
//                     return allowed[this.category]?.includes(value);
//                 },
//                 message: props => `${props.value} is not a valid subCategory for ${props.instance.category}`
//             }
//         },

//         variants: {
//             type: [variantSchema],
//             default: []
//         },


//         totalQuantity: {
//             type: Number
//         }
//     },
// );

// const Product = mongoose.model("Product", productSchema);
// module.exports = Product;