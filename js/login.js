document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Login form submitted'); // Log para verificar o evento

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('Username:', username); // Log para verificar o valor do username

    try {
        const response = await fetch('https://healthcareoptical-dev.vercel.app/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: username, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data); // Log em caso de sucesso
            document.getElementById('loginMessage').innerText = 'Login successful!';
            localStorage.setItem('authToken', data.token || '');
            window.location.href = '/dashboard.html';
        } else {
            console.log('Login failed'); // Log para falhas
            const errorData = await response.json();
            document.getElementById('loginMessage').innerText = errorData.message || 'Login failed. Please try again.';
        }
    } catch (error) {
        console.error('Error during login:', error); // Log para erros gerais
        document.getElementById('loginMessage').innerText = 'An error occurred. Please try again later.';
    }
});


document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;
    const email = document.getElementById('reg_email').value;

    try {
        const response = await fetch('https://healthcareoptical-dev.vercel.app/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: username, password, reEntryPassword: password, roleNames: ['user'], email })
        });

        if (response.ok) {
            document.getElementById('registerMessage').innerText = 'Registration successful! You can now login.';
        } else {
            const errorData = await response.json();
            document.getElementById('registerMessage').innerText = errorData.message || 'Registration failed. Please try again.';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        document.getElementById('registerMessage').innerText = 'An error occurred. Please try again later.';
    }
});
