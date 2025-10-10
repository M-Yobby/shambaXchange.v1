// Dashboard JavaScript - Backend API Integration
import api from './api.js';

let sales = [];
let costs = [];
let crops = [];

// Set current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

// Set default dates in filter inputs to current month
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

document.getElementById('filterStart').value = firstDay;
document.getElementById('filterEnd').value = lastDay;

// Set default date in modals to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('saleDate').value = today;
document.getElementById('modalCostDate').value = today;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async function() {
    await loadSales();
    await loadCosts();
    await loadCrops();
    updateFinancialSummary();
});

async function loadSales() {
    try {
        sales = await api.getSales();
        updateSalesList();
    } catch (error) {
        console.error('Error loading sales:', error);
        sales = [];
    }
}

async function loadCosts() {
    try {
        costs = await api.getCosts();
        updateCostsList(costs);
    } catch (error) {
        console.error('Error loading costs:', error);
        costs = [];
    }
}

async function loadCrops() {
    try {
        crops = await api.getCrops();
        renderCropProgress();
    } catch (error) {
        console.error('Error loading crops:', error);
        crops = [];
        renderCropProgress();
    }
}

function renderCropProgress() {
    const container = document.getElementById('cropProgressContainer');
    
    if (crops.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No crops added yet. Click "Add Crop" to start tracking.</p>';
        return;
    }
    
    container.innerHTML = crops.map(crop => {
        const plantingDate = new Date(crop.plantingDate);
        const harvestDate = new Date(crop.expectedHarvestDate);
        const today = new Date();
        
        const totalDays = Math.max(1, (harvestDate - plantingDate) / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.max(0, (today - plantingDate) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
        
        const color = progress >= 80 ? '#4caf50' : progress >= 50 ? '#ff9800' : '#2196f3';
        
        return `
            <div class="progress-item">
                <div class="progress-header">
                    <span>${crop.cropName} (${crop.fieldLocation})</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%; background-color: ${color};"></div>
                </div>
                ${crop.notes ? `<p style="font-size: 0.85rem; color: #666; margin-top: 0.3rem;">${crop.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

// ---------- Quick Actions ----------
document.getElementById("addSaleBtn").addEventListener("click", () => {
    document.getElementById("saleModal").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("addCostBtn").addEventListener("click", () => {
    document.getElementById("costModal").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
});

// Add Crop
document.getElementById("addCropBtn").addEventListener("click", () => {
    document.getElementById("cropModal").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("closeCropModal").addEventListener("click", () => {
    document.getElementById("cropModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
});

// Yield Calculator
document.getElementById("yieldCalculatorBtn").addEventListener("click", () => {
    document.getElementById("yieldModal").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("closeYieldModal").addEventListener("click", () => {
    document.getElementById("yieldModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
});

// AI Chatbox
document.getElementById("askQuestionBtn").addEventListener("click", () => {
    document.getElementById("aiChatbox").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("closeChatbox").addEventListener("click", () => {
    document.getElementById("aiChatbox").style.display = "none";
    document.getElementById("overlay").style.display = "none";
});

// Learning Hub
document.getElementById("learningHubBtn").addEventListener("click", async () => {
    document.getElementById("learningHub").classList.add("open");
    document.getElementById("overlay").style.display = "block";
    await loadLearningHubContent();
});

document.getElementById("closeLearningHub").addEventListener("click", () => {
    document.getElementById("learningHub").classList.remove("open");
    document.getElementById("overlay").style.display = "none";
});

// Load Learning Hub Content from Sponsors
let currentSlide = 0;
let learningContent = [];

async function loadLearningHubContent() {
    try {
        learningContent = await api.getLearningHubContent();
        if (learningContent.length > 0) {
            renderLearningHub();
        }
    } catch (error) {
        console.error('Error loading learning hub content:', error);
    }
}

function renderLearningHub() {
    const carousel = document.getElementById('hubCarousel');
    const indicators = document.getElementById('hubIndicators');
    
    carousel.innerHTML = '';
    indicators.innerHTML = '';

    learningContent.forEach((content, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `hub-slide${index === 0 ? ' active' : ''}`;
        
        const features = content.features ? JSON.parse(content.features) : [];
        
        slide.innerHTML = `
            <div class="slide-header">
                <h3>${content.title}</h3>
                <span class="badge badge-sponsored">Sponsored</span>
            </div>
            <div class="slide-media">
                ${content.mediaType === 'video' 
                    ? `<video src="${content.mediaUrl}" controls class="slide-image"></video>`
                    : `<img src="${content.mediaUrl}" alt="${content.title}" class="slide-image">`
                }
            </div>
            <div class="slide-content">
                <p>${content.description}</p>
                ${features.length > 0 ? `
                    <ul class="slide-features">
                        ${features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                    </ul>
                ` : ''}
                ${content.learnMoreUrl ? `
                    <a href="${content.learnMoreUrl}" target="_blank" class="btn btn-primary slide-cta">
                        <i class="fas fa-info-circle"></i> Learn More
                    </a>
                ` : ''}
            </div>
        `;
        carousel.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('span');
        indicator.className = `indicator${index === 0 ? ' active' : ''}`;
        indicator.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(indicator);
    });

    // Navigation buttons
    document.getElementById('hubPrev').addEventListener('click', prevSlide);
    document.getElementById('hubNext').addEventListener('click', nextSlide);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hub-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % learningContent.length;
    goToSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + learningContent.length) % learningContent.length;
    goToSlide(prevIndex);
}

// Close modals
document.getElementById("closeSaleModal").addEventListener("click", () => {
    document.getElementById("saleModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
});

document.getElementById("closeCostModal").addEventListener("click", () => {
    document.getElementById("costModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('overlay')) {
        document.querySelectorAll('.modal, #aiChatbox').forEach(modal => {
            modal.style.display = 'none';
        });
        document.getElementById('learningHub').classList.remove('open');
        document.getElementById('overlay').style.display = 'none';
    }
});

// ---------- Add Sale ----------
document.getElementById("saveSaleBtn").addEventListener("click", async () => {
    const product = document.getElementById("saleProduct").value;
    const quantity = parseFloat(document.getElementById("saleQuantity").value);
    const price = parseFloat(document.getElementById("salePrice").value);
    const date = document.getElementById("saleDate").value;

    if (!product || !quantity || !price || !date) {
        alert("Please fill in all fields");
        return;
    }

    const saleData = {
        product,
        quantity,
        price,
        date,
        total: quantity * price
    };

    try {
        const newSale = await api.createSale(saleData);
        sales.push(newSale);
        updateSalesList();
        updateFinancialSummary();

        // Reset form
        document.getElementById("saleProduct").value = "";
        document.getElementById("saleQuantity").value = "";
        document.getElementById("salePrice").value = "";
        document.getElementById("saleModal").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    } catch (error) {
        alert('Error adding sale: ' + error.message);
    }
});

// ---------- Add Cost ----------
document.getElementById("saveCostBtn").addEventListener("click", async () => {
    const category = document.getElementById("modalCostCategory").value;
    const description = document.getElementById("modalCostDescription").value;
    const amount = parseFloat(document.getElementById("modalCostAmount").value);
    const date = document.getElementById("modalCostDate").value;

    if (!category || !description || !amount || !date) {
        alert("Please fill in all fields");
        return;
    }

    const costData = {
        category,
        description,
        amount,
        date
    };

    try {
        const newCost = await api.createCost(costData);
        costs.push(newCost);
        updateCostsList(costs);
        updateFinancialSummary();

        // Reset form
        document.getElementById("modalCostCategory").value = "";
        document.getElementById("modalCostDescription").value = "";
        document.getElementById("modalCostAmount").value = "";
        document.getElementById("costModal").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    } catch (error) {
        alert('Error adding cost: ' + error.message);
    }
});

// ---------- Add Crop ----------
document.getElementById("cropForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const cropName = document.getElementById("cropName").value;
    const fieldLocation = document.getElementById("fieldLocation").value;
    const plantingDate = document.getElementById("plantingDate").value;
    const expectedHarvestDate = document.getElementById("expectedHarvestDate").value;
    const notes = document.getElementById("cropNotes").value;

    const cropData = {
        cropName,
        fieldLocation,
        plantingDate,
        expectedHarvestDate,
        notes
    };

    try {
        const newCrop = await api.createCrop(cropData);
        crops.push(newCrop);
        renderCropProgress();

        // Reset form
        document.getElementById("cropForm").reset();
        document.getElementById("cropModal").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    } catch (error) {
        alert('Error adding crop: ' + error.message);
    }
});

// ---------- Update Sales List ----------
function updateSalesList() {
    const tbody = document.querySelector("#salesTable tbody");
    tbody.innerHTML = "";

    sales.forEach(sale => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.product}</td>
            <td>${sale.quantity} ${sale.unit || 'kg'}</td>
            <td>KSH ${sale.price.toLocaleString()}</td>
            <td>KSH ${sale.total.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// ---------- Update Costs List ----------
function updateCostsList(costsToDisplay) {
    const costContainer = document.getElementById("costsContainer");
    costContainer.innerHTML = "";

    if (costsToDisplay.length === 0) {
        costContainer.innerHTML = '<p style="text-align: center; color: #888;">No costs recorded yet.</p>';
        return;
    }

    costsToDisplay.forEach(cost => {
        const costCard = document.createElement("div");
        costCard.className = "cost-item";
        costCard.innerHTML = `
            <div class="cost-header">
                <h4>${cost.category}</h4>
                <span class="cost-amount">KSH ${cost.amount.toLocaleString()}</span>
            </div>
            <p>${cost.description}</p>
            <small>${new Date(cost.date).toLocaleDateString()}</small>
        `;
        costContainer.appendChild(costCard);
    });
}

// ---------- Filter Costs ----------
document.getElementById("filterCostsBtn").addEventListener("click", () => {
    const category = document.getElementById("costCategoryFilter").value;
    const startDate = new Date(document.getElementById("filterStart").value);
    const endDate = new Date(document.getElementById("filterEnd").value);

    let filteredCosts = costs;

    if (category) {
        filteredCosts = filteredCosts.filter(c => c.category === category);
    }

    filteredCosts = filteredCosts.filter(c => {
        const costDate = new Date(c.date);
        return costDate >= startDate && costDate <= endDate;
    });

    updateCostsList(filteredCosts);
});

// ---------- Update Financial Summary ----------
function updateFinancialSummary() {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const netProfit = totalRevenue - totalCosts;

    document.getElementById("totalRevenue").textContent = `KSH ${totalRevenue.toLocaleString()}`;
    document.getElementById("totalCosts").textContent = `KSH ${totalCosts.toLocaleString()}`;
    document.getElementById("netProfit").textContent = `KSH ${netProfit.toLocaleString()}`;
    document.getElementById("netProfit").style.color = netProfit >= 0 ? "#4caf50" : "#f44336";

    updateCharts(totalRevenue, totalCosts, netProfit);
}

// ---------- Charts ----------
let revenueChart = null;

function updateCharts(revenue, costTotal, profit) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Revenue', 'Costs', 'Profit'],
            datasets: [{
                data: [revenue, costTotal, Math.max(0, profit)],
                backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// ---------- Yield Calculator ----------
document.getElementById("calculateYieldBtn").addEventListener("click", () => {
    const landSize = parseFloat(document.getElementById("landSize").value);
    const expectedYield = parseFloat(document.getElementById("expectedYield").value);
    const marketPrice = parseFloat(document.getElementById("marketPrice").value);

    if (!landSize || !expectedYield || !marketPrice) {
        alert("Please fill in all fields");
        return;
    }

    const totalProduction = landSize * expectedYield;
    const potentialRevenue = totalProduction * marketPrice;

    document.getElementById("yieldResult").innerHTML = `
        <div style="background: #f1f8f4; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #2e7d32; margin-bottom: 15px;">Projection Results</h3>
            <p><strong>Total Production:</strong> ${totalProduction.toLocaleString()} kg</p>
            <p><strong>Potential Revenue:</strong> KSH ${potentialRevenue.toLocaleString()}</p>
            <p><strong>Per Acre Revenue:</strong> KSH ${(potentialRevenue / landSize).toLocaleString()}</p>
        </div>
    `;
});

// ---------- AI Chatbot ----------
let chatHistory = [];

document.getElementById("sendChatBtn").addEventListener("click", async () => {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message) return;

    // Display user message
    appendChatMessage("user", message);
    input.value = "";

    // Show typing indicator
    const typingId = appendChatMessage("bot", "Thinking...");

    try {
        const response = await api.chatWithAI(message);
        // Remove typing indicator
        document.getElementById(typingId).remove();
        // Display bot response
        appendChatMessage("bot", response.response);
    } catch (error) {
        document.getElementById(typingId).remove();
        appendChatMessage("bot", "Sorry, I couldn't process your request. Please try again.");
    }
});

// Allow Enter key to send message
document.getElementById("chatInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("sendChatBtn").click();
    }
});

function appendChatMessage(sender, text) {
    const chatMessages = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    const messageId = `msg-${Date.now()}`;
    messageDiv.id = messageId;
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageId;
}

// ---------- Export Data ----------
document.getElementById("exportDataBtn").addEventListener("click", () => {
    const csvContent = [
        ["Date", "Product", "Quantity", "Price", "Total"],
        ...sales.map(s => [s.date, s.product, s.quantity, s.price, s.total])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
});
