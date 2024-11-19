let products;
let filterProducts;
let menus;
let allZh;
let allEn;

async function getMenuData() {
    try {
        const response = await fetch(BASE_PATH +'menu', {
            method: 'GET'
        }); 
        if (!response.ok) {
            const errorDetails = await response.json().catch(() => ({
                message: 'Error when get resources',
            }));
            throw { 
                status: response.status, 
                message: errorDetails.message || response.statusText 
            };
        }
        const data = await response.json();
        allZh = await getContentByKey('all', ZH_URL);
        allEn = await getContentByKey('all', EN_URL); 
        products = await getProductData();
        menus = data.menu;
        generateCategoryTab(menus);
    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        return {
            status: error.status || 500,
            message: errorMessage,
        };
    }
}

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

function clickCategory(catTab){
    const catId = catTab.getAttribute('cat-id');
    const brands = menus.find(menuItem => menuItem.category._id === catId).brands;
    generateBrandTab(brands, catId);
}

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

function clickBrand(brandTab){
    const catId = brandTab.getAttribute('cat-id');
    const brandId = brandTab.getAttribute('brand-id');
    filterProductsByCriteria(catId, brandId);

}

function filterProductsByCriteria(catId, brandId) {
    if (brandId) {
        filterProducts = products.filter(product => product.category === catId)
                                     .filter(product => product.brand === brandId);
    } else {
        filterProducts = products.filter(product => product.category === catId);
    }
    generateProductsView();
}

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
        
        const dropDownDiv = document.createElement('div');
        const optionSelect = document.createElement('select');
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
        optionSelect.classList.add('selectSortBy');
        optionSelect.setAttribute('onchange','selectSortOption(this.value)')
        optionSelect.appendChild(option1);
        optionSelect.appendChild(option2);
        optionSelect.appendChild(option3);
        optionSelect.appendChild(option4);
        dropDownDiv.classList.add('topRightDropdown');
        dropDownDiv.appendChild(optionSelect);
        productsTab.appendChild(dropDownDiv);

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
        
            productImg.src = product.imageUrl;

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
            producthref.setAttribute('onclick', "generateProductDetail(this)");

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

function getDateFromJsonString(jsonDt){
    const index = jsonDt.indexOf('T');
    return jsonDt.substring(0,index);
}

function selectSortOption(selectOpt){
    generateProductsView(selectOpt);
}

function generateProductDetail(productTab) {
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
    imgContainerDiv.classList.add('col-md-4');
    imgContainerDiv.classList.add('col-sm-4');
    imgContainerDiv.classList.add('col-xs-12');
    img.src = product.imageUrl;
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


async function getProductData() {
    try {
        const response = await fetch(BASE_PATH +'product', { 
            method : 'GET'
        }); 
        if (!response.ok) {
            const errorDetails = await response.json().catch(() => ({
                message: 'Error when get resources',
            }));
            throw { 
                status: response.status, 
                message: errorDetails.message || response.statusText 
            };
        }
        const data = await response.json();
        return data.products;
    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        return {
            status: error.status || 500,
            message: errorMessage,
        };
    }
}

function toggleSortOptions() {
    const sortBy = document.querySelector('.sort-by');
    sortBy.classList.toggle('open');
}

