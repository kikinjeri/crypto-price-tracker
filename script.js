const tableBody = document.querySelector('#cryptotable tbody');
const priceFilter = document.getElementById('price-filter');

async function fetchCryptoData(){
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    const data = await response.json();
    allData = data;
    console.log(data);
    displayData(data);
}

function displayData(data){
    tableBody.innerHTML='';
    data.forEach(coin=>{
        const row = document.createElement('tr');
        row.innerHTML =`
        <td>${coin.name}</td><td>${coin.current_price.toFixed(2)}</td><td>${coin.price_change_percentage_24h.toFixed(2)}</td>`;
    tableBody.appendChild(row);
    
    })  
}
priceFilter.addEventListener('change', ()=>{
    let filterData;
    if(priceFilter.value ==="all"){
        filterData=allData;
    }else{
        filterData=allData.filter(coin=>{
            const price=coin.current_price;
            if(priceFilter.value === 'below1') return price<=1;
                 if(priceFilter.value === 'below5') return price>1 && price<=5;
                     if(priceFilter.value === 'below10') return price>5 && price <=10;

    });
        }
     displayData(filterData);
    })
fetchCryptoData();