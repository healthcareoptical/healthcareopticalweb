const EN_URL = './languages/en.json';
const ZH_URL = './languages/zh.json'
const ZH_ATTR = 'display-value-zh';
const EN_ATTR = 'display-value-en';
const BASE_PATH='https://healthcareoptical-dev.vercel.app/'
const HOME_URL = './pages/home.html'
const ABOUT_US_URL = './pages/aboutUs.html';
const CONTACT_US_URL = './pages/contactUs.html';
const PRODUCT_URL = './pages/productlist.html';
const LOGIN_URL = './pages/login.html';

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
            allElements[i].innerText = value;
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
    if (localStorage.getItem('htclang')) {
        localStorage.removeItem('htclang');
    } else {
        localStorage.setItem('htclang','zh');
    }   
    getContent();
    generateValueFromApi();
}

