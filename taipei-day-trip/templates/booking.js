function signup() {
  document.querySelector(".signupButton").addEventListener("click", (ev) => {
    ev.preventDefault();
    const name = document.querySelector(".signup .input-name").value;
    const email = document.querySelector(".signup .input-email").value;
    const password = document.querySelector(".signup .input-password").value;
    const newHeaders = new Headers();
    newHeaders.append("Content-Type", "application/json");
    const newbody = JSON.stringify({
      name,
      email,
      password,
    });
    const requestOptions = {
      method: "POST",
      headers: newHeaders,
      body: newbody,
      redirect: "follow",
    };
    fetch("/api/user", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        // console.log(result);
        const signupDiv = document.querySelector(".signupDiv");
        const signupSuccessText = document.createElement("div");
        signupSuccessText.className = "signupSuccessText";
        // if (result.data !== null) {
        if (result["error"] !== true) {
          signupSuccessText.textContent = "註冊成功!請登入帳號";
          signupDiv.appendChild(signupSuccessText);
          setTimeout(() => {
            document.querySelector(".signup-window").style = "display:none";
            signupDiv.removeChild(signupSuccessText);
          }, 1000);
        } else {
          signupSuccessText.textContent = "註冊失敗!email重複或其他原因";
          signupDiv.appendChild(signupSuccessText);
          // document.querySelector(".login-and-signup").style = "";
          document.querySelector(".logout").style = "display:none";
          setTimeout(() => {
            document.querySelector(".signup-window").style = "display:none";
            signupDiv.removeChild(signupSuccessText);
          }, 1000);
        }
      })
      .catch((error) => console.log("error", error));
  });
}

function login() {
  document.querySelector(".loginButton").addEventListener("click", (ev) => {
    ev.preventDefault();
    const email = document.querySelector(".login .input-email").value;
    const password = document.querySelector(".login .input-password").value;
    const newHeaders = new Headers();
    newHeaders.append("Content-Type", "application/json");
    const newbody = JSON.stringify({
      email,
      password,
    });
    const requestOptions = {
      method: "PUT",
      headers: newHeaders,
      body: newbody,
      redirect: "follow",
    };
    fetch("/api/user/auth", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        // document.querySelector(".login-and-signup").style = "display:none";
        document.querySelector(".logout").style = "";
        const loginDiv = document.querySelector(".loginDiv");
        const loginSuccessText = document.createElement("div");
        if (result["error"] !== true) {
          loginSuccessText.className = "loginSuccessText";
          loginSuccessText.textContent = "登入成功!";
          loginDiv.appendChild(loginSuccessText);
          document.querySelector(".login-and-signup").style = "display:none";
          document.querySelector(".greetings").style.opacity = "0.5";
          document.querySelector(".upper_and_bottom").style.opacity = "0.5";
          setTimeout(() => {
            document.querySelector(".signin-window").style = "display:none";
            document.querySelector(".loginSuccessText").style = "display:none";
            document.querySelector(".greetings").style.opacity = "";
            document.querySelector(".upper_and_bottom").style.opacity = "";
            loginDiv.removeChild(loginSuccessText);
          }, 1000);
        } else {
          loginSuccessText.className = "loginSuccessText";
          loginSuccessText.textContent = "登入失敗!";
          loginDiv.appendChild(loginSuccessText);
          // document.querySelector(".login-and-signup").style = "";
          document.querySelector(".logout").style = "display:none";
          setTimeout(() => {
            document.querySelector(".signin-window").style = "display:none";
            document.querySelector(".loginSuccessText").style = "display:none";
            loginDiv.removeChild(loginSuccessText);
          }, 1000);
        }
      })
      .catch((error) => console.log("error", error));
  });
}

function checkIsLogin() {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  fetch("/api/user/auth", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.data !== null) {
        document.querySelector(".greetingName").textContent =
          result.data.name + " ，";
        document.querySelector(".login-and-signup").style = "display:none";
        document.querySelector(".logout").style = "";
      } else {
        window.location.href = "/";
        // document.querySelector(".logout").style = "display:none";
        // document.querySelector(".login-and-signup").style = "";
        // document.querySelector(".signin-window").style = "";
        // document.querySelector(".login").style = "";
      }
    }) //{"data":null} //hello = () => "Hello World!";
    .catch((error) => console.log("error", error));
}

function logout() {
  document.querySelector(".logout").addEventListener("click", () => {
    const requestOptions = {
      method: "DELETE",
      redirect: "follow",
    };
    fetch("/api/user/auth", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.data == null) {
          document.querySelector(".logout").style = "display:none";
          document.querySelector(".login-and-signup").style = "";
          document.querySelector(".logout-window").style = "";
          document.querySelector(".greetings").style.opacity = "0.5";
          document.querySelector(".upper_and_bottom").style.opacity = "0.5";
          document.querySelector(".footer").style.opacity = "0.5";
          setTimeout(() => {
            document.querySelector(".logout-window").style = "display:none";
            document.querySelector(".greetings").style.opacity = "";
            document.querySelector(".upper_and_bottom").style.opacity = "";
            document.querySelector(".footer").style.opacity = "";
            checkIsLogin();
          }, 1000);
        } else {
          // document.querySelector(".login-and-signup").style = "display:none";
          document.querySelector(".logout").style = "";
        }
      })
      .catch((error) => console.log("error", error));
  });
}
function checkBooking() {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  fetch("/api/booking", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.data == null) {
        document.querySelector(".the-upper-container").style = "display:none";
        document.querySelector(".contactInfo").innerHTML = "";
        document.querySelector(".paymentInfo").innerHTML = "";
        const greetingsDiv = document.querySelector(".greetings");
        const greetingstext = document.createElement("div");
        greetingstext.className = "greetingstext";
        greetingstext.textContent = "目前沒有任何待預定的行程";
        greetingsDiv.appendChild(greetingstext);
        document.querySelector(".footer").style = "min-height:500px;";
      }
      if (result.data !== null) {
        console.log(result);
        document.querySelector(".bookingImg").src =
          result.data.attraction[0].image;
        document.querySelector(".nameSpan").textContent =
          result.data.attraction[0].name;
        document.querySelector(".timeSpan").textContent = result.data.time;
        document.querySelector(".dateSpan").textContent = result.data.date;
        document.querySelector(".priceSpan").textContent = result.data.price;
        document.querySelector(".addressSpan").textContent =
          result.data.attraction[0].address;
        document.querySelector(".ttltextSpan").textContent =
          "新台幣" + result.data.price + "元";
        ttltextDiv.appendChild(ttltextSpan);
      }
    }) //{"data":null} //hello = () => "Hello World!";
    .catch((error) => console.log("error", error));
}
function deleteBooking() {
  document.querySelector(".delete-icon").addEventListener("click", () => {
    const requestOptions = {
      method: "DELETE",
      redirect: "follow",
    };
    fetch("/api/booking", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        document.querySelector(".the-upper-container").style = "display:none";
        document.querySelector(".contactInfo").innerHTML = "";
        document.querySelector(".paymentInfo").innerHTML = "";
        const greetingsDiv = document.querySelector(".greetings");
        const greetingstext = document.createElement("div");
        greetingstext.className = "greetingstext";
        greetingstext.textContent = "目前沒有任何待預定的行程";
        greetingsDiv.appendChild(greetingstext);
        document.querySelector(".footer").style = "min-height:500px;";
      });
  });
}
function main() {
  signup();
  login();
  checkIsLogin();
  logout();
  checkBooking();
  deleteBooking();


  document.querySelector(".login-and-signup").addEventListener("click", () => {
    document.querySelector(".signin-window").style = "";
    document.querySelector(".login").style = "";
    document.querySelector(".greetings").style.opacity = "0.5";
    document.querySelector(".upper_and_bottom").style.opacity = "0.5";
  });

  document.querySelector(".link-to-signup").addEventListener("click", () => {
    document.querySelector(".login").style = "display:none";
    document.querySelector(".signup").style = "";
    document.querySelector(".signup-window").style = "";
  });

  document.querySelector(".link-to-login").addEventListener("click", () => {
    document.querySelector(".signup").style = "display:none";
    document.querySelector(".login").style = "";
  });

  document.querySelector(".left").addEventListener(
    "click",
    () => {
      window.location.href = "/";
    },
    false
  );
}

main();
