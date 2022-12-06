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

    // const dotImg = document.createElement("img");
    // dotImg.className = "dot";
    // dotImg.src = "/static/circle current.png";
    // dotImg.onclick = function () {
    //   currentSlide(i + 1);
    // };
    // dotsDiv.appendChild(dotImg);
  }
}

async function main() {
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
}

main();
