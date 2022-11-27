let currentPage=0;
let isloading=false;

// fetch("/data/taipei-attractions.json")
fetch("http://127.0.0.1:5500/taipei-day-trip/data/taipei-attractions.json")
    .then(function(response){
    return response.json();
    })
    .then(function(dataList){
        const attractions = [] 
        for(let i=0;i<dataList.result.results.length;i++){ 
            const attraction={
                attractionName:dataList.result.results[i]["name"],
                fistImage:"https://"+dataList.result.results[i]["file"].split("https://")[1],
                mrt:dataList.result.results[i]["MRT"],
                cat:dataList.result.results[i]["CAT"]         
            } 
            attractions.push(attraction)
       } 
       return attractions 
    })
    
    
    .then(function (attractions) {
  
    //12 items
    //name and img
    const container = document.querySelector(".container")
    let j = 0 //景點從0開始
    function appendAttraction(){
      //attractions
      const divAttractions = document.createElement("div")
      divAttractions.className = "attractions"

      //attraction
      const divAttraction = document.createElement("div")
      divAttraction.className = "attraction"
      const img = document.createElement("img")
      img.className = "att-img"
      img.src = attractions[j].fistImage
      const name = document.createElement("div")
      name.className = "att-name"
      name.textContent = attractions[j].attractionName
      divAttraction.appendChild(img)
      divAttraction.appendChild(name)

      //datils
      const divdetails = document.createElement("div")
      divdetails.className = "details"
      const mrt = document.createElement("div")
      mrt.className = "mrt"
      mrt.textContent = attractions[j].mrt
      const cat = document.createElement("div")
      cat.className = "cat"
      cat.textContent = attractions[j].cat
      divdetails.appendChild(mrt)
      divdetails.appendChild(cat)

      divAttractions.appendChild(divAttraction)
      divAttractions.appendChild(divdetails)

      container.appendChild(divAttractions)
      
      j++
    }

    for (let i = 0; i < 12; i++) {
      isloading=true;
      appendAttraction()
      isloading=false; 
      // break;
    }
    
    document.addEventListener('scroll', (ev) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
      if (window.innerHeight >= document.querySelector('html').getBoundingClientRect().bottom) {
        console.log('end')
        // ....
        appendAttraction()
      }
    })

//     window.onscroll = function(ev) {
//           if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
//             console.log('end')
//             window.setTimeout(appendAttraction, 3000)
//     }
// };

    //search
    const searchForm = document.querySelector('.searchbar')
    const searchInput = document.querySelector('.searchinput')
    searchForm.addEventListener('submit', function search(event)  {
    event.preventDefault()
    const keyword = searchInput.value
    // console.log(keyword) 
    let filteredresults = []
    // console.log(attractions)

    for(let attraction of attractions){
    // console.log(attraction);
      if(attraction.attractionName.includes(keyword)||attraction.cat.includes(keyword)){
        filteredresults.push(attraction)
      }
      // console.log(filteredresults);//搜尋"地熱谷"，印出58個地熱谷...
      appendAttraction(filteredresults);
      //index.js:40 Uncaught TypeError: Cannot read properties of undefined (reading 'fistImage')
      // at appendAttraction (index.js:40:32)
      // at HTMLFormElement.search (index.js:107:7)
    }
  }) 
})



    





    
  