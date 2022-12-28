const APP_ID = 127055;
const APP_KEY =
  "app_9oek7nfxApTNz16O9vb77MOEM46IXUekBvrpKTBBarOYghze4vw87MLhjdbr";
TPDirect.setupSDK(APP_ID, APP_KEY, "sandbox");
let fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "ccv",
  },
};

TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    // Styling ccv field
    "input.ccv": {
      "font-size": "1rem",
    },
    // Styling expiration-date field
    "input.expiration-date": {
      "font-size": "1rem",
    },
    // Styling card-number field
    "input.card-number": {
      "font-size": "1rem",
    },
    // style focus state
    ":focus": {
      color: "black",
    },
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
  // // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
  // isMaskCreditCardNumber: true,
  // maskCreditCardNumberRange: {
  //   beginIndex: 6,
  //   endIndex: 11,
  // },
});

// listen for TapPay Field
TPDirect.card.onUpdate(function (update) {
  /* Disable / enable submit button depend on update.canGetPrime  */
  /* ============================================================ */

  // update.canGetPrime === true
  //     --> you can call TPDirect.card.getPrime()
  // const submitButton = document.querySelector('button[type="submit"]')
  if (update.canGetPrime) {
    // submitButton.removeAttribute('disabled')
    $('button[type="submit"]').removeAttr("disabled");
  } else {
    // submitButton.setAttribute('disabled', true)
    $('button[type="submit"]').attr("disabled", true);
  }

  /* Change card type display when card type change */
  /* ============================================== */

  // cardTypes = ['visa', 'mastercard', ...]
  var newType = update.cardType === "unknown" ? "" : update.cardType;
  $("#cardtype").text(newType);

  /* Change form-group style when tappay field status change */
  /* ======================================================= */

  // number 欄位是錯誤的
  if (update.status.number === 2) {
    setNumberFormGroupToError(".card-number-group");
  } else if (update.status.number === 0) {
    setNumberFormGroupToSuccess(".card-number-group");
  } else {
    setNumberFormGroupToNormal(".card-number-group");
  }

  if (update.status.expiry === 2) {
    setNumberFormGroupToError(".expiration-date-group");
  } else if (update.status.expiry === 0) {
    setNumberFormGroupToSuccess(".expiration-date-group");
  } else {
    setNumberFormGroupToNormal(".expiration-date-group");
  }

  if (update.status.ccv === 2) {
    setNumberFormGroupToError(".ccv-group");
  } else if (update.status.ccv === 0) {
    setNumberFormGroupToSuccess(".ccv-group");
  } else {
    setNumberFormGroupToNormal(".ccv-group");
  }
});

$("form").on("submit", function (event) {
  event.preventDefault();

  // fix keyboard issue in iOS device
  forceBlurIos();

  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  console.log(tappayStatus);

  // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
  if (tappayStatus.canGetPrime === false) {
    alert("can not get prime");
    return;
  }

  // Get prime
  TPDirect.card.getPrime(function (result) {
    if (result.status !== 0) {
      alert("get prime error " + result.msg);
      return;
    }
    alert("get prime 成功，prime: " + result.card.prime);

    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch("/api/orders", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
      });
  });
});

function setNumberFormGroupToError(selector) {
  $(selector).addClass("has-error");
  $(selector).removeClass("has-success");
}

function setNumberFormGroupToSuccess(selector) {
  $(selector).removeClass("has-error");
  $(selector).addClass("has-success");
}

function setNumberFormGroupToNormal(selector) {
  $(selector).removeClass("has-error");
  $(selector).removeClass("has-success");
}

function forceBlurIos() {
  if (!isIos()) {
    return;
  }
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  // Insert to active element to ensure scroll lands somewhere relevant
  document.activeElement.prepend(input);
  input.focus();
  input.parentNode.removeChild(input);
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
