const tableBody = document.querySelector('#cryptotable tbody');
const priceFilter = document.getElementById('price-filter');
let allData = [];

async function fetchCryptoData() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    const data = await response.json();
    allData = data;
    displayData(data);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    tableBody.innerHTML = `<tr><td colspan="3">Failed to load data. Please refresh.</td></tr>`;
  }
}

function displayData(data) {
  tableBody.innerHTML = '';
  data.forEach(coin => {
    const row = document.createElement('tr');
    const priceChange = coin.price_change_percentage_24h?.toFixed(2) || 0;
    const changeColor = priceChange >= 0 ? 'green' : 'red';

    row.innerHTML = `
      <td>${coin.name}</td>
      <td>$${coin.current_price.toFixed(2)}</td>
      <td style="color:${changeColor}">${priceChange}%</td>
    `;
    tableBody.appendChild(row);
  });
}

priceFilter.addEventListener('change', () => {
  let filteredData;
  const value = priceFilter.value;

  if (value === "all") {
    filteredData = allData;
  } else {
    filteredData = allData.filter(coin => {
      const price = coin.current_price;
      if (value === 'below1') return price <= 1;
      if (value === 'below5') return price > 1 && price <= 5;
      if (value === 'below10') return price > 5 && price <= 10;
    });
  }

  displayData(filteredData);
});

fetchCryptoData();

