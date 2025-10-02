// js/app.js - v4 navigation fix
async function loadPartial(selector, url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Failed to load partial: ' + url);
    const html = await res.text();
    document.querySelector(selector).innerHTML = html;
  }catch(err){
    console.error(err);
  }
}
function resolvePath(rel){ return new URL(rel, window.location.href).href; }

export async function initApp(){
  await loadPartial('#header-root', resolvePath('../views/partials/header.html'));
  await loadPartial('#footer-root', resolvePath('../views/partials/footer.html'));

  // Greeting
  const h = new Date().getHours();
  const g = document.getElementById('greeting');
  if(g){ g.textContent = h<12?'Good morning!':h<18?'Good afternoon!':'Good evening!'; }

  // Map nav targets
  const map = {dashboard:'../views/dashboard.html', market:'../views/market.html', marketplace:'../views/marketplace.html', social:'../views/social.html', expertDashboard:'../views/expert-dashboard.html', adminDashboard:'../views/admin-dashboard.html'};
  document.body.addEventListener('click', (e)=>{
    const link = e.target.closest('.nav-link');
    if(!link) return;
    e.preventDefault();
    const p = link.getAttribute('data-page');
    if(map[p]) window.location.href = resolvePath(map[p]);
  });
  document.querySelectorAll('.bottom-nav-item.nav-link').forEach(it=>{
    it.addEventListener('click',(e)=>{
      e.preventDefault();
      const p = it.getAttribute('data-page');
      if(map[p]) window.location.href = resolvePath(map[p]);
    });
  });
}
initApp();

// load social script when on social page
if (typeof window !== 'undefined') {
  // social.js included by pages that need it
}
