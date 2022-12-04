function loadinfos(id) {
  let url = `/api/attraction/${id}`;
  if (id === null) {
    return;
  }
  fetch(url)
    .then((response) => response.json())
    .then((y) => {
      console.log(y.data);
      return y.data;
    })
    .then(() => {});
}
loadinfos(9);
function loadImages(id) {
  let url = `/api/attraction/${id}`;
  if (id === null) {
    return;
  }
  // console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((y) => {
      // console.log(y.data.images);
      return y.data.images;
    })
    .then((images) => {
      console.log(images);
      const slideshowContainerDiv = document.querySelector(
        ".slideshow-container"
      );
      for (const image of images) {
        //photos
        const mySlidesFadeElement = document.createElement("div");
        mySlidesFadeElement.className = "mySlides fade";
        const imgElement = document.createElement("img");
        imgElement.src = image;
        imgElement.style = "width: 100%";
        mySlidesFadeElement.appendChild(imgElement);
        slideshowContainerDiv.appendChild(mySlidesFadeElement);
        // console.log(imgElement);
        //dots
      }

      for (n = 0; n < images.length; n++) {
        const dotParentDiv = document.querySelector(".dotParentDiv");
        const dotSpan = document.createElement("span");
        dotSpan.className = "dot";
        dotSpan.onclick = function () {
          showSlides((slideIndex = n + 1));
        };
        dotParentDiv.appendChild(dotSpan);
      }
    });
}
loadImages(9);

////////slide show starts
let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
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
