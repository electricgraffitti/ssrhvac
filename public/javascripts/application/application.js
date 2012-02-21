// ctrl + alt + f for quick formatter

var Forms = {

  initForms: function(attribute){
    Forms.selectInternational();
    Forms.addSpecialCodeButton();
    Forms.paymentMethodRadioSelect();
  },
  
  paymentMethodRadioSelect: function() {
    var radioButtons = $(".payment_method");

    radioButtons.click(function() {
      var ccFields = $("#credit_card_fields"),
          directBilling = $('#direct_billing'),
          paymentHeader = $("#payment_header"),
          billingFirstName = $("#billing_first_name"),
          billingLastName = $("#billing_last_name");

      if ($(this).val() === "direct") {
        ccFields.hide();
        directBilling.val(true);
        paymentHeader.html("Account Holder Information");
        billingFirstName.html("First Name");
        billingLastName.html("Last Name");
      } else {
        ccFields.show();
        directBilling.removeAttr("value");
        paymentHeader.html("Payment Information");
        billingFirstName.html("Billing first name");
        billingLastName.html("Billing last name");
      }

    });

  },

  selectInternational: function() {
    var intCheckbox = $("#international"),
        stateSelect = $("#subscription_billing_address_state");
        
    intCheckbox.click(function() {
      if ($(this).is(':checked')) {
        stateSelect.val("INT");
      } else {
        $(this).attr('checked', false);
        stateSelect.val("");
      }
    });
  },
  
  addSpecialCodeButton: function () {
    var formBlock = $("#special_code");

    formBlock.append("<div class='field inline_field no_label'><a href='' id='code_check' class='button purple_button'>Check Code</a></div>");
    formBlock.append("<div id='code_response'></div>");
    Forms.checkForUsedSpecialCode();
  },
  
  checkForUsedSpecialCode: function() {
    var button = $("#code_check"),
        codeResponseBlock = $("#code_response"),
        ccFields = $("#credit_card_fields"),
        sidebarPrice = $(".plan_price"),
        code = $("#special_discount_code"),
        directBilling = $('#direct_billing');
    
    button.click(function(e) {
      e.preventDefault();

      codeResponseBlock.html("");
      
      if (code.val() === "") {
        codeResponseBlock.append("<p class='red injected'>Not a valid code. Please try again.</p>");
      } else {
        $.ajax({
          url: "/special-code-check",
          data: {discount_code:code.val()},
          dataType: "json",
          success: function(response) {
            if (response == null || response.activated === true) {
              codeResponseBlock.append("<p class='red'>Invalid Code. Please try again.</p>");
            } else {
              ccFields.remove();
              codeResponseBlock.append("<p class='green injected'>Discount Applied. Total Cost $0.00</p>");
              sidebarPrice.html("$0.00");
              directBilling.val(true);
            }
          },
          error: function(response) {
            codeResponseBlock.append("<p class='red'>Invalid Code. Please try again.</p>");
          }
        });
      }
      
    });
  }
};

var Navigation = {

  setCurrentNav: function() {
    var url = location.pathname,
        all_links = $('ul#main_nav li'),
        current_link = $('ul#main_nav li a[href$="' + url + '"]'),
        active_link = current_link.parent("li");

    if (url == "/") {
      all_links.removeClass('active');
      $('.home').addClass('active');
    } else {
      all_links.removeClass('active');
      active_link.addClass('active');
    }
  }
};

var Gateway = {
  
  formSubmit: function(chargeAmount){
    $("#new_subscription").submit(function(event) {
      var submitButton = $(this).find(".submit-button"),
          actionsDiv = $(this).find(".actions"),
          directBilling = $(this).find("#direct_billing");

        if (directBilling.val() === "") {
          event.preventDefault();
          Gateway.stripeVerify($(this), chargeAmount);
          actionsDiv.append(Ajax.ajaxIcon);
          submitButton.attr("disabled", "disabled");
        }
    });
  },

  stripeVerify: function(stripeForm, chargeAmount) {
    var self = stripeForm,
        cardNumber = self.find("#credit_card_card_number").val(),
        cardCvc = self.find("#credit_card_verification_value").val(),
        cardMonth = self.find("#credit_card_month").val(),
        cardYear = self.find("#credit_card_year").val(),
        amount = (chargeAmount * 1000); // Stripe expects amount to be in cents

      if (cardNumber.length) {
          // Submit Values to Stripe for auth
          Stripe.createToken({
            number: cardNumber,
            cvc: cardCvc,
            exp_month: cardMonth,
            exp_year: parseInt(cardYear)
          }, amount, Gateway.stripeResponseHandler);
      } else {
        return false;
      }
  },

  stripeResponseHandler: function(status, response) {
    if (status == 200) {
      $('#subscription_stripe_card_token').val(response.id)
      $('#new_subscription')[0].submit();
    } else {
      $('#stripe_error').text(response.error.message);
      $('.submit-button').attr('disabled', false);
      $(".actions img").remove();
    }
  }
};

//**********Initialize Document**********//
$(document).ready(function() {
  Ajax.ajaxStatus();
  Navigation.setCurrentNav();
});