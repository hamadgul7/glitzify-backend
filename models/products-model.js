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

    buyingCost: {
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