var express = require('express');
var router = express.Router();

// Bikes available in shop
var dataBike = [{name:"Cruzer", url:"/images/cruzer.png", price:2800}, {name:"Torino", url:"/images/torino.png", price:2850},{name:"Clubman", url:"/images/clubman.png", price:1999},{name:"Beachin", url:"/images/beachin.png", price:1999},{name:"Ambassador", url:"/images/ambassador.png", price:3650},{name:"Cruzer", url:"/images/cruzer.png", price:2800}];

//  home page
router.get('/', function(req, res, next) {
  // Initialize bikes in basket
  if (req.session.dataCardBike === undefined) {
    req.session.dataCardBike = [];
  }
  res.render('index', { dataBike });
});

// ADD bike to basket with button
router.get('/buy', function(req, res, next) {
  var alreadyExists = false;
  for (var i = 0 ; i < req.session.dataCardBike.length ; i++) {
    if (req.query.name === req.session.dataCardBike[i].name) {
      alreadyExists = true;
      req.session.dataCardBike[i].quantity +=1;
    } 
  } 
    if (alreadyExists === false) { 
      req.session.dataCardBike.push({name:req.query.name, url:req.query.url, quantity:1, price: req.query.price}); }
  res.render('basket', { dataCardBike : req.session.dataCardBike});
});

// DELETE bike from Basket
router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query,1);
  res.render('basket', { dataCardBike : req.session.dataCardBike});
});

// UPDATE number of bikes in basket
router.post('/update-shop', function(req, res, next) {
  req.session.dataCardBike[req.body.row].quantity = req.body.quantity;
  res.render('basket', {  dataCardBike : req.session.dataCardBike});
});

// PAY with Stripe payment (from basket Checkout button)
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51I9oqyFmAqdb1W4LOU619lUzGM9ChPl1Uy7lJVMkxu7oQh8sca8bTRzz7Yj7qoGKJXKYhAjukVbsMnwK6LhjCDp900hZUF8SWs');

router.post('/create-checkout-session', async (req, res) => {
  var items = [];
  for (var i = 0 ; i < req.session.dataCardBike.length ; i++ ) {
    items.push({price_data:{currency: 'eur', product_data: {name : req.session.dataCardBike[i].name}, unit_amount: req.session.dataCardBike[i].price*100}, quantity: req.session.dataCardBike[i].quantity});
  }

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
