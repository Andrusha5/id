// База данных пользователей в памяти браузера
let usersDB = JSON.parse(localStorage.getItem('cyber_users')) || [];
let generatedOTP = null;
let tempEmail = '';

// Функция переключения экранов
function showScreen(screenId) {
    document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 1. Отправка кода на почту
document.getElementById('btn-send-code').addEventListener('click', () => {
    const email = document.getElementById('email-input').value.trim();
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('Введите корректный E-mail!');
        return;
    }
    
    tempEmail = email;
    generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    
    alert(`📧 [CyberVault Security]\nВаш код подтверждения: ${generatedOTP}`);
    showScreen('step-otp');
});

// 2. Проверка кода
document.getElementById('btn-verify-otp').addEventListener('click', () => {
    const userOTP = document.getElementById('otp-input').value.trim();
    
    if (userOTP === generatedOTP) {
        showScreen('step-profile');
    } else {
        alert('❌ Неверный код!');
    }
});

// 3. Регистрация пользователя
document.getElementById('btn-finish-reg').addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('pass-input').value;
    const passConfirm = document.getElementById('pass-confirm-input').value;
    
    const usernameErr = document.getElementById('username-error');
    const passErr = document.getElementById('pass-error');
    
    usernameErr.innerText = '';
    passErr.innerText = '';

    // Проверка: только английские буквы, цифры и _
    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!validUsernameRegex.test(username)) {
        usernameErr.innerText = 'Только английские буквы, цифры и символ _';
        return;
    }

    // Проверка уникальности ника в базе
    const userExists = usersDB.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (userExists) {
        usernameErr.innerText = 'Этот ник уже занят!';
        return;
    }

    if (pass.length < 4) {
        passErr.innerText = 'Пароль слишком короткий (минимум 4 символа)';
        return;
    }

    if (pass !== passConfirm) {
        passErr.innerText = 'Пароли не совпадают!';
        return;
    }

    // Сохраняем нового пользователя
    const newUser = { email: tempEmail, username: username, password: pass };
    usersDB.push(newUser);
    localStorage.setItem('cyber_users', JSON.stringify(usersDB));

    alert('🎉 Регистрация успешна! Войдите под своим ником.');
    showScreen('step-login');
});

// 4. Вход
document.getElementById('btn-login').addEventListener('click', () => {
    const username = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-pass').value;
    const loginErr = document.getElementById('login-error');

    loginErr.innerText = '';

    const foundUser = usersDB.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);

    if (foundUser) {
        document.getElementById('user-display-name').innerText = foundUser.username;
        showScreen('step-dashboard');
    } else {
        loginErr.innerText = 'Неверный ник или пароль!';
    }
});

// Переходы по ссылкам
document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('step-login');
});

document.getElementById('go-to-reg').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('step-email');
});

document.getElementById('btn-logout').addEventListener('click', () => {
    showScreen('step-login');
});