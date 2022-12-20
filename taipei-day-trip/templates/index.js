let nextPage = 0;
let isloading = false;
let keyword = "";

function createAttractionElement(x) {
  //attractions//a single attraction
  const divAttractions = document.createElement("div");
  divAttractions.className = "attractions";

  //attraction//name and img
  const divAttraction = document.createElement("div");
  divAttraction.className = "attraction";
  const img = document.createElement("img");
  img.className = "att-img";
  img.src = x.images[0];
  const name = document.createElement("div");
  name.className = "att-name";
  name.textContent = x.name;
  divAttraction.appendChild(img);
  divAttraction.appendChild(name);

  //datils//mrt and cat
  const divdetails = document.createElement("div");
  divdetails.className = "details";
  const mrt = document.createElement("div");
  mrt.className = "mrt";
  mrt.textContent = x.mrt;
  const cat = document.createElement("div");
  cat.className = "cat";
  cat.textContent = x.category;
  divdetails.appendChild(mrt);
  divdetails.appendChild(cat);

  divAttractions.appendChild(divAttraction);
  divAttractions.appendChild(divdetails);

  return divAttractions;
}

function load(page, keyword) {
  if (page === null) {
    return;
  }

  isloading = true;
  let url = `/api/attractions?page=${page}`;
  if (keyword) {
    url += `&keyword=${keyword}`;
  }
  // console.log({ url })
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((attractions) => {
      const container = document.querySelector(".container");
      for (const attraction of attractions.data) {
        const attractionElement = createAttractionElement(attraction);
        attractionElement.addEventListener("click", () => {
          location.pathname = `/attraction/${attraction.source_id}`;
        });
        container.appendChild(attractionElement);
      }
      if (attractions.data.length === 0) {
        container.textContent = "No result found.";
      }

      nextPage = attractions.nextPage;
      isloading = false;
    });
}

load(nextPage, keyword);
document.addEventListener("scroll", (event) => {
  const height = window.innerHeight;
  const bottom = document
    .querySelector(".container")
    .getBoundingClientRect().bottom;
  if (height > bottom) {
    if (isloading) {
      return;
    }
    load(nextPage, keyword);
  }
});

document.querySelector(".searchbar").addEventListener("submit", (event) => {
  event.preventDefault();
  keyword = document.querySelector(".searchinput").value;
  document.querySelector(".container").innerHTML = "";
  nextPage = 0;
  load(nextPage, keyword);
});

function loadCategories() {
  fetch("/api/categories")
    .then((response) => response.json())
    .then((y) => {
      return y.data;
    })

    .then((categories) => {
      console.log({ categories });
      const categoriesElement = document.querySelector(".categories");
      for (const category of categories) {
        const categoryElement = document.createElement("div");
        categoryElement.className = "category";
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", () => {
          document.querySelector(".searchinput").value = category;
        });
        categoriesElement.appendChild(categoryElement);
      }
    });
}
// loadCategories();
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
          document.querySelector(".headline-section").style.opacity = "0.5";
          document.querySelector(".container").style.opacity = "0.5";
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

function main() {
  loadCategories();
  signup();
  login();
  checkIsLogin();
  logout();

  document.querySelector(".searchinput").addEventListener("focus", () => {
    document.querySelector(".categories").style = "";
  });

  document.querySelector(".searchinput").addEventListener("focusout", () => {
    setTimeout(() => {
      document.querySelector(".categories").style = "display: none;";
    }, 100);
  });

  document.querySelector(".login-and-signup").addEventListener("click", () => {
    document.querySelector(".login").style = "";
    document.querySelector(".headline-section").style.opacity = "0.5";
    document.querySelector(".container").style.opacity = "0.5";
    // document.querySelector(".headline-section").style.filter = "blur(2px)";
    // document.querySelector(".container").style.filter = "blur(2px)";
    // document.querySelector(".login").style.filter = "filter: none;";
  });

  document.querySelector(".link-to-signup").addEventListener("click", () => {
    document.querySelector(".login").style = "display:none";
    document.querySelector(".signup").style = "";
  });

  document.querySelector(".link-to-login").addEventListener("click", () => {
    document.querySelector(".signup").style = "display:none";
    document.querySelector(".login").style = "";
  });
}

main();
