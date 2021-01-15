
// Stripe checkout
var stripe = Stripe('pk_test_51I9oqyFmAqdb1W4LsVu9LvRD4zkXlulnpMheqapCfgqYxatb8acLvMtyyInnsmd8cG5vjkrnlkL65vJnT7MGaLXf00YEVkQZTG');
      var checkoutButton = document.getElementsByClassName('checkout-button');
      checkoutButton[0].addEventListener('click', function() {
        fetch('/create-checkout-session', {
          method: 'POST',
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(session) {
          return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function(result) {
          if (result.error) {
            alert(result.error.message);
          }
        })
        .catch(function(error) {
          console.error('Error:', error);
        });
      });