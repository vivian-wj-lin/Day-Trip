let slideIndex = 1; ////////slide show

async function getAttractionData() {
  const attractionId = location.pathname.split("/").pop();
  console.log(attractionId);
  const response = await fetch(`/api/attraction/${attractionId}`);
  const data = await response.json();
  console.log(data);
  return data;
}

////////slide show begins
function plusSlides(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}
////////slide show ends

function loadImages(images) {
  console.log(images);
  //images and dotted indicators
  const slideshowContainerDiv = document.querySelector(".slideshow-container");
  const dotsDiv = document.querySelector(".dots");
  for (let i = 0; i < images.length; i++) {
    const mySlidesFadeElement = document.createElement("div");
    mySlidesFadeElement.className = "mySlides fade";
    const imgElement = document.createElement("img");
    imgElement.src = images[i];
    imgElement.style = "width: 100%";
    mySlidesFadeElement.appendChild(imgElement);
    slideshowContainerDiv.appendChild(mySlidesFadeElement);

    const dotSpan = document.createElement("span");
    dotSpan.className = "dot";
    dotSpan.onclick = function () {
      currentSlide(i + 1);
    };
    dotsDiv.appendChild(dotSpan);
  }
}

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
            window.location.reload();
          }, 1000);
        } else {
          document.querySelector(".logout").style = "display:none";
          document.querySelector(".login-and-signup").style = "";
          signupSuccessText.textContent = "註冊失敗!email重複或其他原因";
          signupDiv.appendChild(signupSuccessText);
          setTimeout(() => {
            window.location.reload();
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
            window.location.reload();
          }, 1000);
        } else {
          loginSuccessText.className = "loginSuccessText";
          loginSuccessText.textContent = "登入失敗!";
          loginDiv.appendChild(loginSuccessText);
          setTimeout(() => {
            window.location.reload();
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
            window.location.reload();
          }, 1000);
        } else {
          document.querySelector(".login-and-signup").style = "display:none";
          document.querySelector(".logout").style = "";
        }
      })
      .catch((error) => console.log("error", error));
  });
}

async function main() {
  signup();
  login();
  checkIsLogin();
  logout();

  const attractionData = (await getAttractionData()).data;
  const timeSelectedMorning = document.querySelector(".morning");
  const timeSelectedafternoon = document.querySelector(".afternoon");
  console.log(attractionData);

  document.querySelector(".att-name").textContent = attractionData.name;
  document.querySelector(".cat").textContent = attractionData.category;
  document.querySelector(".mrt").textContent = attractionData.mrt;
  document.querySelector(".descr").textContent = attractionData.description;
  document.querySelector(".address").textContent = attractionData.address;
  document.querySelector(".transport").textContent = attractionData.transport;

  loadImages(attractionData.images);
  showSlides(slideIndex); ////////slide show

  timeSelectedMorning.addEventListener("click", () => {
    document.querySelector(".price").textContent = "新台幣 2000 元";
  });
  timeSelectedafternoon.addEventListener("click", () => {
    document.querySelector(".price").textContent = "新台幣 2500 元";
  });

  document.querySelector(".login-and-signup").addEventListener("click", () => {
    document.querySelector(".login").style = "";
  });

  document.querySelector(".link-to-signup").addEventListener("click", () => {
    document.querySelector(".login").style = "display:none";
    document.querySelector(".signup").style = "";
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
