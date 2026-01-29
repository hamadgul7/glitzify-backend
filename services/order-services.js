const Order = require("../models/orders-model");
const Product = require("../models/products-model");
const User = require("../models/user/user-model");
const nodemailer = require("nodemailer");

async function placeOrder(body) {
    const { userId, data, cartItems, shippingCost = 0 } = body;

    // 1️⃣ Validate user
    if (!userId) {
        throw { statusCode: 400, message: "No userId provided" };
    }

    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: "User not found" };
    }

    // 2️⃣ Build userInfo
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

    // 3️⃣ Validate stock & deduct quantity per variant
    for (const item of cartItems) {
        const { product, variants } = item;

        if (!product || !product._id) {
            throw { statusCode: 400, message: "Product ID missing in cart item" };
        }

        const dbProduct = await Product.findById(product._id);
        if (!dbProduct) {
            throw { statusCode: 404, message: `Product ${product.title} not found` };
        }

        if (!variants || !variants.length) {
            throw { statusCode: 400, message: `No variants provided for product ${product.title}` };
        }

        for (const variantItem of variants) {
            const { quantity, selectedVariant } = variantItem;

            const variant = dbProduct.variants.find(v =>
                v.size === selectedVariant.size &&
                v.color === selectedVariant.color
            );

            if (!variant) {
                throw {
                    statusCode: 404,
                    message: `Variant not found for product ${product.title} (${selectedVariant.size}, ${selectedVariant.color})`
                };
            }

            if (variant.quantity < quantity) {
                throw {
                    statusCode: 400,
                    message: `Not enough stock for product ${product.title} (${selectedVariant.size}, ${selectedVariant.color})`
                };
            }

            // Deduct stock
            variant.quantity -= quantity;
            dbProduct.totalQuantity -= quantity;

            // Add to subtotal
            subTotal += product.price * quantity;
        }

        await dbProduct.save();
    }

    const totalAmount = subTotal + shippingCost;

    // 4️⃣ Create order
    const order = await Order.create({
        userId,
        userInfo,
        cartItems,
        status: "Pending",
        subTotal,
        shippingCost,
        totalAmount
    });

    // 5️⃣ Send confirmation email
    await sendOrderEmail(userInfo, cartItems, totalAmount);

    return order;
}

/* ---------------- EMAIL SERVICE ---------------- */

async function sendOrderEmail(user, cartItems, totalAmount) {
    // Build product rows with variants
    const productRows = cartItems.map(item => {
        const product = item.product;

        // Each variant is a separate row
        return item.variants.map(variant => `
            <tr>
                <td style="border:1px solid #ddd; padding:8px;">
                    <img src="${product.imagePath[0]}" width="80" />
                </td>
                <td style="border:1px solid #ddd; padding:8px;">
                    ${product.title} (${variant.selectedVariant.size}, ${variant.selectedVariant.color})
                </td>
                <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                    ${variant.quantity}
                </td>
                <td style="border:1px solid #ddd; padding:8px; text-align:center;">
                    $${product.price * variant.quantity}
                </td>
            </tr>
        `).join("");
    }).join("");

    const html = `
        <h2>Hello ${user.firstname},</h2>
        <p>Thank you for your order!</p>

        <table width="100%" style="border-collapse:collapse;">
            <tr>
                <th>Product</th>
                <th>Name & Variant</th>
                <th>Qty</th>
                <th>Total</th>
            </tr>
            ${productRows}
        </table>

        <p><strong>Total Amount:</strong> $${totalAmount}</p>
    `;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false } // optional, avoids certificate issues
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Order Confirmation",
        html
    });
}

module.exports = {
    placeOrder
};
