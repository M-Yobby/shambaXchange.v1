// js/market.js - creates charts and wires up market filters
// Uses Chart.js loaded in the page
import api from './api.js';

let marketListings = [];
let selectedRegion = null;

// Kenya's main agricultural regions from north to south
const kenyaRegions = [
  { name: 'Northern Region', coords: [37.5, 2.5], products: ['Livestock', 'Sorghum', 'Millet'] },
  { name: 'Rift Valley', coords: [35.5, 0.5], products: ['Maize', 'Wheat', 'Pyrethrum', 'Tea'] },
  { name: 'Western Region', coords: [34.5, 0.0], products: ['Sugarcane', 'Maize', 'Tea'] },
  { name: 'Central Region', coords: [37.0, -0.5], products: ['Coffee', 'Tea', 'Horticultural Crops'] },
  { name: 'Eastern Region', coords: [38.0, -1.0], products: ['Cotton', 'Sunflower', 'Fruits'] },
  { name: 'Nyanza Region', coords: [34.5, -0.8], products: ['Rice', 'Sugarcane', 'Fish'] },
  { name: 'Coast Region', coords: [39.5, -3.5], products: ['Coconuts', 'Cashew Nuts', 'Mangoes', 'Cassava'] },
  { name: 'Nairobi & Surroundings', coords: [36.8, -1.3], products: ['Vegetables', 'Flowers', 'Dairy'] }
];

document.addEventListener('DOMContentLoaded', async function(){
  // Load marketplace data
  try {
    marketListings = await api.getListings();
  } catch (error) {
    console.error('Error loading marketplace data:', error);
    marketListings = [];
  }

  // Initialize Mapbox map
  initializeMap();

  // Initialize Mapbox Map
  function initializeMap() {
    const mapboxToken = window.location.hostname.includes('replit') 
      ? 'MAPBOX_PUBLIC_KEY_PLACEHOLDER' // Will be replaced server-side
      : 'pk.test';

    // Fetch token from environment
    fetch('/api/config/mapbox-token')
      .then(res => res.json())
      .then(data => {
        if (!data.token || data.token === '') {
          throw new Error('Mapbox token not configured');
        }
        
        mapboxgl.accessToken = data.token;
        
        const map = new mapboxgl.Map({
          container: 'kenya-map',
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [37.9, 0.0], // Center of Kenya
          zoom: 5.5
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());

        // Add markers for each region
        map.on('load', () => {
          kenyaRegions.forEach((region, index) => {
            // Create marker
            const marker = new mapboxgl.Marker({ color: '#2E7D32' })
              .setLngLat(region.coords)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="padding: 0.5rem;">
                      <h3 style="margin: 0 0 0.5rem 0; color: #2E7D32;">${region.name}</h3>
                      <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">Key Products:</p>
                      <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem;">
                        ${region.products.map(p => `<li>${p}</li>`).join('')}
                      </ul>
                      <button 
                        onclick="selectRegionFromMap('${region.name}')" 
                        style="margin-top: 0.5rem; padding: 0.4rem 0.8rem; background: #2E7D32; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                        View Market Data
                      </button>
                    </div>
                  `)
              )
              .addTo(map);

            // Click event for marker
            marker.getElement().addEventListener('click', () => {
              selectRegion(region.name);
            });
          });
        });
      })
      .catch(error => {
        console.error('Error loading map:', error);
        const mapContainer = document.getElementById('kenya-map');
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; padding: 2rem;">
              <div style="text-align: center; max-width: 400px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #f57c00;"></i>
                <h3 style="margin-bottom: 0.5rem;">Map Loading Error</h3>
                <p style="font-size: 0.9rem;">
                  ${error.message === 'Mapbox token not configured' 
                    ? 'Mapbox access token is not configured. Please add MAPBOX_PUBLIC_KEY to environment variables.' 
                    : 'Unable to load the map. Please check your internet connection and try again.'}
                </p>
              </div>
            </div>
          `;
        }
      });
  }

  // Make selectRegion available globally for popup button
  window.selectRegionFromMap = selectRegion;

  function selectRegion(regionName) {
    selectedRegion = regionName;
    const regionInfo = document.getElementById('selected-region-info');
    if (regionInfo) {
      const region = kenyaRegions.find(r => r.name === regionName);
      regionInfo.innerHTML = `
        <i class="fas fa-location-dot"></i> 
        <strong>${regionName}</strong> - 
        Key Products: ${region.products.join(', ')}
      `;
    }
    
    // Update analytics based on region
    updateAnalytics(regionName);
  }

  // Map counties/cities to agricultural regions (all 47 counties of Kenya)
  const locationToRegion = {
    'northern region': ['marsabit', 'turkana', 'mandera', 'wajir', 'isiolo', 'samburu', 'garissa'],
    'rift valley': ['nakuru', 'narok', 'kajiado', 'kericho', 'bomet', 'uasin gishu', 'nandi', 'trans nzoia', 'elgeyo marakwet', 'baringo', 'laikipia', 'west pokot'],
    'western region': ['kakamega', 'bungoma', 'busia', 'vihiga'],
    'central region': ['kiambu', 'muranga', 'murang\'a', 'nyeri', 'kirinyaga', 'nyandarua'],
    'eastern region': ['embu', 'tharaka nithi', 'tharaka-nithi', 'meru', 'kitui', 'machakos', 'makueni'],
    'nyanza region': ['kisumu', 'siaya', 'homa bay', 'homabay', 'migori', 'kisii', 'nyamira'],
    'coast region': ['mombasa', 'kwale', 'kilifi', 'tana river', 'lamu', 'taita taveta', 'taita-taveta'],
    'nairobi & surroundings': ['nairobi']
  };

  function getRegionForLocation(location) {
    // Normalize location string (lowercase, remove extra spaces/punctuation)
    const locationLower = (location || '').toLowerCase().trim().replace(/['-]/g, ' ');
    
    for (const [region, counties] of Object.entries(locationToRegion)) {
      // Check if any county name appears in the location string
      if (counties.some(county => {
        const countyNormalized = county.replace(/['-]/g, ' ');
        return locationLower.includes(countyNormalized);
      })) {
        return region;
      }
    }
    return null;
  }

  // Analyze marketplace data for highest/lowest moving products
  function analyzeMarketplace(regionFilter = null) {
    let filteredListings = marketListings;
    
    // Filter by region if specified
    if (regionFilter && marketListings.length > 0) {
      const regionLower = regionFilter.toLowerCase();
      filteredListings = marketListings.filter(listing => {
        const listingRegion = getRegionForLocation(listing.location);
        if (!listingRegion) return false;
        // Match region name or partial match (e.g., "rift valley" matches "Rift Valley")
        return listingRegion === regionLower || regionLower.includes(listingRegion) || listingRegion.includes(regionLower.split(' ')[0]);
      });
    }

    if (filteredListings.length === 0) {
      return { highest: [], lowest: [] };
    }

    // Group listings by item and calculate stats
    const productStats = {};
    filteredListings.forEach(listing => {
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

  function updateAnalytics(regionFilter = null) {
    const { highest, lowest } = analyzeMarketplace(regionFilter);
    renderAnalyticsCards(highest, lowest, regionFilter);
  }

  // Initial render of analytics
  function renderAnalyticsCards(highest, lowest, regionFilter = null) {
    const analyticsRoot = document.getElementById('market-analytics');
    if(!analyticsRoot) return;

    const regionLabel = regionFilter ? ` (${regionFilter})` : '';
    
    const highestHTML = highest.length > 0 
      ? highest.map(p => `<li data-product="${p.name.toLowerCase().replace(/\s+/g, '-')}">${p.name} <span>KES ${Math.round(p.avgPrice)}/${p.units} (${p.count} listings)</span></li>`).join('')
      : `<li>No marketplace data available${regionFilter ? ' for this region' : ''}</li>`;
    
    const lowestHTML = lowest.length > 0
      ? lowest.map(p => `<li data-product="${p.name.toLowerCase().replace(/\s+/g, '-')}">${p.name} <span>KES ${Math.round(p.avgPrice)}/${p.units} (${p.count} listings)</span></li>`).join('')
      : `<li>No marketplace data available${regionFilter ? ' for this region' : ''}</li>`;

    analyticsRoot.innerHTML = `
      <div class="analytics-card" id="high-moving-products">
        <h3>Highest Moving Products${regionLabel}</h3>
        <p class="click-hint">Based on marketplace activity</p>
        <ul class="product-list">
          ${highestHTML}
        </ul>
      </div>

      <div class="analytics-card" id="low-moving-products">
        <h3>Lowest Moving Products${regionLabel}</h3>
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

    // Re-populate product search after render
    populateProductSearch();
    // Re-initialize chart after render
    initializeTrendsChart();
  }

  // Initial analytics render
  updateAnalytics();

  // Populate product search dropdown
  function populateProductSearch() {
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
  
  function initializeTrendsChart() {
    try{
      const canvas = document.getElementById('commodityTrendsChart');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      // Destroy existing chart if any
      if (commodityChart) {
        commodityChart.destroy();
      }
      
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
      const productSearch = document.getElementById('product-search');
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

  // Location Search Handler
  const searchBtn = document.getElementById('search-location-btn');
  const locationInput = document.getElementById('location-search');
  const locationResult = document.getElementById('location-result');

  async function searchLocationMarket() {
    const location = locationInput.value.trim();
    
    if (!location) {
      locationResult.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a location';
      locationResult.style.color = '#f44336';
      return;
    }

    locationResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching market data...';
    locationResult.style.color = '#666';

    try {
      const response = await api.request(`/api/market/regional?location=${encodeURIComponent(location)}`);
      
      locationResult.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Found ${response.totalListings} listings in <strong>${response.location}</strong> (${response.region} Region)
      `;
      locationResult.style.color = '#2E7D32';

      // Update analytics with regional data
      renderRegionalAnalytics(response);
      
      // Update map region indicator
      document.getElementById('selected-region-info').innerHTML = `
        <i class="fas fa-location-dot"></i> Viewing: ${response.location} - ${response.region} Region (${response.totalListings} listings)
      `;
    } catch (error) {
      console.error('Location search error:', error);
      locationResult.innerHTML = '<i class="fas fa-times-circle"></i> Could not find market data for this location';
      locationResult.style.color = '#f44336';
    }
  }

  function renderRegionalAnalytics(data) {
    const analyticsRoot = document.getElementById('market-analytics');
    if (!analyticsRoot) return;

    const highestHTML = data.highestMoving.length > 0 
      ? data.highestMoving.map(p => `
          <li>${p.name} 
            <span>KES ${p.avgPrice}/${p.category || 'unit'} (${p.count} listings, ${p.totalQuantity} total)</span>
          </li>
        `).join('')
      : '<li>No data available</li>';

    const lowestHTML = data.lowestMoving.length > 0 
      ? data.lowestMoving.map(p => `
          <li>${p.name} 
            <span>KES ${p.avgPrice}/${p.category || 'unit'} (${p.count} listings, ${p.totalQuantity} total)</span>
          </li>
        `).join('')
      : '<li>No data available</li>';

    analyticsRoot.innerHTML = `
      <div class="analytics-card">
        <div class="analytics-header">
          <h3><i class="fas fa-arrow-trend-up"></i> Highest Moving Products</h3>
          <span class="analytics-badge">${data.location}</span>
        </div>
        <ul class="analytics-list">${highestHTML}</ul>
      </div>
      <div class="analytics-card">
        <div class="analytics-header">
          <h3><i class="fas fa-arrow-trend-down"></i> Lowest Moving Products</h3>
          <span class="analytics-badge">${data.location}</span>
        </div>
        <ul class="analytics-list">${lowestHTML}</ul>
      </div>
    `;
  }

  // Attach search handler
  if (searchBtn) {
    searchBtn.addEventListener('click', searchLocationMarket);
    locationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchLocationMarket();
      }
    });
  }
});
