// js/market.js - creates charts and wires up market filters
// Uses Chart.js loaded in the page
import api from './api.js';

let marketListings = [];

document.addEventListener('DOMContentLoaded', async function(){
  // Load marketplace data
  try {
    marketListings = await api.getListings();
  } catch (error) {
    console.error('Error loading marketplace data:', error);
    marketListings = [];
  }
  // Render region filters
  const regionFilters = ['Western','North Rift','Central','Upper Eastern','Galana Kulalu'];
  const regionContainer = document.getElementById('region-filters');
  if(regionContainer){
    regionFilters.forEach((r,i)=>{
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (i===0 ? ' active' : '');
      btn.textContent = r;
      btn.addEventListener('click', ()=> {
        document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      });
      regionContainer.appendChild(btn);
    });
  }

  // Analyze marketplace data for highest/lowest moving products
  function analyzeMarketplace() {
    if (marketListings.length === 0) {
      return { highest: [], lowest: [] };
    }

    // Group listings by item and calculate stats
    const productStats = {};
    marketListings.forEach(listing => {
      const item = listing.item.toLowerCase();
      if (!productStats[item]) {
        productStats[item] = {
          name: listing.item,
          count: 0,
          totalQuantity: 0,
          avgPrice: 0,
          prices: [],
          units: listing.units || 'kg'
        };
      }
      productStats[item].count++;
      productStats[item].totalQuantity += listing.quantity || 0;
      productStats[item].prices.push(listing.price || 0);
    });

    // Calculate average prices
    Object.keys(productStats).forEach(key => {
      const stat = productStats[key];
      stat.avgPrice = stat.prices.reduce((a, b) => a + b, 0) / stat.prices.length;
    });

    // Sort by listing count (most active = highest moving)
    const sorted = Object.values(productStats).sort((a, b) => b.count - a.count);
    
    return {
      highest: sorted.slice(0, 4),
      lowest: sorted.slice(-4).reverse()
    };
  }

  const { highest, lowest } = analyzeMarketplace();

  // Create analytics cards (high and low moving) with real data
  const analyticsRoot = document.getElementById('market-analytics');
  if(analyticsRoot){
    const highestHTML = highest.length > 0 
      ? highest.map(p => `<li data-product="${p.name.toLowerCase().replace(/\s+/g, '-')}">${p.name} <span>KES ${Math.round(p.avgPrice)}/${p.units} (${p.count} listings)</span></li>`).join('')
      : '<li>No marketplace data available</li>';
    
    const lowestHTML = lowest.length > 0
      ? lowest.map(p => `<li data-product="${p.name.toLowerCase().replace(/\s+/g, '-')}">${p.name} <span>KES ${Math.round(p.avgPrice)}/${p.units} (${p.count} listings)</span></li>`).join('')
      : '<li>No marketplace data available</li>';

    analyticsRoot.innerHTML = `
      <div class="analytics-card" id="high-moving-products">
        <h3>Highest Moving Products</h3>
        <p class="click-hint">Based on marketplace activity</p>
        <ul class="product-list">
          ${highestHTML}
        </ul>
      </div>

      <div class="analytics-card" id="low-moving-products">
        <h3>Lowest Moving Products</h3>
        <p class="click-hint">Based on marketplace activity</p>
        <ul class="product-list">
          ${lowestHTML}
        </ul>
      </div>

      <div class="analytics-card" id="price-trends-card">
        <h3>Commodity Price Trends</h3>
        <p>Select a product to view 30-day price trends</p>
        <div style="margin-bottom: 1rem;">
          <select id="product-search" class="form-control" style="max-width: 300px;">
            <option value="">Select a product...</option>
          </select>
        </div>
        <div class="chart-container"><canvas id="commodityTrendsChart"></canvas></div>
      </div>
    `;
  }

  // Product detail toggles
  document.querySelectorAll('.product-list li').forEach(li=>{
    li.addEventListener('click', function(){
      const product = this.getAttribute('data-product');
      const card = this.closest('.analytics-card');
      card.querySelectorAll('.product-detail').forEach(d=>d.classList.remove('active'));
      const target = card.querySelector(`#${product}-detail`);
      if(target) target.classList.add('active');
    });
  });

  // Populate product search dropdown
  const productSearch = document.getElementById('product-search');
  if (productSearch && marketListings.length > 0) {
    const uniqueProducts = [...new Set(marketListings.map(l => l.item))].sort();
    uniqueProducts.forEach(product => {
      const option = document.createElement('option');
      option.value = product;
      option.textContent = product;
      productSearch.appendChild(option);
    });
  }

  // Generate mock 30-day trend data for a product
  function generate30DayTrend(basePrice) {
    const data = [];
    let price = basePrice;
    for (let i = 0; i < 30; i++) {
      // Add some randomness: +/- 5% variation
      const change = (Math.random() - 0.5) * 0.1 * price;
      price = Math.max(price + change, basePrice * 0.8); // Don't go below 80% of base
      data.push(Math.round(price));
    }
    return data;
  }

  // Commodity trends chart with product search
  let commodityChart = null;
  try{
    const ctx = document.getElementById('commodityTrendsChart').getContext('2d');
    
    // Initial empty chart
    commodityChart = new Chart(ctx, {
      type:'line',
      data:{
        labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
        datasets:[]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return 'KES ' + value;
              }
            }
          }
        }
      }
    });

    // Update chart when product is selected
    if (productSearch) {
      productSearch.addEventListener('change', function() {
        const selectedProduct = this.value;
        if (!selectedProduct) {
          commodityChart.data.datasets = [];
          commodityChart.update();
          return;
        }

        // Find the product's average price
        const productListings = marketListings.filter(l => l.item === selectedProduct);
        if (productListings.length === 0) return;

        const avgPrice = productListings.reduce((sum, l) => sum + (l.price || 0), 0) / productListings.length;
        const units = productListings[0].units || 'kg';
        
        // Generate 30-day trend
        const trendData = generate30DayTrend(avgPrice);
        
        commodityChart.data.datasets = [{
          label: `${selectedProduct} (KES/${units})`,
          data: trendData,
          tension: 0.4,
          borderColor: '#2E7D32',
          fill: true,
          backgroundColor: 'rgba(46,125,50,0.1)'
        }];
        
        commodityChart.update();
      });
    }
  }catch(e){
    console.warn('Chart init error', e);
  }

  // Alerts container
  const alerts = [
    {title:'Maize Supply Shortage',msg:'Western Kenya reporting 20% lower yields this season.'},
    {title:'Avocado Export Opportunity',msg:'European markets offering premium prices for certified organic Hass avocados.'},
    {title:'Irrigation Advisory',msg:'Central and Eastern regions should implement water conservation measures.'}
  ];
  const alertsRoot = document.getElementById('alerts-container');
  if(alertsRoot){
    alerts.forEach(a=>{
      const d = document.createElement('div');
      d.className = 'recommendation';
      d.innerHTML = `<div class="recommendation-icon"><i class="fas fa-info-circle"></i></div><div class="recommendation-content"><h3>${a.title}</h3><p>${a.msg}</p></div>`;
      alertsRoot.appendChild(d);
    });
  }
});
