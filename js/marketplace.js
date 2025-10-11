// js/marketplace.js - Marketplace logic (v3)
// Features:
// - Buy section visible by default showing horizontally scrollable cards.
// - 'View All' opens a modal grid view.
// - Sell form adds listing, persists to localStorage, and updates Buy section immediately.
// - Market Social supports media uploads and displays media in a grid layout.

// Utility for listings storage
function getListings(){ return JSON.parse(localStorage.getItem('sx_listings') || '[]'); }
function saveListings(list){ localStorage.setItem('sx_listings', JSON.stringify(list)); }

document.addEventListener('DOMContentLoaded', ()=>{
  const buyBtn = document.getElementById('buy-btn');
  const sellBtn = document.getElementById('sell-btn');
  const buySection = document.getElementById('buy-section');
  const sellSection = document.getElementById('sell-section');
  const buyHorizontal = document.getElementById('buy-lists-horizontal');
  const sellForm = document.getElementById('sell-form');
  const allModal = document.getElementById('all-listings-modal');
  const allGrid = document.getElementById('all-listings-grid');
  const viewAllLink = document.getElementById('view-all-listings');
  const cancelSell = document.getElementById('cancel-sell');

  // default view: buy visible
  buySection.style.display = 'block';
  sellSection.style.display = 'none';

  // Predefined items if no listings exist
  const defaultListings = [
    {category:'Produce', item:'Maize', quantity:100, units:'bags', location:'Nakuru', id:Date.now()+1},
    {category:'Produce', item:'Avocado', quantity:200, units:'kgs', location:'Kiambu', id:Date.now()+2},
    {category:'Inputs', item:'Fertilizer', quantity:50, units:'bags', location:'Embu', id:Date.now()+3},
    {category:'Services', item:'Transport', quantity:10, units:'trips', location:'Mombasa', id:Date.now()+4},
    {category:'Machinery', item:'Tractor', quantity:1, units:'units', location:'Kericho', id:Date.now()+5}
  ];

  // initialize listings storage
  if(getListings().length===0) saveListings(defaultListings);

  function renderHorizontal(){
    const list = getListings();
    // group by category for small sections
    const byCat = {};
    list.forEach(l=>{ byCat[l.category] = byCat[l.category] || []; byCat[l.category].push(l); });
    buyHorizontal.innerHTML = '';
    for(const [cat,items] of Object.entries(byCat)){
      const section = document.createElement('div');
      section.className = 'buy-category-section';
      section.innerHTML = `<h4>${cat}</h4><div class="cards-row"></div>`;
      const row = section.querySelector('.cards-row');
      items.forEach(it=>{
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<h4 class="product-title">${it.item}</h4><div class="product-meta">${it.quantity} ${it.units} • ${it.location}</div><div style="margin-top:8px;"><button class="btn btn-primary btn-sm contact-btn" data-id="${it.id}">Contact Seller</button></div>`;
        row.appendChild(card);
      });
      buyHorizontal.appendChild(section);
    }
  }

  function renderAllGrid(){
    const list = getListings();
    allGrid.innerHTML = '';
    list.slice().reverse().forEach(it=>{
      const c = document.createElement('div');
      c.className = 'product-card';
      c.innerHTML = `<h3 class="product-title">${it.item}</h3><div class="product-meta">${it.quantity} ${it.units} • ${it.location} • ${it.category}</div>`;
      allGrid.appendChild(c);
    });
  }

  // buttons with toggle active state
  buyBtn.addEventListener('click', ()=>{ 
    buySection.style.display='block'; 
    sellSection.style.display='none';
    buyBtn.classList.add('active');
    sellBtn.classList.remove('active');
  });
  sellBtn.addEventListener('click', ()=>{ 
    sellSection.style.display='block'; 
    buySection.style.display='none';
    sellBtn.classList.add('active');
    buyBtn.classList.remove('active');
  });

  // view all link opens modal
  viewAllLink.addEventListener('click', (e)=>{ e.preventDefault(); renderAllGrid(); allModal.style.display='block'; });
  document.getElementById('close-all-listings').addEventListener('click', ()=> allModal.style.display='none');

  cancelSell.addEventListener('click', ()=>{ 
    sellSection.style.display='none'; 
    buySection.style.display='block';
    buyBtn.classList.add('active');
    sellBtn.classList.remove('active');
  });

  // handle new listing form
  sellForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(sellForm));
    const listings = getListings();
    const newItem = {...data, id: Date.now()};
    listings.push(newItem);
    saveListings(listings);
    // update UI: show buy and refresh horizontal and all grid
    sellForm.reset();
    buySection.style.display='block';
    sellSection.style.display='none';
    renderHorizontal();
    renderAllGrid();
  });

  // initial render
  renderHorizontal();

  // Market Social: posts with media grid (only if elements exist)
  const postBtn = document.querySelector('.post-btn');
  const postInput = document.querySelector('.post-input');
  const postsRoot = document.getElementById('social-posts');
  const mediaUpload = document.getElementById('media-upload');

  if (postBtn && postInput && postsRoot && mediaUpload) {
    function renderMediaGrid(files){
      // returns HTML grid of media previews
      let s = '<div class="media-grid">';
      for(const file of files){
        if(file.type.startsWith('image/')){
          s += `<div class="media-cell"><img src="${URL.createObjectURL(file)}" alt="img" /></div>`;
        } else if(file.type.startsWith('video/')){
          s += `<div class="media-cell"><video controls><source src="${URL.createObjectURL(file)}"></video></div>`;
        }
      }
      s += '</div>';
      return s;
    }

    postBtn.addEventListener('click', ()=>{
      const text = postInput.value.trim();
      if(!text && mediaUpload.files.length===0){ alert('Write something or upload media before posting.'); return; }
      const post = document.createElement('div');
      post.className = 'post-card';
      const mediaHtml = mediaUpload.files.length ? renderMediaGrid(mediaUpload.files) : '';
      post.innerHTML = `<div class="post-header"><img src="https://randomuser.me/api/portraits/men/45.jpg" class="farmer-avatar" alt="You"/><strong>You</strong></div><div class="post-body"><p>${text}</p>${mediaHtml}</div>`;
      postsRoot.prepend(post);
      postInput.value = '';
      mediaUpload.value = '';
    });
  }
});
