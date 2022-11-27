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
      appendAttraction()
    }  

})
    
  