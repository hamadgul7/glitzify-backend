const Order = require("../models/orders-model");
const Product = require("../models/products-model");
const User = require("../models/user/user-model");
const nodemailer = require("nodemailer");

async function placeOrder(body) {
    const { userId, data, cartItems, shippingCost = 0 } = body;

    if (!userId) {
        throw { statusCode: 400, message: "No userId provided" };
    }

    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: "User not found" };
    }

    const userInfo = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: data.email,
        address: data.address,
        city: data.city,
        postal: data.postal,
        phone: data.phone,
        paymentMethod: data.paymentMethod
    };

    let subTotal = 0;
    const finalCartItems = [];

    for (const item of cartItems) {
        const { productId, variants, quantity } = item;

        if (!productId) {
            throw { statusCode: 400, message: "productId is required" };
        }

        const dbProduct = await Product.findById(productId);
        if (!dbProduct) {
            throw { statusCode: 404, message: "Product not found" };
        }

        const productSnapshot = {
            _id: dbProduct._id,
            title: dbProduct.title,
            price: dbProduct.price,
            buyingCost: dbProduct.buyingCost,
            imagePath: dbProduct.imagePath
        };

        if (variants && variants.length) {
            const finalVariants = [];

            for (const variantItem of variants) {
                const { quantity: varQty, selectedVariant } = variantItem;

                const variant = dbProduct.variants.find(v =>
                    v.size === selectedVariant.size &&
                    v.color === selectedVariant.color
                );

                if (!variant) {
                    throw {
                        statusCode: 404,
                        message: `Variant not found for ${dbProduct.title} (${selectedVariant.size}, ${selectedVariant.color})`
                    };
                }

                if (variant.quantity < varQty) {
                    throw {
                        statusCode: 400,
                        message: `Insufficient stock for ${dbProduct.title} (${selectedVariant.size}, ${selectedVariant.color})`
                    };
                }

                variant.quantity -= varQty;
                dbProduct.totalQuantity -= varQty;

                subTotal += dbProduct.price * varQty;

                finalVariants.push({
                    quantity: varQty,
                    selectedVariant
                });
            }

            finalCartItems.push({
                product: productSnapshot,
                variants: finalVariants
            });
        } 

        else if (quantity && !dbProduct.variants.length) {
            if (dbProduct.totalQuantity < quantity) {
                throw {
                    statusCode: 400,
                    message: `Insufficient stock for ${dbProduct.title}`
                };
            }

            dbProduct.totalQuantity -= quantity;
            subTotal += dbProduct.price * quantity;

            finalCartItems.push({
                product: productSnapshot,
                variants: [
                    {
                        quantity,
                        selectedVariant: null
                    }
                ]
            });
        } else {
            throw {
                statusCode: 400,
                message: `Invalid cart item for ${dbProduct.title}`
            };
        }

        await dbProduct.save();
    }

    const totalAmount = subTotal + shippingCost;

    const order = await Order.create({
        userId,
        userInfo,
        cartItems: finalCartItems,
        status: "Pending",
        subTotal,
        shippingCost,
        totalAmount
    });

    await sendOrderEmail(userInfo, finalCartItems, totalAmount);

    return order;
}


async function sendOrderEmail(user, cartItems, totalAmount) {
    if (!user?.email) {
        throw {
            statusCode: 400,
            message: "User email not found. Cannot send order confirmation email."
        };
    }

    const productRows = cartItems
        .map(item => {
            const product = item.product;

            if (item.variants && item.variants.length) {
                return item.variants
                    .map(variant => {
                        const size = variant?.selectedVariant?.size || "N/A";
                        const color = variant?.selectedVariant?.color || "N/A";
                        const qty = variant.quantity || 0;
                        const price = product.price || 0;
                        const image =
                            Array.isArray(product.imagePath) && product.imagePath.length
                                ? product.imagePath[0]
                                : "";

                        return `
                            <tr>
                                <td style="border:1px solid #ddd; padding:8px;">
                                    ${image ? `<img src="${image}" width="80" />` : ""}
                                </td>
                                <td style="border:1px solid #ddd; padding:8px;">
                                    ${product.title}${variant.selectedVariant ? ` (${size}, ${color})` : ""}
                                </td>
                                <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                                    ${qty}
                                </td>
                                <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                                    RS.${price * qty}
                                </td>
                            </tr>
                        `;
                    })
                    .join("");
            } 

            else if (item.variants && item.variants.length === 1 && !item.variants[0].selectedVariant) {
                const qty = item.variants[0].quantity || 0;
                const price = product.price || 0;
                const image =
                    Array.isArray(product.imagePath) && product.imagePath.length
                        ? product.imagePath[0]
                        : "";

                return `
                    <tr>
                        <td style="border:1px solid #ddd; padding:8px;">
                            ${image ? `<img src="${image}" width="80" />` : ""}
                        </td>
                        <td style="border:1px solid #ddd; padding:8px;">
                            ${product.title}
                        </td>
                        <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                            ${qty}
                        </td>
                        <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                            RS.${price * qty}
                        </td>
                    </tr>
                `;
            }
            return "";
        })
        .join("");

    const html = `
        <h2>Hello ${user.firstname || "Customer"},</h2>
        <p>Thank you for your order! 🎉</p>

        <table width="100%" style="border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="border:1px solid #ddd; padding:8px;">Product</th>
                    <th style="border:1px solid #ddd; padding:8px;">Name & Variant</th>
                    <th style="border:1px solid #ddd; padding:8px;">Qty</th>
                    <th style="border:1px solid #ddd; padding:8px;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${productRows}
            </tbody>
        </table>

        <p style="margin-top:16px;">
            <strong>Total Amount:</strong> RS.${totalAmount}
        </p>
    `;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false } 
    });

    await transporter.sendMail({
        from: `"Your Store" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Order Confirmation",
        html
    });
}



async function getAllOrdersService(page, limit, search) {
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
        const regexPattern = `${search.replace(/s$/, "")}s?`;

        filter["cartItems.product.title"] = {
            $regex: regexPattern,
            $options: "i"
        };
    }


    const [orders, totalOrders] = await Promise.all([
        Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(filter)
    ]);

    return {
        orders,
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit)
    };
}


async function updateOrderStatusService(orderId, status) {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error("Order not found");
    }

    order.status = status;
    await order.save();

    return order;
}

async function getUserOrdersService(userId) {
    const orders = await Order.find({ userId })
        .sort({ createdAt: -1 }); 

    return orders;
}

async function getOrderDetailsById(orderId) {
    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        return { success: true, data: order };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { success: false, message: 'Server error' };
    }
}

module.exports = {
    placeOrder,
    getAllOrdersService,
    updateOrderStatusService,
    getUserOrdersService,
    getOrderDetailsById    
};
