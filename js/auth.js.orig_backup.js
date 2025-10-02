// js/auth.js - simple client-side auth demo (no real backend)
document.addEventListener('DOMContentLoaded', function(){
  const roleBtns = document.querySelectorAll('.role-btn');
  const roleSelect = document.getElementById('role');
  const authForm = document.getElementById('auth-form');
  const toggleBtn = document.getElementById('toggle-register');
  const formTitle = document.getElementById('form-title');
  const msg = document.getElementById('auth-msg');
  let isRegister = false;

  roleBtns.forEach(b=> b.addEventListener('click', ()=> roleSelect.value = b.getAttribute('data-role')) );

  toggleBtn.addEventListener('click', ()=>{
    isRegister = !isRegister;
    formTitle.textContent = isRegister ? 'Register' : 'Login';
    toggleBtn.textContent = isRegister ? 'Switch to Login' : 'Switch to Register';
    msg.textContent = '';
  });

  authForm.addEventListener('submit', function(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(authForm));
    if(!data.role || !data.name || !data.phone || !data.password){
      msg.textContent = 'Please fill all required fields (role, name, phone, password).';
      return;
    }
    const users = JSON.parse(localStorage.getItem('sx_users') || '[]');
    users.push({...data, createdAt:new Date().toISOString()});
    localStorage.setItem('sx_users', JSON.stringify(users));
    msg.style.color = 'green';
    msg.textContent = 'Saved locally. Redirecting to dashboard...';
    setTimeout(()=>{
      window.location.href = new URL('views/dashboard.html', window.location.href).href;
    }, 700);
  });
});
