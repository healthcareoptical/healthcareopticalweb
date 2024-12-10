/**
 * Initializes the login process by resetting the session and setting up the login form.
 * This function appends a modal dialog to the login form container and binds the login event.
 */
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

/**
 * Handles the login process by sending the username and password to the server.
 * Stores the user's role in session storage upon success and displays appropriate feedback on failure.
 * 
 * @param {Event} event - The event object triggered by the form submission.
 */
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

/**
 * Logs out the current user by removing the stored role from the session.
 * Updates the UI to reflect the logged-out state.
 */
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
