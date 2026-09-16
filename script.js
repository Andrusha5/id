const firebaseConfig = {
  apiKey: "AIzaSyAQlAwvaE-j5zqsIuUr1oLTmZ8TGu8dl_Y",
  authDomain: "idsite-46796.firebaseapp.com",
  projectId: "idsite-46796",
  storageBucket: "idsite-46796.firebasestorage.app",
  messagingSenderId: "837699375656",
  appId: "1:837699375656:web:6a6e8f5f01ea61063f5b1d",
  measurementId: "G-KS8DDBXL70"
};
// Ждем полной загрузки всех элементов HTML
window.addEventListener('DOMContentLoaded', () => {

    // === КЛЮЧИ EMAILJS ===
    const EMAILJS_PUBLIC_KEY = "_NQNMTzQod8ygvXoG"; 
    const EMAILJS_SERVICE_ID = "service_obpkrm8";
    const EMAILJS_TEMPLATE_ID = "template_rs3hctq";

    // Инициализация EmailJS
    if (window.emailjs) {
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            console.log("EmailJS успешно подключен!");
        } catch (e) {
            console.error("Ошибка инициализации EmailJS:", e);
        }
    }

    // База данных в браузерной памяти
    let usersDB = JSON.parse(localStorage.getItem('cyber_users')) || [];
    let generatedOTP = null;
    let tempEmail = '';

    // Функция переключения экранов
    function showScreen(screenId) {
        document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    // 1. НАЖАТИЕ: Отправить код на Email
    const btnSendCode = document.getElementById('btn-send-code');
    if (btnSendCode) {
        btnSendCode.addEventListener('click', () => {
            const emailInput = document.getElementById('email-input');
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email.includes('@') || !email.includes('.')) {
                alert('⚠️ Введите корректный E-mail (например: name@gmail.com)!');
                return;
            }

            tempEmail = email;
            generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

            // Меняем текст кнопки на загрузку
            btnSendCode.innerText = "Отправка...";
            btnSendCode.disabled = true;

            // Безопасный расчет времени (исправлено!)
            let expireTime = "";
            try {
                const now = new Date();
                now.setMinutes(now.getMinutes() + 15);
                expireTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            } catch (timeErr) {
                expireTime = "ближайшие 15 минут";
            }

            // Проверяем, загрузилась ли библиотека EmailJS в браузере
            if (window.emailjs && typeof emailjs.send === 'function') {
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: email,
                    email: email,
                    passcode: generatedOTP,   // Переменная {{passcode}} из твоего шаблона
                    time: expireTime          // Переменная {{time}} из твоего шаблона
                })
                .then(() => {
                    alert(`✅ Код отправлен на почту ${email}!\nПроверьте папку Входящие или Спам.`);
                    btnSendCode.innerText = "Отправить код на Email";
                    btnSendCode.disabled = false;
                    showScreen('step-otp');
                })
                .catch((err) => {
                    // Если отправка не удалась (например, лимит писем закончился)
                    alert(`⚠️ Ошибка сервера отправки. Переходим в тестовый режим.\n\n🔑 Твой код доступа: ${generatedOTP}`);
                    btnSendCode.innerText = "Отправить код на Email";
                    btnSendCode.disabled = false;
                    showScreen('step-otp');
                });
            } else {
                // Если скрипт EmailJS заблокирован AdBlock-ом или нет сети
                alert(`📧 [Тестовый режим (EmailJS заблокирован AdBlock/Сетью)]\n\nКод отправлен на виртуальный сервер!\n🔑 Твой код доступа: ${generatedOTP}`);
                btnSendCode.innerText = "Отправить код на Email";
                btnSendCode.disabled = false;
                showScreen('step-otp');
            }
        });
    }

    // 2. НАЖАТИЕ: Проверка кода из письма
    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    if (btnVerifyOtp) {
        btnVerifyOtp.addEventListener('click', () => {
            const otpInput = document.getElementById('otp-input');
            const userOTP = otpInput ? otpInput.value.trim() : '';

            if (userOTP === generatedOTP) {
                alert('✅ Код верный! Теперь создайте ник и пароль.');
                showScreen('step-profile');
            } else {
                alert('❌ Неверный код подтверждения!');
            }
        });
    }

    // 3. НАЖАТИЕ: Завершение регистрации
    const btnFinishReg = document.getElementById('btn-finish-reg');
    if (btnFinishReg) {
        btnFinishReg.addEventListener('click', () => {
            const username = document.getElementById('username-input').value.trim();
            const pass = document.getElementById('pass-input').value;
            const passConfirm = document.getElementById('pass-confirm-input').value;

            const usernameErr = document.getElementById('username-error');
            const passErr = document.getElementById('pass-error');

            if (usernameErr) usernameErr.innerText = '';
            if (passErr) passErr.innerText = '';

            // Только английские буквы, цифры и _
            const validUsernameRegex = /^[a-zA-Z0-9_]+$/;

            if (!validUsernameRegex.test(username)) {
                if (usernameErr) usernameErr.innerText = 'Ник может содержать только английские буквы, цифры и _';
                return;
            }

            // Проверка уникальности в базе
            const userExists = usersDB.some(u => u.username.toLowerCase() === username.toLowerCase());
            if (userExists) {
                if (usernameErr) usernameErr.innerText = 'Этот ник уже занят!';
                return;
            }

            if (pass.length < 4) {
                if (passErr) passErr.innerText = 'Пароль должен быть от 4 символов!';
                return;
            }

            if (pass !== passConfirm) {
                if (passErr) passErr.innerText = 'Пароли не совпадают!';
                return;
            }

            // Сохраняем в память
            const newUser = { email: tempEmail, username: username, password: pass };
            usersDB.push(newUser);
            localStorage.setItem('cyber_users', JSON.stringify(usersDB));

            // Сохраняем активную сессию и делаем редирект
            localStorage.setItem('cyber_current_user', username);
            alert('🎉 Регистрация успешна! Входим в игровой центр...');
            window.location.href = 'game.html';
        });
    }

    // 4. НАЖАТИЕ: Вход
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            const username = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-pass').value;
            const loginErr = document.getElementById('login-error');

            if (loginErr) loginErr.innerText = '';

            const foundUser = usersDB.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);

            if (foundUser) {
                localStorage.setItem('cyber_current_user', foundUser.username);
                window.location.href = 'game.html';
            } else {
                if (loginErr) loginErr.innerText = 'Неверный ник или пароль!';
            }
        });
    }

    // Ссылки переключения экранов
    const goToLogin = document.getElementById('go-to-login');
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('step-login');
        });
    }

    const goToReg = document.getElementById('go-to-reg');
    if (goToReg) {
        goToReg.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('step-email');
        });
    }

});