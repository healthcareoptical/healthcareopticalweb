function initLogin(){
    logout();
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        const loginFormDiv = document.getElementById('loginFormDiv');
        const resultModal = generateDialog();
        loginFormDiv.appendChild(resultModal);
        loginForm.addEventListener('submit', (event) => 
        {
            login(event);
        });
    }, 1);
}

async function login(event){
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmModal = document.getElementById('resultContentModal');
    try {
        showSpinner();
        const response = await fetch(BASE_PATH + 'auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: username, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('role', data.roles[0]);
            generateSystemMaintenance();            
        } else {
           throw new Error(response.status);
        }   
        getContent();
        hideSpinner();
    } catch (error) {
        console.log('in catch ',error.message);
        if (error.message === '500'){
            confirmModal.setAttribute('property-name', 'incorrectPassword');
        } else {
            confirmModal.setAttribute('property-name', 'error');
        }
        getContent();
        hideSpinner();    
        $('#resultModal').modal('show');
    }
}

function logout(){
    const role = sessionStorage.getItem('role');
    if (role){
        sessionStorage.removeItem('role');
        const aElement = document.querySelector('li a[property-name="logout"]');
        aElement.setAttribute('property-name', 'login');
        const systemElement = document.querySelector('li a[property-name="system"]').parentElement;
        systemElement.remove();
    }
}

/*
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Login form submitted'); // Log para verificar o evento

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('Username:', username); // Log para verificar o valor do username

    try {
        const response = await fetch(BASE_PATH + 'auth/login', {
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

/*
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
*/