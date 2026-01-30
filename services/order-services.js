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
        const { productId, variants } = item;

        if (!productId) {
            throw { statusCode: 400, message: "productId is required" };
        }

        const dbProduct = await Product.findById(productId);
        if (!dbProduct) {
            throw { statusCode: 404, message: "Product not found" };
        }

        if (!variants || !variants.length) {
            throw {
                statusCode: 400,
                message: `No variants provided for product ${dbProduct.title}`
            };
        }

        const productSnapshot = {
            _id: dbProduct._id,
            title: dbProduct.title,
            price: dbProduct.price,
            imagePath: dbProduct.imagePath
        };

        const finalVariants = [];

        for (const variantItem of variants) {
            const { quantity, selectedVariant } = variantItem;

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

            if (variant.quantity < quantity) {
                throw {
                    statusCode: 400,
                    message: `Insufficient stock for ${dbProduct.title} (${selectedVariant.size}, ${selectedVariant.color})`
                };
            }

            variant.quantity -= quantity;
            dbProduct.totalQuantity -= quantity;

            subTotal += dbProduct.price * quantity;

            finalVariants.push({
                quantity,
                selectedVariant
            });
        }

        await dbProduct.save();

        finalCartItems.push({
            product: productSnapshot,
            variants: finalVariants
        });
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
                                ${product.title} (${size}, ${color})
                            </td>
                            <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                                ${qty}
                            </td>
                            <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                                $${price * qty}
                            </td>
                        </tr>
                    `;
                })
                .join("");
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
            <strong>Total Amount:</strong> $${totalAmount}
        </p>
    `;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"Your Store" <${process.env.EMAIL_USER}>`,
        to: user.email, 
        subject: "Order Confirmation",
        html
    });
}


module.exports = {
    placeOrder
};
