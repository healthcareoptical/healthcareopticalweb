/**
 * Initializes the "Message Us" form by attaching a submit event listener
 * to handle message submissions.
 */
function initMessageUs(){
    setTimeout(() => {
        const messageForm = document.getElementById('messageForm');
        const resultModal = generateDialog();
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.appendChild(resultModal)
        messageForm.addEventListener('submit', (event) => submitMessage(event));
    },1);
}   

/**
 * Handles the submission of the "Message Us" form.
 * Sends the message details to the server via a POST request.
 * @param {Event} event - The form submit event.
 */
async function submitMessage(event){
    event.preventDefault();
    const confirmModal = document.getElementById('resultContentModal');
    let message;
    let content = document.getElementById('message').value.trim();
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    message ='<p><strong>Name : ' + name + '</p></strong><strong><p>Email :'+ email + '</p></strong><strong><p>Message :'+ content + '</p></strong>'; 
    try {
        showSpinner();
        const response = await fetch(BASE_PATH + 'email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject: 'Enquiry from ' + name, message })
        });
        
        $('#messageModal').modal('hide');
        if (response.ok) {
            confirmModal.setAttribute('property-name', 'success');
            document.getElementById('message').value ='';
            document.getElementById('name').value = '';
            document.getElementById('email').value='';
        } else {
           throw new Error(response.status);
        } 
        getContent();
        hideSpinner();
        $('#resultModal').modal('show');
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();    
        $('#resultModal').modal('show');
    }
}
