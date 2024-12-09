// Declare global variables
let products;
let filterProducts;
let menus;
let allZh;
let allEn;

/**
 * Fetches the menu data from the API and handles errors.
 * It populates the dialog container and updates the menu tab with categories and brands.
 * 
 * @param {boolean} [isFirstTime=true] - Flag to indicate whether it's the first time loading the menu data.
 */
async function getMenuData(isFirstTime =true) {
    const dialogContainer = document.getElementById('dialogId');
    const dialog = generateDialog();
    dialogContainer.innerHTML ='';
    dialogContainer.appendChild(dialog);
    const confirmModal = document.getElementById('resultContentModal');
    $('#confirmModal').modal('hide');
    try {
        showSpinner();
        const response = await fetch(BASE_PATH +'menu', {
              method: "GET",
              redirect: "follow"
        }); 
        if (!response.ok) {
            throw new Error('Error');
        }
        const data = await response.json();
        allZh = await getContentByKey('all', ZH_URL);
        allEn = await getContentByKey('all', EN_URL); 
        products = await getProductData();
        menus = data.menu;
        generateCategoryTab(menus);
        hideSpinner();
    } catch (error) {
        if (isFirstTime) {
            getMenuData(false);
        } else {
            confirmModal.setAttribute('property-name', 'error');
            getContent();
            hideSpinner();    
            $('#resultModal').modal('show');
        }
    }
}

/**
 * Generates and displays the category tabs based on the menu data.
 * 
 * @param {Array} menus - The list of menu categories.
 */
function generateCategoryTab(menus){
    const categoryTab = document.getElementById('myTab');
    categoryTab.innerHTML = '';
    if(menus){
        let defaultBrands;
        let defaultCatId;
        isActive = true;
        menus.forEach(menu => {
            const categoryli = document.createElement('li');
            const categoryhref = document.createElement('a');
            if (isActive){
                categoryli.classList.add('active');
                isActive = false;
                defaultBrands = menu.brands;
                defaultCatId = menu.category._id
            }
            categoryhref.setAttribute('data-toggle', 'tab');
            categoryhref.setAttribute('data-from-api', 'true');
            categoryhref.setAttribute('display-value-en', menu.category.categoryNameEn + '(' + menu.count +')');
            categoryhref.setAttribute('display-value-zh', menu.category.categoryNameZh + '(' + menu.count +')');
            categoryhref.setAttribute('cat-id', menu.category._id);
            categoryhref.setAttribute('onClick', 'clickCategory(this)')
            categoryli.appendChild(categoryhref);
            categoryTab.appendChild(categoryli);
        });
        generateBrandTab(defaultBrands,defaultCatId)
    }
}

/**
 * Handles category tab click and updates the brand tab.
 * 
 * @param {HTMLElement} catTab - The clicked category tab element.
 */
function clickCategory(catTab){
    const catId = catTab.getAttribute('cat-id');
    const brands = menus.find(menuItem => menuItem.category._id === catId).brands;
    generateBrandTab(brands, catId);
}

/**
 * Generates and displays the brand tabs based on the selected category.
 * 
 * @param {Array} brands - The list of brands in the selected category.
 * @param {string} catId - The ID of the selected category.
 */
function generateBrandTab(brands, catId){
    const brandTabList = document.getElementById('myTabMenuList');
    brandTabList.innerHTML = '';
    if(brands){
        const allBrandItem = document.createElement('li');
        const allBrandshref = document.createElement('a');
        allBrandshref.setAttribute('data-toggle', 'tab');
        allBrandshref.setAttribute('data-from-api', 'true');
        allBrandshref.setAttribute('display-value-en', allEn);
        allBrandshref.setAttribute('display-value-zh', allZh);
        allBrandshref.setAttribute('cat-id', catId);
        allBrandshref.setAttribute('brand-id', '');
        allBrandshref.setAttribute('onClick', 'clickBrand(this)')
        allBrandItem.classList.add('active');
        allBrandItem.appendChild(allBrandshref);
        brandTabList.appendChild(allBrandItem);
        brands.forEach(brand => {
            const brandli = document.createElement('li');
            const brandhref = document.createElement('a');
            brandhref.setAttribute('data-toggle', 'tab');
            brandhref.setAttribute('data-from-api', 'true');
            brandhref.setAttribute('display-value-en', brand.brand.brandNameEn + '(' + brand.count +')');
            brandhref.setAttribute('display-value-zh', brand.brand.brandNameZh + '(' + brand.count +')');
            brandhref.setAttribute('cat-id', catId);
            brandhref.setAttribute('brand-id', brand.brand._id);
            brandhref.setAttribute('onClick', 'clickBrand(this)')
            brandli.appendChild(brandhref);
            brandTabList.appendChild(brandli);
        });
        filterProductsByCriteria(catId, null);
    }
}

/**
 * Handles brand tab click and filters products based on the selected category and brand.
 * 
 * @param {HTMLElement} brandTab - The clicked brand tab element.
 */
function clickBrand(brandTab){
    const catId = brandTab.getAttribute('cat-id');
    const brandId = brandTab.getAttribute('brand-id');
    filterProductsByCriteria(catId, brandId);

}

/**
 * Filters the products based on the selected category and brand.
 * 
 * @param {string} catId - The ID of the selected category.
 * @param {string|null} brandId - The ID of the selected brand (optional).
 */
function filterProductsByCriteria(catId, brandId) {
    if (brandId) {
        filterProducts = products.filter(product => product.category === catId)
                                 .filter(product => product.brand === brandId);
    } else {
        filterProducts = products.filter(product => product.category === catId);
    }
    generateProductsView();
}

/**
 * Generates the view of the filtered products and displays them.
 * 
 * @param {string} [sortOption='1'] - The selected sort option (1: Date Asc, 2: Date Desc, 3: Price Asc, 4: Price Desc).
 */
function generateProductsView(sortOption = '1'){
    if (filterProducts){
        switch (sortOption) {
            case '1':
                filterProducts.sort((a,b) => {
                    return new Date(b.releaseDate) - new Date(a.releaseDate);
                });
                break;
            case '2':
                filterProducts.sort((a,b) => {
                    return new Date(a.releaseDate) - new Date(b.releaseDate);
                });
                break;
            case '3':
                filterProducts.sort((a,b) => {
                    return Number(a.price) - Number(b.price);
                });
                break;
            case '4':
                filterProducts.sort((a,b) => {
                    return Number(b.price) - Number(a.price);
                });
                break;
            default:
                filterProducts.sort((a,b) => {
                    return new Date(a.releaseDate) - new Date(b.releaseDate);
                });
        }

        const productsTab = document.getElementById('myTabContent');
        productsTab.innerHTML = '';
        
        const selectOpt = document.getElementById('productSort');

        if (!selectOpt){
            const optionSelect = document.createElement('select');
            optionSelect.classList.add('text-left');
            optionSelect.id = 'productSort';
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            const option3 = document.createElement('option');
            const option4 = document.createElement('option');
            option1.value = '1';
            option1.selected = (sortOption === option1.value); 
            option1.setAttribute('property-name', 'sortDateAsc');
            option2.value = '2';
            option2.selected = (sortOption === option2.value); 
            option2.setAttribute('property-name', 'sortDateDesc');
            option3.value = '3';
            option3.selected = (sortOption === option3.value); 
            option3.setAttribute('property-name', 'sortPriceAsc');
            option4.value = '4';
            option4.selected = (sortOption === option4.value); 
            option4.setAttribute('property-name', 'sortPriceDesc');
            optionSelect.setAttribute('onchange','selectSortOption(this.value)')
            optionSelect.appendChild(option1);
            optionSelect.appendChild(option2);
            optionSelect.appendChild(option3);
            optionSelect.appendChild(option4);

            const catTab = document.getElementById('catTab');
            catTab.appendChild(optionSelect);
        }

        const outerDiv = document.createElement('div');
        const containerDiv = document.createElement('div');
        const rowDiv = document.createElement('div');

        outerDiv.classList.add('technicalTeam');
        containerDiv.classList.add('container');
        rowDiv.classList.add('row');

        filterProducts.forEach(product => {
            const productContainerDiv = document.createElement('div');
            const producthref = document.createElement('a');
            const productDiv = document.createElement('div');
            const productImg = document.createElement('img');
            const detailDiv = document.createElement('div');
            const modelDiv = document.createElement('div');
            const modelNoLabel = document.createElement('label');
            const modelNoSpan = document.createElement('span');
            const productNameDiv = document.createElement('div');
            const productNameLabel = document.createElement('label');
            const productNameSpan = document.createElement('span');
            const priceDiv = document.createElement('div');
            const priceLabel = document.createElement('label');
            const priceSpan = document.createElement('span');
            const releaseDiv = document.createElement('div');
            const releaseLabel = document.createElement('label');
            const releaseSpan = document.createElement('span');


            productContainerDiv.classList.add('col-md-4');
            productContainerDiv.classList.add('col-sm-6');
            productContainerDiv.classList.add('col-xs-12');
            productDiv.classList.add('team');
            detailDiv.classList.add('team_txt');
        
            productImg.src = product.imageUrl ||'./images/default_glass.avif';

            modelNoLabel.setAttribute('property-name', 'modelNo');
            modelNoSpan.innerText = product.modelNo;
            modelDiv.appendChild(modelNoLabel);
            modelDiv.appendChild(modelNoSpan);
            detailDiv.appendChild(modelDiv);
            
            productNameLabel.setAttribute('property-name', 'productName');
            productNameSpan.setAttribute('display-value-en', product.prodNameEn);
            productNameSpan.setAttribute('display-value-zh', product.prodNameZh);
            productNameSpan.setAttribute('data-from-api' ,'true');
            productNameDiv.appendChild(productNameLabel);
            productNameDiv.appendChild(productNameSpan);
            detailDiv.appendChild(productNameDiv);

            priceLabel.setAttribute('property-name', 'price');
            priceSpan.innerText = product.price;
            priceDiv.appendChild(priceLabel);
            priceDiv.appendChild(priceSpan);
            detailDiv.appendChild(priceDiv);

            releaseLabel.setAttribute('property-name', 'releaseDate');
            releaseSpan.innerText = getDateFromJsonString(product.releaseDate);
            releaseDiv.appendChild(releaseLabel);
            releaseDiv.appendChild(releaseSpan);
            detailDiv.appendChild(releaseDiv);

            productDiv.appendChild(productImg);
            productDiv.appendChild(detailDiv);
            producthref.appendChild(productDiv);
            producthref.setAttribute('product', JSON.stringify(product));
            producthref.setAttribute('onclick', "generateProductDetailTab(this)");

            productContainerDiv.appendChild(producthref);
            rowDiv.appendChild(productContainerDiv);
        })
        containerDiv.appendChild(rowDiv);
        outerDiv.appendChild(containerDiv);
        productsTab.appendChild(outerDiv);
    }
    getContent();
    generateValueFromApi();
}

/**
 * Extracts the date from the JSON string.
 * 
 * @param {string} jsonDt - The date in JSON format (e.g., "2024-12-08T12:34:56").
 * @returns {string} - The extracted date in "YYYY-MM-DD" format.
 */
function getDateFromJsonString(jsonDt){
    const index = jsonDt.indexOf('T');
    return jsonDt.substring(0,index);
}

/**
 * Handles sorting option change and refreshes the product view.
 * 
 * @param {string} selectOpt - The selected sort option.
 */
function selectSortOption(selectOpt){
    generateProductsView(selectOpt);
}

/**
 * Generates the product detail page when a product is clicked.
 * 
 * @param {HTMLElement} productTab - The clicked product tab element.
 */
function generateProductDetailTab(productTab) {
    const product = JSON.parse(productTab.getAttribute('product'));
    const productsTab = document.getElementById('myTabContent');
    productsTab.innerHTML = '';

    const productDetailDiv =document.createElement('div');
    const containerDiv = document.createElement('div');
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    containerDiv.classList.add('container');
    containerDiv.classList.add('perContent');
    productDetailDiv.classList.add('teamDetail');

    const imgContainerDiv = document.createElement('div');
    const imgDiv =  document.createElement('div');
    const img =  document.createElement('img');
    imgDiv.classList.add('per_pic');
    imgContainerDiv.classList.add('col-md-4', 'col-sm-4' , 'col-xs-12');
    img.src = product.imageUrl;
    img.classList.add('h-300');
    img.style.objectFit = 'cover';
    imgDiv.appendChild(img);
    imgContainerDiv.appendChild(imgDiv);
    rowDiv.appendChild(imgContainerDiv);

    const detailConatiner = document.createElement('div');
    const detailDiv = document.createElement('div');
    const modelDiv = document.createElement('div');
    const modelLabel = document.createElement('label');
    const modeltext = document.createElement('span');
    const nameDiv = document.createElement('div');
    const nameLabel = document.createElement('label');
    const nametext = document.createElement('span');
    const priceDiv = document.createElement('div');
    const priceLabel = document.createElement('label');
    const pricetext = document.createElement('span');
    const releaseDiv = document.createElement('div');
    const releaseLabel = document.createElement('label');
    const releaseText = document.createElement('span');

    detailConatiner.classList.add('col-md-8');
    detailConatiner.classList.add('col-sm-8');
    detailConatiner.classList.add('col-xs-12');
    detailDiv.classList.add('per_text');

    modelLabel.setAttribute('property-name', 'modelNo');
    modeltext.innerText = product.modelNo;
    modelDiv.appendChild(modelLabel);
    modelDiv.appendChild(modeltext);
    detailDiv.appendChild(modelDiv);
            
    nameLabel.setAttribute('property-name', 'productName');
    nametext.setAttribute('display-value-en', product.prodNameEn);
    nametext.setAttribute('display-value-zh', product.prodNameZh);
    nametext.setAttribute('data-from-api' ,'true');
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(nametext);
    detailDiv.appendChild(nameDiv);

    priceLabel.setAttribute('property-name', 'price');
    pricetext.innerText = product.price;
    priceDiv.appendChild(priceLabel);
    priceDiv.appendChild(pricetext);
    detailDiv.appendChild(priceDiv);

    releaseLabel.setAttribute('property-name', 'releaseDate');
    releaseText.innerText = getDateFromJsonString(product.releaseDate);
    releaseDiv.appendChild(releaseLabel);
    releaseDiv.appendChild(releaseText);
    detailDiv.appendChild(releaseDiv);

    detailConatiner.appendChild(detailDiv);
    rowDiv.appendChild(detailConatiner);

    const descriptionContainer = document.createElement('div');
    const descriptionDiv = document.createElement('div');
    const descriptionHeader = document.createElement('h3');
    const description = document.createElement('p');
    descriptionContainer.classList.add('col-md-12');
    descriptionDiv.classList.add('per_txt_detail');
    descriptionHeader.setAttribute('property-name', 'productDescription');
    description.setAttribute('display-value-en', product.prodDescEn);
    description.setAttribute('display-value-zh', product.prodDescZh);
    description.setAttribute('data-from-api' ,'true');
    descriptionDiv.appendChild(descriptionHeader);
    descriptionDiv.appendChild(description);
    descriptionContainer.appendChild(descriptionDiv);
    rowDiv.appendChild(descriptionContainer);

    containerDiv.appendChild(rowDiv);
    productDetailDiv.appendChild(containerDiv);
    productsTab.appendChild(productDetailDiv);

    getContent();
    generateValueFromApi();
}

/**
 * Fetches product data from the API, handles the response, and returns the list of products.
 * It updates the UI by showing a loading dialog, and handles errors gracefully.
 * 
 * @returns {Promise<Array>} A promise that resolves to the list of products.
 * @throws {Error} If the fetch request fails or returns an error.
 */
async function getProductData() {
    const dialogContainer = document.getElementById('dialogId');
    const dialog = generateDialog();
    dialogContainer.innerHTML ='';
    dialogContainer.appendChild(dialog);
    const confirmModal = document.getElementById('resultContentModal');
    $('#confirmModal').modal('hide');
    try {
        const response = await fetch(BASE_PATH +'product', { 
            method: "GET",
            redirect: "follow"
        }); 
        if (!response.ok) {
            throw new Error('Error');
        }
        const data = await response.json();
        return data.products;
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();    
        $('#resultModal').modal('show');
    }
}

/**
 * Toggles the visibility of the sorting options.
 * This function is triggered by user interaction with the UI to display or hide the sort options.
 */
function toggleSortOptions() {
    const sortBy = document.querySelector('.sort-by');
    sortBy.classList.toggle('open');
}


