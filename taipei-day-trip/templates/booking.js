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
          document.querySelector(".login-and-signup").style = "";
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
        document.querySelector(".login-and-signup").style = "display:none";
        document.querySelector(".logout").style = "";
        const loginDiv = document.querySelector(".loginDiv");
        const loginSuccessText = document.createElement("div");
        if (result["error"] !== true) {
          loginSuccessText.className = "loginSuccessText";
          loginSuccessText.textContent = "登入成功!";
          loginDiv.appendChild(loginSuccessText);
          setTimeout(() => {
            document.querySelector(".signin-window").style = "display:none";
            document.querySelector(".loginSuccessText").style = "display:none";
            loginDiv.removeChild(loginSuccessText);
          }, 1000);
        } else {
          loginSuccessText.className = "loginSuccessText";
          loginSuccessText.textContent = "登入失敗!";
          loginDiv.appendChild(loginSuccessText);
          document.querySelector(".login-and-signup").style = "";
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
        document.querySelector(".login-and-signup").style = "display:none";
        document.querySelector(".logout").style = "";
      } else {
        document.querySelector(".logout").style = "display:none";
        document.querySelector(".login-and-signup").style = "";
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
      // .then((response) => response.text())
      .then((response) => response.json())
      // .then((result) => console.log(result))
      .then((result) => {
        if (result.data == null) {
          document.querySelector(".logout").style = "display:none";
          document.querySelector(".login-and-signup").style = "";
          document.querySelector(".logout-window").style = "";
          setTimeout(() => {
            document.querySelector(".logout-window").style = "display:none";
          }, 1000);
        } else {
          document.querySelector(".login-and-signup").style = "display:none";
          document.querySelector(".logout").style = "";
        }
      })
      .catch((error) => console.log("error", error));
  });
}

const localStorageId = localStorage.getItem("BookingAttId");
const localStorageDate = localStorage.getItem("date");
const localStorageTime = localStorage.getItem("time");
const localStoragePrice = localStorage.getItem("price");

function loadAttractionInfo() {
  let url = `/api/attraction/${localStorageId}`;
  fetch(url)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((attractionInfo) => {
      const UpperleftDiv = document.querySelector(".the-upper-left");
      const UpperrightDiv = document.querySelector(".the-upper-right");
      // console.log(attractionInfo.data.images[0]);
      // console.log(attractionInfo.data.name);
      // console.log(localStorageDate);
      // console.log(localStorageTime);
      // console.log(localStoragePrice);
      // console.log(attractionInfo.data.address);
      const bookingImg = document.createElement("img");
      bookingImg.className = "bookingImg";
      bookingImg.src = attractionInfo.data.images[0];
      UpperleftDiv.appendChild(bookingImg);

      const nameDiv = document.createElement("div");
      nameDiv.className = "nameDiv";
      nameDiv.textContent = "台北一日遊 : ";
      const nameSpan = document.createElement("span");
      nameSpan.className = "nameSpan";
      nameSpan.textContent = attractionInfo.data.name;
      nameDiv.appendChild(nameSpan);
      UpperrightDiv.appendChild(nameDiv);

      const dateDiv = document.createElement("div");
      dateDiv.className = "dateDiv";
      dateDiv.textContent = "日期 : ";
      const dateSpan = document.createElement("span");
      dateSpan.className = "dateSpan";
      dateSpan.textContent = localStorageDate;
      dateDiv.appendChild(dateSpan);
      UpperrightDiv.appendChild(dateDiv);

      const timeDiv = document.createElement("div");
      timeDiv.className = "nameDiv";
      timeDiv.textContent = "時間 : ";
      const timeSpan = document.createElement("span");
      timeSpan.className = "timeSpan";
      timeSpan.textContent = localStorageTime;
      timeDiv.appendChild(timeSpan);
      UpperrightDiv.appendChild(timeDiv);
      // const timeDetails = document.querySelector(".timeSpan").textContent;
      // console.log(timeDetails);
      // if ((timeDetails.textContent = "下半天")) {
      //   timeDetails.innerHTML = "下午2點到6點";
      // }

      const addressDiv = document.createElement("div");
      addressDiv.className = "addressDiv";
      addressDiv.textContent = "地點 : ";
      const addressSpan = document.createElement("span");
      addressSpan.className = "addressSpan";
      addressSpan.textContent = attractionInfo.data.address;
      addressDiv.appendChild(addressSpan);
      UpperrightDiv.appendChild(addressDiv);

      const priceDiv = document.createElement("div");
      priceDiv.className = "priceDiv";
      priceDiv.textContent = "費用 : ";
      const priceSpan = document.createElement("span");
      priceSpan.className = "priceSpan";
      priceSpan.textContent = localStoragePrice;
      priceDiv.appendChild(priceSpan);
      UpperrightDiv.appendChild(priceDiv);
      return;
    });
}

function main() {
  signup();
  login();
  checkIsLogin();
  logout();
  loadAttractionInfo();

  document.querySelector(".login-and-signup").addEventListener("click", () => {
    document.querySelector(".signin-window").style = "";
    document.querySelector(".login").style = "";
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
