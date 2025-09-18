const Cart = require("../models/Cart");
const OrderModel = require("../models/Order");
const crypto = require('crypto');
const { nanoid } = require('nanoid');

const  Razorpay =require ('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZO_KEY ,

  key_secret: process.env.RAZO_SECRET 
});


// const mongoose = require("mongoose"); // agar populate ke liye zarurat ho

exports.fetchOrder = async (req, res) => {
  try {
    const user = req.user;
    const { role, id } = user;

    let orders = [];

    if (role === "user") {
      // Sirf current user ke successful orders
      orders = await OrderModel.find({ user: id, status: "success" })
        // .lean()
        // .populate("ebookId")
         .sort({ createdAt: -1 });

      return res.json({ orders });
    } else {
      // Admin ya other role – sabhi orders paginated
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;

      const totalCount = await OrderModel.countDocuments(); // ✅ Count total orders

      orders = await OrderModel.find()
        .sort({ createdAt: -1 })
        // .populate("ebookId")
        // .populate("user")
        .skip((page - 1) * limit)
        .limit(limit);
        // .lean();

      return res.json({
        orders,
        totalCount,   // ✅ frontend ke liye useful
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      });
    }

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.fetchAdmin = async (req, res) => {
  try {
    const user = req.user;
    const { role, id } = user;

    let orders = [];

    if (role === "user") {
      // Sirf current user ke successful orders
      orders = await OrderModel.find({ user: id, status: "success" })
        .sort({ createdAt: -1 });
    } else {
      // Admin ya other role – sabhi orders bina pagination ke
      orders = await OrderModel.find()
        .sort({ createdAt: -1 });
    }

    return res.json({ orders });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};





exports.generateOrder = async (req, res) => {
  try {

    // Step 1: Logged-in user ki ID se uska cart database se dhoondhein.
    // Hum frontend se koi amount ya product ID nahi le rahe hain. Yeh surakshit hai.
    const userId = req.user._id; // Yeh ID aapke authentication middleware se aani chahiye
    const cart = await Cart.findOne({ user: userId });

    // Step 2: Check karein ki cart hai ya nahi, aur usme items hain ya nahi.
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Aapka cart khaali hai ya mila nahi." });
    }

    // Step 3: Cart ke database se subtotal (totalAmount) lein.
    const subtotal = cart.totalAmount;

    // Step 4: Backend par shipping, tax, aur final total calculate karein.
    // Yeh wahi logic hai jo aap frontend par use kar rahe hain.
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08;
    const finalTotal = subtotal + shipping + tax;
    

    // Step 5: Razorpay ke liye order options taiyar karein.
    // Amount hamesha 'paise' mein hona chahiye, isliye 100 se multiply karein.
    const options = {
      amount: Math.round(finalTotal * 100), // Floating point se bachne ke liye Math.round()
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`, // Ek unique receipt ID
      notes: {
        cartId: cart._id, // Reference ke liye cart ki ID save kar sakte hain
        userId: userId,
      }
    };

    // Step 6: Razorpay order banayein.
    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Razorpay order banane mein samasya hui." });
    }

    // Step 7: Naya banaya gaya order frontend ko response mein bhej dein.
    res.status(200).json(order);

  } catch (error) {
    console.error("Order generate karne mein error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.paymentWebhook = async (req, res) => {
console.log("Webhook endpoint hit");
  console.log("Webhook payload received:", req.body);
  const event = req.body.event;
  const payment = req.body.payload.payment.entity;

  if (event === 'payment.captured') {
    try {
      const { cartId } = payment.notes;
      const cart = await Cart.findById(cartId);

      if (!cart) {
        console.error(`Webhook Error: Cart ID ${cartId} se koi cart nahi mila.`);
        return res.status(200).json({ success: true, message: 'Cart not found but acknowledged.' });
      }

      // Naya order banayein
      await OrderModel.create({
        orderNumber: nanoid(10),
        user: cart.user,
        ebookIds: cart.items.map(item => item.product),
        paymentId: payment.id,
        amount: Math.round(payment.amount / 100),
        discount: payment.notes.discount || 0,
        status: 'success'
      });
      
      // Cart ko khaali karein
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
      
      console.log("Order created and cart cleared successfully.");

    } catch (dbError) {
      console.error("Webhook database error for captured payment:", dbError);
      // Client ko batayein ki aapne webhook prapt kar liya hai, bhale hi database mein samasya ho
      return res.status(200).json({ success: true, message: 'Error processing internally, but acknowledged.' });
    }
  } else if (event === 'payment.failed') {
    try {
      const { cartId } = payment.notes;
      const cart = await Cart.findById(cartId);

      if (!cart) {
        console.error(`Webhook Error: Failed payment for non-existent Cart ID ${cartId}.`);
        return res.status(200).json({ success: true, message: 'Cart not found for failed payment.' });
      }

      // Asaphal order ka record banane ke liye ek naya order banayein
      await OrderModel.create({
        orderNumber: nanoid(10),
        user: cart.user,
        ebookIds: cart.items.map(item => item.product),
        paymentId: payment.id,
        amount: Math.round(payment.amount / 100),
        discount: payment.notes.discount || 0,
        status: 'failed' // <-- Status ko 'failed' set karein
      });

      // Is maamle mein cart ko khaali na karein, taaki user phir se koshish kar sake
      console.log("Failed payment recorded for Cart ID:", cartId);

    } catch (dbError) {
      console.error("Webhook database error for failed payment:", dbError);
      return res.status(200).json({ success: true, message: 'Error processing internally, but acknowledged.' });
    }
  }
  
  res.status(200).json({ status: 'success', message: 'Webhook received and processed' });
};
// exports.paymentWebhook = async (req, res) => {


//   // ...
//   const event = req.body.event;
//   const payment = req.body.payload.payment.entity;

//   if (event === 'payment.captured') {
//     try {
//       const { cartId } = payment.notes;
//       const cart = await Cart.findById(cartId);

//       if (!cart) {
//         console.error(`Webhook Error: Cart ID ${cartId} se koi cart nahi mila.`);
//         return res.status(200).json({ success: true, message: 'Cart not found but acknowledged.' });
//       }

//       // Naya order banayein
//       await OrderModel.create({
//         // === YAHAN BADLAAV KIYA GAYA HAI ===
//         orderNumber: nanoid(10), // <-- STEP 2: Har baar ek 10-character ki unique ID banayega

//         user: cart.user,
//         ebookIds: cart.items.map(item => item.product),
//         paymentId: payment.id,
//         amount: Math.round(payment.amount / 100),
//         discount: payment.notes.discount || 0,
//         status: 'success'
//       });
      
//       // Cart ko khaali karein
//       cart.items = [];
//       cart.totalAmount = 0;
//       await cart.save();
      
//       console.log("Order created and cart cleared successfully.");

//     } catch (dbError) {
//       // Is error ko log karein taaki aapko pata chale
//       console.error("Webhook database error:", dbError);
//       return res.status(200).json({ success: true, message: 'Error processing internally, but acknowledged.' });
//     }
//   }
  
//   res.status(200).json({ status: 'success', message: 'Webhook received and processed' });
// };