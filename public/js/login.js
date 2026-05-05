document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // UI loading
    const btn = document.querySelector('.login-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Başarılı giriş
            showMessage('✅ Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            localStorage.setItem('adminToken', result.token);
            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1500);
        } else {
            showMessage('❌ ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Bağlantı hatası! Server çalışıyor mu?', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

function showMessage(text, type) {
    const errorDiv = document.createElement('div');
    errorDiv.className = type;
    errorDiv.textContent = text;
    document.querySelector('.login-card').appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 4000);
}

// Enter tuşu
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});