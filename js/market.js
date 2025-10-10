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

      <div class="analytics-card">
        <h3>Commodity Price Trends</h3>
        <p>Last 30 Days</p>
        <div class="filters">
          <button class="filter-btn active" data-group="grains">Grains</button>
          <button class="filter-btn" data-group="vegetables">Vegetables</button>
          <button class="filter-btn" data-group="fruits">Fruits</button>
          <button class="filter-btn" data-group="animal">Animal</button>
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

  // Simple Chart: Commodity trends (sample data)
  try{
    const ctx = document.getElementById('commodityTrendsChart').getContext('2d');
    const chart = new Chart(ctx, {
      type:'line',
      data:{
        labels:['Week 1','Week 2','Week 3','Week 4'],
        datasets:[
          {label:'Maize (KES/bag)',data:[3200,3350,3450,3500],tension:0.3,borderColor:'#2E7D32',fill:true,backgroundColor:'rgba(46,125,50,0.08)'},
          {label:'Avocado (KES/kg)',data:[700,750,780,800],tension:0.3,borderColor:'#4CAF50',fill:true,backgroundColor:'rgba(76,175,80,0.08)'}
        ]
      },
      options:{responsive:true,maintainAspectRatio:false}
    });

    // mini charts for product details (if canvases exist)
    function mini(id,data){
      const el = document.getElementById(id);
      if(!el) return;
      new Chart(el.getContext('2d'),{type:'line',data:{labels:['W1','W2','W3','W4'],datasets:[{data,data,tension:0.3,borderColor:'#2196F3',fill:true,backgroundColor:'rgba(33,150,243,0.08)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}}});
    }
    mini('avocadoChart',[700,750,780,800]);
    mini('maizeChart',[3200,3350,3450,3500]);
    mini('onionsChart',[80,75,65,60]);
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
