const EN_URL = './languages/en.json';
const ZH_URL = './languages/zh.json'
const ZH_ATTR = 'display-value-zh';
const EN_ATTR = 'display-value-en';
const BASE_PATH='https://healtcareoptical.vercel.app/';
const HOME_URL = './pages/home.html';
const ABOUT_US_URL = './pages/aboutUs.html';
const CONTACT_US_URL = './pages/contactUs.html';
const PRODUCT_URL = './pages/productlist.html';
const LOGIN_URL = './pages/login.html';
const SYSTEM_URL = './pages/system.html';

function showSpinner() {
    document.getElementById('loading-backdrop').style.display = 'flex';
}

function hideSpinner() {
    document.getElementById('loading-backdrop').style.display = 'none';
}

async function getContent() {
    try {
        const url = localStorage.getItem('htclang') === 'zh' ? ZH_URL : EN_URL;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const allElements = document.querySelectorAll('[property-name]');

        for (let i = 0; i < allElements.length; i++) {
            const value = data[allElements[i].getAttribute('property-name')];
            allElements[i].innerHTML = value;
        }

    } catch (error) {
        console.error("Error fetching the JSON file:", error);
    }
}

async function getContentByKey(key, url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data[key];

    } catch (error) {
        console.error("Error fetching the JSON file:", error);
    }
}

async function switchPage(page, firstLoad=false ) {  
    if (!firstLoad){
        event.preventDefault();
    }
    try {
        const response = await fetch(page); 
        if (!response.ok) {
            throw new Error(`Page not found: ${page}`);
        }
        const data = await response.text();
        document.getElementById('container').innerHTML = data;
        if (page === PRODUCT_URL) {
            getMenuData();
        }
        if (page === SYSTEM_URL) {
            clickSystemTab('product');
        }
        if (page === LOGIN_URL) {
            initLogin();
        }
        if (page === CONTACT_US_URL) {
            initMessageUs();
        }
        getContent();
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('container').innerHTML = `<p>Error loading ${page} content.</p>`;
    }
}

function generateValueFromApi(){
    const getAttribute = localStorage.getItem('htclang') === 'zh' ? ZH_ATTR : EN_ATTR;
    const allElements = document.querySelectorAll('[data-from-api]');
    for (let i = 0; i < allElements.length; i++) {
        const value = allElements[i].getAttribute(getAttribute);
        allElements[i].innerText = value;
    }
}

function switchLang(){
    const checkbox = document.getElementById('language-toggle');

    if (localStorage.getItem('htclang')) {
        localStorage.removeItem('htclang');
    }

    if (checkbox.checked) {
        localStorage.setItem('htclang','zh');
    }
    getContent();
    generateValueFromApi();
}

function generateDialog(tab = undefined){
    const modalDiv = document.createElement('div');
    modalDiv.classList.add('modal','fade', 'backdrop');
    modalDiv.id="resultModal";
    modalDiv.tabIndex = "-1";
    modalDiv.role="dialog";
    modalDiv.ariaLabelledby="resultModalLabel";

    const modalDialogDiv = document.createElement('div');
    modalDialogDiv.classList.add('modal-dialog', 'centered-modal');
    modalDialogDiv.role = 'document';

    const modalContentDiv = document.createElement('div');
    modalContentDiv.classList.add('modal-content');

    const modalBodyDiv = document.createElement('div');
    modalBodyDiv.classList.add('modal-body');
    modalBodyDiv.id="resultContentModal";
    modalBodyDiv.setAttribute('property-name', 'message');
    modalContentDiv.appendChild(modalBodyDiv);

    const modalFooterDiv = document.createElement('div');
    modalFooterDiv.classList.add('modal-footer');

    const modalCancelBtn = document.createElement('button');
    modalCancelBtn.classList.add('btn','btn-default');
    modalCancelBtn.setAttribute('property-name', 'confirm');
    modalCancelBtn.setAttribute('data-dismiss','modal');
    modalFooterDiv.appendChild(modalCancelBtn);

    modalContentDiv.appendChild(modalFooterDiv);
    modalDialogDiv.appendChild(modalContentDiv);
    modalDiv.appendChild(modalDialogDiv);

    $(modalDiv).modal({
         backdrop: 'static', 
         show: false
    });

    if (tab){
        modalDiv.addEventListener('click', function (event) {
            if (event.target.matches('[data-dismiss="modal"]')) {
                const resultContentModal = document.getElementById('resultContentModal');
                const displayedMessage = resultContentModal.getAttribute('property-name');
                if (displayedMessage ==='success') {
                    clickSystemTab(tab)
                }
            }
        });
    }   

    return modalDiv;
}

function generateSystemMaintenance(){
    const menu = document.getElementById('menubar');
    const login = menu.querySelector('li:nth-child(5)');
    const aElement = document.querySelector('li a[property-name="login"]');
    aElement.setAttribute('property-name', 'logout');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href="#";
    a.setAttribute('property-name', 'system');
    a.addEventListener('click', function() {
        switchPage(SYSTEM_URL);
    });
    li.appendChild(a);
    menu.insertBefore(li, login);
    switchPage(SYSTEM_URL, true);
}
