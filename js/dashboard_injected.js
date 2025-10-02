
/* Injected dashboard handlers: ensures Add Sale/Add Cost buttons open modals and data saved to localStorage */
(function(){
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function createModal(id, title, fields){
    if(document.getElementById(id)) return;
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <span class="close" data-close="${id}">&times;</span>
        </div>
        <form id="${id}-form">
        ${fields.map(f => `<div class="form-group"><label>${f.label}</label><input type="${f.type}" id="${f.id}" class="form-control" ${f.required ? 'required' : ''}></div>`).join('')}
        <button type="submit" class="btn btn-primary" style="width:100%;">Save</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // Find buttons (by id, data attributes, or text)
    const buttons = qsa('button, a');
    let addSaleBtn = buttons.find(b => (b.id && /addsale|add-sale|addSale/i.test(b.id)) || /add\s*sale/i.test(b.textContent));
    let addCostBtn = buttons.find(b => (b.id && /addcost|add-cost|addCost/i.test(b.id)) || /add\s*cost/i.test(b.textContent));

    // create modals if not exist
    createModal('injectedSaleModal', 'Add Sale', [
      {label:'Product', type:'text', id:'in_sale_product', required:true},
      {label:'Quantity', type:'number', id:'in_sale_qty', required:true},
      {label:'Price per Unit', type:'number', id:'in_sale_price', required:true},
      {label:'Date', type:'date', id:'in_sale_date', required:true}
    ]);
    createModal('injectedCostModal', 'Add Cost', [
      {label:'Item', type:'text', id:'in_cost_item', required:true},
      {label:'Category', type:'text', id:'in_cost_category', required:true},
      {label:'Amount (KES)', type:'number', id:'in_cost_amount', required:true},
      {label:'Date', type:'date', id:'in_cost_date', required:true}
    ]);

    const saleModal = document.getElementById('injectedSaleModal');
    const costModal = document.getElementById('injectedCostModal');

    // If buttons not found, create floating action buttons to open modals
    if(!addSaleBtn){
      addSaleBtn = document.createElement('button');
      addSaleBtn.className = 'btn btn-primary';
      addSaleBtn.textContent = 'Add Sale';
      addSaleBtn.style.position='fixed'; addSaleBtn.style.bottom='90px'; addSaleBtn.style.right='20px'; addSaleBtn.style.zIndex=9999;
      document.body.appendChild(addSaleBtn);
    }
    if(!addCostBtn){
      addCostBtn = document.createElement('button');
      addCostBtn.className = 'btn btn-secondary';
      addCostBtn.textContent = 'Add Cost';
      addCostBtn.style.position='fixed'; addCostBtn.style.bottom='40px'; addCostBtn.style.right='20px'; addCostBtn.style.zIndex=9998;
      document.body.appendChild(addCostBtn);
    }

    function openModal(modal){ if(modal) modal.style.display='flex'; }
    function closeModal(modal){ if(modal) modal.style.display='none'; }

    addSaleBtn.addEventListener('click', function(e){ e.preventDefault(); openModal(saleModal); });
    addCostBtn.addEventListener('click', function(e){ e.preventDefault(); openModal(costModal); });

    // close handlers
    document.body.addEventListener('click', function(e){
      if(e.target && e.target.matches('.modal .close')){
        const mid = e.target.getAttribute('data-close');
        const m = document.getElementById(mid);
        if(m) m.style.display='none';
      }
    });

    // handle submit sale
    const saleForm = document.getElementById('injectedSaleModal-injectedSaleModal-form') || document.getElementById('injectedSaleModal-form');
    // the id we created is 'injectedSaleModal-form'
    const saleFormActual = document.getElementById('injectedSaleModal-form');
    if(saleFormActual){
      saleFormActual.addEventListener('submit', function(e){
        e.preventDefault();
        const product = document.getElementById('in_sale_product').value;
        const qty = parseFloat(document.getElementById('in_sale_qty').value) || 0;
        const price = parseFloat(document.getElementById('in_sale_price').value) || 0;
        const date = document.getElementById('in_sale_date').value || new Date().toISOString().split('T')[0];
        const total = qty * price;
        const sales = JSON.parse(localStorage.getItem('sales')||'[]');
        sales.push({product, qty, price, date, total});
        localStorage.setItem('sales', JSON.stringify(sales));
        closeModal(saleModal);
        // trigger a refresh of lists if present
        if(typeof refreshDashboardLists === 'function') refreshDashboardLists();
      });
    }

    const costFormActual = document.getElementById('injectedCostModal-form');
    if(costFormActual){
      costFormActual.addEventListener('submit', function(e){
        e.preventDefault();
        const item = document.getElementById('in_cost_item').value;
        const category = document.getElementById('in_cost_category').value;
        const amount = parseFloat(document.getElementById('in_cost_amount').value) || 0;
        const date = document.getElementById('in_cost_date').value || new Date().toISOString().split('T')[0];
        const costs = JSON.parse(localStorage.getItem('costs')||'[]');
        costs.push({item, category, amount, date});
        localStorage.setItem('costs', JSON.stringify(costs));
        closeModal(costModal);
        if(typeof refreshDashboardLists === 'function') refreshDashboardLists();
      });
    }

    // Basic modal styles injection if not present
    if(!document.getElementById('injected-modal-styles')){
      const style = document.createElement('style');
      style.id = 'injected-modal-styles';
      style.innerHTML = `
.modal{ position:fixed; left:0; top:0; width:100%; height:100%; display:none; justify-content:center; align-items:center; background:rgba(0,0,0,0.5); z-index:9999;}
.modal-content{ background:#fff; border-radius:8px; padding:1rem; width:95%; max-width:500px; box-shadow:0 6px 24px rgba(0,0,0,0.15); }
.modal-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
.modal-header .close{ cursor:pointer; font-size:1.4rem; }
.form-group{ margin-bottom:0.8rem; }
.form-control{ width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px; }
`;
      document.head.appendChild(style);
    }

  }); // DOMContentLoaded
})(); // IIFE
