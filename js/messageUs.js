function initMessageUs(){
    setTimeout(() => {
        const messageForm = document.getElementById('messageForm');
        const resultModal = generateDialog();
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.appendChild(resultModal)
        messageForm.addEventListener('submit', (event) => submitMessage(event));
    },1);
}   

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
            content.value ='';
            name.value='';
            email.value='';
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
