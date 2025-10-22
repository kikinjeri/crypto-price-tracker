/* ============================
   ELEMENTS & STATE
============================ */
const tableBody = document.querySelector('#cryptotable tbody');
const priceFilter = document.getElementById('price-filter');
const searchInput = document.getElementById('search');

let allData = [];
let currentSort = { column: 'name', ascending: true };

/* ============================
   FETCH DATA
============================ */
async function fetchCryptoData() {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=true'
        );
        allData = await res.json();
        applyFiltersAndSort();
    } catch (err) {
        console.error('Fetch error:', err);
        tableBody.innerHTML = `<tr><td colspan="6">Failed to load data.</td></tr>`;
    }
}

/* ============================
   FILTER, SEARCH & SORT
============================ */
function applyFiltersAndSort() {
    let filtered = [...allData];

    // Price Filter
    if (priceFilter.value !== 'all') {
        filtered = filtered.filter(coin => {
            const price = coin.current_price;
            return (priceFilter.value === 'below1' && price <= 1) ||
                   (priceFilter.value === 'below5' && price > 1 && price <= 5) ||
                   (priceFilter.value === 'below10' && price > 5 && price <= 10);
        });
    }

    // Search Filter
    const term = searchInput.value.toLowerCase();
    if (term) filtered = filtered.filter(coin => coin.name.toLowerCase().includes(term));

    // Sort
    filtered.sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    displayData(filtered);
}

/* ============================
   DISPLAY DATA
============================ */
function displayData(data) {
    tableBody.innerHTML = '';

    data.forEach(coin => {
        const row = document.createElement('tr');

        // Name
        row.innerHTML = `
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td class="${coin.price_change_percentage_24h >=0 ? 'change-positive' : 'change-negative'}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td><canvas class="sparkline"></canvas></td>
        `;

        tableBody.appendChild(row);

        // Sparkline
        const canvas = row.querySelector('.sparkline');
        renderSparkline(canvas, coin.sparkline_in_7d.price, coin.price_change_percentage_24h);
    });
}

/* ============================
   RENDER SPARKLINE
============================ */
function renderSparkline(canvas, data, change) {
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: data.map((_, i) => i),
            datasets: [{
                data,
                borderColor: change >= 0 ? '#00ff88' : '#ff4d4d',
                borderWidth: 1.5,
                fill: false,
                pointRadius: 0,
                tension: 0.2
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

/* ============================
   EVENT LISTENERS
============================ */
priceFilter.addEventListener('change', applyFiltersAndSort);
searchInput.addEventListener('input', applyFiltersAndSort);

// Column Sorting
document.querySelectorAll('#cryptotable th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const col = th.dataset.sort;
        currentSort.ascending = currentSort.column === col ? !currentSort.ascending : true;
        currentSort.column = col;
        applyFiltersAndSort();
    });
});

/* ============================
   INITIALIZE
============================ */
fetchCryptoData();
setInterval(fetchCryptoData, 60000); // Auto-refresh every 60s

