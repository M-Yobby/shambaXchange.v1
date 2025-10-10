// Dashboard JavaScript - Backend API Integration
import api from './api.js';

let sales = [];
let costs = [];

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

// ---------- Quick Actions ----------
document.getElementById("addSaleBtn").addEventListener("click", () => {
    document.getElementById("saleModal").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("addCostBtn").addEventListener("click", () => {
    document.getElementById("costModal").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
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
document.getElementById("learningHubBtn").addEventListener("click", () => {
    document.getElementById("learningHub").classList.add("open");
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("closeLearningHub").addEventListener("click", () => {
    document.getElementById("learningHub").classList.remove("open");
    document.getElementById("overlay").style.display = "none";
});

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
