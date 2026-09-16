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

            // Сообщение пользователю
            btnSendCode.innerText = "Отправка...";
            btnSendCode.disabled = true;

            // Отправляем реальное письмо через EmailJS
            if (window.emailjs) {
                const expireTime
                = new Date(Date.now() + 15 * 6000).toLocateTimeString([], {hour: 
                    '2-digit', minute:'2-digit'});



                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: email,
                    email: email,
                    passcode: generatedOTP,
                    time: expireTime
                }).then(() => {
                    alert(`✅ Код отправлен на почту ${email}!\nПроверьте папку Входящие или Спам.`);
                    btnSendCode.innerText = "Отправить код на Email";
                    btnSendCode.disabled = false;
                    showScreen('step-otp');
                }).catch((err) => {
                    alert(`⚠️ Не удалось отправить письмо на почту.\nПричина: ${err.text || 'Ошибка сервера'}\n\nКод для входа: ${generatedOTP}`);
                    btnSendCode.innerText = "Отправить код на Email";
                    btnSendCode.disabled = false;
                    showScreen('step-otp');
                });
            } else {
                alert(`📧 [Тестовый режим]\nВаш код: ${generatedOTP}`);
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
                alert('✅ Код верный! Придумайте ник и пароль.');
                showScreen('step-profile');
            } else {
                alert('❌ Неверный код! Попробуйте еще раз.');
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

            // Регулярное выражение: eng буквы, цифры, _
            const validUsernameRegex = /^[a-zA-Z0-9_]+$/;

            if (!validUsernameRegex.test(username)) {
                if (usernameErr) usernameErr.innerText = 'Ник должен быть только на английском (буквы, цифры, _)';
                return;
            }

            // Проверка уникальности
            const userExists = usersDB.some(u => u.username.toLowerCase() === username.toLowerCase());
            if (userExists) {
                if (usernameErr) usernameErr.innerText = 'Этот ник уже занят! Выберите другой.';
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

            // Сохраняем в базу
            const newUser = { email: tempEmail, username: username, password: pass };
            usersDB.push(newUser);
            localStorage.setItem('cyber_users', JSON.stringify(usersDB));

            // Авторизуем и переходим на страницу игры
            localStorage.setItem('cyber_current_user', username);
            alert('🎉 Регистрация завершена! Добро пожаловать в игру!');
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

    // Переход на экран входа
    const goToLogin = document.getElementById('go-to-login');
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('step-login');
        });
    }

    // Переход на экран регистрации
    const goToReg = document.getElementById('go-to-reg');
    if (goToReg) {
        goToReg.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('step-email');
        });
    }

});