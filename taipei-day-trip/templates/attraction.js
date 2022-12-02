function loadAttImages(id) {
  let url = `/api/attraction/${id}`;
  // let id = ${id};
  if (id === null) {
    return;
  }
  console.log({ url });
  fetch(url)
    .then((response) => response.json())
    .then((y) => {
      console.log(y.data.images);
      return y.data.images;
    })
    .then((AttImges) => {
      console.log({ AttImges });
      const carouselInnerElement = document.querySelector(".carousel-inner"); //父節點
      for (const AttImg of AttImges) {
        const carouselItemElement = document.createElement("div"); //子節點1
        const imgElement = document.createElement("img"); //子節點1-1
        carouselItemElement.className = "carousel-item"; //子節點1
        imgElement.className = "attImg d-block w-100"; //子節點1-1
        imgElement.src = AttImg; //子節點

        carouselItemElement.appendChild(imgElement);
        carouselInnerElement.appendChild(carouselItemElement);
      }

      //set active img //無效
      const theOldFirstElement =
        document.querySelector(".carousel-inner").firstchild; //原子節點1-1

      const firstactiveElement = document.createElement("div"); //新子節點1
      const firstactiveimgElement = document.createElement("img"); //新子節點1-1
      firstactiveElement.className = "carousel-item active"; //新子節點1
      firstactiveimgElement.className = "attImg d-block w-100"; //新子節點1-1
      firstactiveimgElement.src = AttImges[0]; //新子節點1-1.src
      // firstactiveElement = document.getElementByClass("carousel-inner");
      firstactiveElement.appendChild(firstactiveimgElement);
      firstactiveElement.replaceChild(firstactiveElement, theOldFirstElement);
    };);
}
loadAttImages(1);
