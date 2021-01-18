var express = require('express');
var router = express.Router();

// Bikes available in shop
var dataBike = [{name:"Cruzer", url:"/images/cruzer.png", price:2800}, {name:"Torino", url:"/images/torino.png", price:2850},{name:"Clubman", url:"/images/clubman.png", price:1999},{name:"Beachin", url:"/images/beachin.png", price:1999},{name:"Ambassador", url:"/images/ambassador.png", price:3650},{name:"Cruzer", url:"/images/cruzer.png", price:2800}];

    // Initialize calculation for baskets
  // début du code de la fonction updateOrderTotal();
  updateOrderTotal = (arr) => {
    var delivery = 300;
    var productTotal = 0;
    var deliveryTotal = 0;
    var grandTotal = 0;
    for (var i = 0 ; i < arr.length ; i++) {
      productTotal += (arr[i].price * arr[i].quantity);
      deliveryTotal += (delivery * arr[i].quantity);
    }
    if (productTotal > 2000 && productTotal < 4000) {
      deliveryTotal = deliveryTotal/2;
    } else if (productTotal > 4000) {
      deliveryTotal = 0;
  }
  grandTotal = productTotal + deliveryTotal;
  return { productTotal, deliveryTotal, grandTotal};
} // fin de la fonction updateOrderTotal();


// ROUTES
// HOME PAGE
router.get('/', function(req, res, next) {
  // Initialize bikes in basket
  if (req.session.dataCardBike === undefined) {
    req.session.dataCardBike = [];
  }
  console.log(req.session.dataCardBike);
  res.render('index', { dataBike });
});

// ADD BIKE TO BASKET WITH BUTTON
router.get('/buy', function(req, res, next) {
  var alreadyExists = false;
  console.log(req.session.dataCardBike); 
  for (var i = 0 ; i < req.session.dataCardBike.length ; i++) {
    if (req.query.name === req.session.dataCardBike[i].name) {
      alreadyExists = true;
      req.session.dataCardBike[i].quantity +=1;
    } 
  } 
    if (alreadyExists === false) { 
      req.session.dataCardBike.push({name:req.query.name, url:req.query.url, quantity:1, price: req.query.price}); 
    }
  var orderTotal = updateOrderTotal(req.session.dataCardBike);
  res.render('basket', { dataCardBike : req.session.dataCardBike, productTotal : orderTotal.productTotal, deliveryTotal : orderTotal.deliveryTotal , grandTotal : orderTotal.grandTotal });
});

// DELETE BIKE FROM BASKET
router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query,1);
  var orderTotal = updateOrderTotal(req.session.dataCardBike);
  res.render('basket', { dataCardBike : req.session.dataCardBike, productTotal : orderTotal.productTotal, deliveryTotal : orderTotal.deliveryTotal , grandTotal : orderTotal.grandTotal });
});

// UPDATE NUMBER OF BIKES IN BASKET
router.post('/update-shop', function(req, res, next) {
  req.session.dataCardBike[req.body.row].quantity = req.body.quantity;
  var orderTotal = updateOrderTotal(req.session.dataCardBike);
  res.render('basket', { dataCardBike : req.session.dataCardBike, productTotal : orderTotal.productTotal, deliveryTotal : orderTotal.deliveryTotal , grandTotal : orderTotal.grandTotal });
});

// PAY with Stripe payment (from basket Checkout button)
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51I9oqyFmAqdb1W4LOU619lUzGM9ChPl1Uy7lJVMkxu7oQh8sca8bTRzz7Yj7qoGKJXKYhAjukVbsMnwK6LhjCDp900hZUF8SWs');

router.post('/create-checkout-session', async (req, res) => {
  var items = [];
  // Adding bikes
  for (var i = 0 ; i < req.session.dataCardBike.length ; i++ ) {
    items.push({
      price_data:{currency: 'eur', product_data: {name : req.session.dataCardBike[i].name}, unit_amount: req.session.dataCardBike[i].price*100 }, quantity: req.session.dataCardBike[i].quantity});
  }
  // Adding delivery fees
  var orderTotal = updateOrderTotal(req.session.dataCardBike);
  console.log(orderTotal);
  items.push({
    price_data:{currency: 'eur', product_data: {name : "Delivery fees"},unit_amount: orderTotal.deliveryTotal*100 }, quantity: 1});
    
    const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items,
    mode: 'payment',
    success_url: 'http://localhost:3000/confirmation',
    cancel_url: 'http://localhost:3000',
  });
  res.json({ id: session.id });
});

// PAYMENT CONFIRMATION when successful
router.get('/confirmation', function(req, res, next) {
  res.render('confirm');
});

module.exports = router;
