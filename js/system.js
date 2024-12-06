async function clickSystemTab(tab) {
    const role = sessionStorage.getItem('role');
    const userLi = document.querySelector('li a[property-name="users"]'); 
    if (role === 'admin' && !userLi) {
        const ul = document.getElementById('myTab');
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('data-toggle', 'tab');
        a.setAttribute('property-name', 'users');
        a.addEventListener('click', () => {
            clickSystemTab('user')
        });
        li.appendChild(a);
        ul.appendChild(li);
    }
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = '';
    const resultModal = generateDialog(tab);
    contentContainer.appendChild(resultModal);
    const confirmModal = document.getElementById('resultContentModal');
    $('#confirmModal').modal('hide');
    try {
        showSpinner();
        let data;
        let noDataFound = false;
        const response = await fetch(BASE_PATH +tab, {
              method: "GET",
              redirect: "follow"
        }); 
        if (!response.ok) {
            if (response.status === 500) {
                noDataFound= true;
            } else {
                throw new Error('Error');
            }
        }
        if (tab !== 'product') {
            if (noDataFound) {
                data = undefined;
            } else {
                data = await response.json();
            }
        } else {
            const catResponse = await fetch(BASE_PATH +'category', {
                method: "GET",
                redirect: "follow"
            }); 
            if (!catResponse.ok) {
                console.log('catch error cate :', response);
                throw new Error('Error');
            }
            const brandResponse = await fetch(BASE_PATH +'brand', {
                method: "GET",
                redirect: "follow"
            });
            if (!brandResponse.ok) {
                throw new Error('Error');
            }
            const productData = await response.json();
            const catData = await catResponse.json();
            const brandData = await brandResponse.json();
            data = {
                products: noDataFound ? undefined : productData.products,
                categories: catData.categories,
                brands: brandData.brands,
            };
        }
        generateSystemContentTab(data, tab);
        getContent();
        generateValueFromApi();
        hideSpinner();
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();    
        $('#resultModal').modal('show');
    }
}

function generateSystemContentTab(data, tab) {
    const newContainer = document.getElementById('addNewContainer');
    newContainer.innerHTML = '';
    const createButton = document.createElement('button');
    createButton.style.marginLeft = 'auto';
    createButton.display = 'block';
    createButton.classList.add('btn', 'btn-primary', 'btn-lg');
    createButton.setAttribute('property-name','create');
    createButton.addEventListener('click', () => createNew(tab, data?data.categories: undefined, data?data.brands:undefined));
    newContainer.appendChild(createButton);

    const showContentTab = document.getElementById('selectContainer');
    showContentTab.innerHTML = '';

    if (tab !== 'product') {
        if (data !== undefined) {
            const modifiedData = modifyData(data, tab);
            const dropDownMenu = generateDropDown(modifiedData, tab);
            showContentTab.appendChild(dropDownMenu);
        }
    } else {
        if (data.products !== undefined) {
            const modifiedData = modifyData(data, tab);
            const dropDownMenu = generateDropDown(modifiedData, tab);
            showContentTab.appendChild(dropDownMenu);
        }
    }
}

function createNew(tab, categoriesData, brandsData) {
    generateElementDetail(tab, {}, categoriesData, brandsData, true);
    getContent();
    generateValueFromApi();
}

function modifyData(data, tab) {
    let modifiedData;
    switch(tab) {
        case 'product':
            productData = data.products.map(product => ({
                 ...product,
                displayNameEn: (product.prodNameEn || '') + ' - ' + (product.modelNo || ''),
                displayNameZh: (product.prodNameZh || '') + ' - ' + (product.modelNo || '')
            }));
            modifiedData = { categories : data.categories, brands : data.brands, products: productData}; 
            break;
        case 'category':
            modifiedData = data.categories.map(category => ({
                ...category, 
                displayNameEn : category.categoryNameEn,
                displayNameZh : category.categoryNameZh
            }));
            break;
        case 'brand':
            modifiedData = data.brands.map(brand => ({
                ...brand, 
                displayNameEn : brand.brandNameEn, 
                displayNameZh :brand.brandNameZh
            }));
            break;
        case 'user':
            modifiedData = data.users.map(user => ({
                ...user, 
                displayNameEn : user.userId, 
                displayNameZh : user.userId
            }));
            break;
        default:
            break;
    }
    return modifiedData;
}

function generateDropDown(data, tab) {
    const div = document.createElement('div');
    div.classList.add('dropdown');
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'dropdown-toggle');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('data-toggle', 'dropdown');
    button.setAttribute('id', 'dropdownMenuButton');
    button.setAttribute('property-name', 'select');
    div.appendChild(button);
    const ul = document.createElement('ul');
    ul.classList.add('dropdown-menu');
    ul.setAttribute('aria-labelledby','dropdownMenuButton');
    let requiredData = data;
    if (tab === 'product') {
        requiredData = data.products;
    }
    requiredData.forEach(element => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.classList.add('dropdown-item');
        a.setAttribute('href', "#");
        a.setAttribute('display-value-en', element.displayNameEn);
        a.setAttribute('display-value-zh', element.displayNameZh);
        a.setAttribute('data-from-api' ,'true');
        a.setAttribute('data-value', JSON.stringify(element));
        a.setAttribute('data-type', tab);
        if (tab === 'product') {
            a.addEventListener('click', (event) => selectElement(event, data.categories, data.brands));
        } else {
            a.addEventListener('click', (event) => selectElement(event, {}, {}));
        }
        li.appendChild(a);
        ul.appendChild(li);
    });
    div.appendChild(ul);
    return div;
}

function selectElement(event, catgoriesData, brandsData) {
    event.preventDefault();
    const selectedText = this.textContent;
    const dropdownButton = document.getElementById('dropdownMenuButton');
    dropdownButton.innerHTML = selectedText + "<span class='caret'></span>";
    const data = event.target.getAttribute('data-value');
    const tab = event.target.getAttribute('data-type');
    generateElementDetail(tab, JSON.parse(data), catgoriesData, brandsData);
    getContent();
    generateValueFromApi();
}

function generateElementDetail(tab, data, categoriesData, brandsData, isNew = false) {
    const contentContainer = document.getElementById('contentContainer');
    const confirmModal = generateConfirmDeleteModal(tab);
    const resultModal = generateDialog(tab);
    contentContainer.innerHTML = '';
    contentContainer.appendChild(confirmModal);
    contentContainer.appendChild(resultModal);
    switch(tab) {
        case 'product':
            const prodDiv = generateProductDetail(data, categoriesData, brandsData, isNew);
            contentContainer.appendChild(prodDiv);
            break;
        case 'category':
            const categoryDiv = generateCategoryDetail(data, isNew);
            contentContainer.appendChild(categoryDiv);
            break;
        case 'brand':
            const brandDiv = generateBrandDetail(data, isNew);
            contentContainer.appendChild(brandDiv);
            break;
        case 'user':
            const userDiv = generateUser(data, isNew);
            contentContainer.appendChild(userDiv);
            break;
        default:
            break;
    }
}

function generateProductDetail(product, categoriesData, brandsData, isNew) {

    const productForm = document.createElement('form');
    const productDetailDiv =document.createElement('div');
    productDetailDiv.classList.add('container');
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    //Image
    const imgContainerDiv = document.createElement('div');
    const imgDiv =  document.createElement('div');
    const fileInput = document.createElement('input');
    const img =  document.createElement('img');
    imgDiv.classList.add('per_pic');
    imgContainerDiv.classList.add('col-md-4');
    imgContainerDiv.classList.add('col-sm-4');
    imgContainerDiv.classList.add('col-xs-12');
    img.src = product.imageUrl || './images/default_glass.avif';
    img.style.width = '100%';
    img.style.height = '100%';
    img.id='displayImage';
    imgDiv.style.objectFit = 'cover';
    imgDiv.appendChild(img);
    fileInput.id = 'fileUpload';
    fileInput.classList.add('form-control-file');
    fileInput.type = 'file';
    fileInput.accept="image/*";
    if (isNew) {
        fileInput.required = true;
    }
    fileInput.addEventListener('change', (event) => previewImage(event));
    imgContainerDiv.appendChild(imgDiv);
    imgContainerDiv.appendChild(fileInput);
    rowDiv.appendChild(imgContainerDiv);


    const containerDiv = document.createElement('div');
    containerDiv.classList.add('col-md-6');

    //Model No:
    const modelDiv = document.createElement('div');
    const modelLabel = document.createElement('label');
    const modelTextDiv = document.createElement('div');
    const modelText = document.createElement('input');

    modelDiv.classList.add('form-group', 'row', 'mb-3');
    modelLabel.setAttribute('property-name', 'modelNo');
    modelLabel.classList.add('col-sm-9', 'col-form-label', 'text-left');
    modelDiv.appendChild(modelLabel);
    modelTextDiv.classList.add('col-sm-9');
    modelText.classList.add('form-control');
    modelText.type = 'text';
    modelText.id ='modelNo';
    modelText.required = true;
    modelText.value = product.modelNo || '';
    modelTextDiv.appendChild(modelText);
    modelDiv.appendChild(modelTextDiv);

    containerDiv.appendChild(modelDiv);

    // name English
    const nameEnDiv = document.createElement('div');
    const nameEnLabel = document.createElement('label');
    const nameEnTextDiv = document.createElement('div');
    const nameEnText = document.createElement('input');

    nameEnDiv.classList.add('form-group', 'row', 'mb-3');
    nameEnLabel.setAttribute('property-name', 'productNameEn');
    nameEnLabel.classList.add('col-sm-9', 'col-form-label', 'text-left');
    nameEnDiv.appendChild(nameEnLabel);
    nameEnTextDiv.classList.add('col-sm-9');
    nameEnText.classList.add('form-control');
    nameEnText.type = 'text';
    nameEnText.id ='productNameEn';
    nameEnText.required = true;
    nameEnText.value = product.prodNameEn || '';
    nameEnTextDiv.appendChild(nameEnText);
    nameEnDiv.appendChild(nameEnTextDiv);

    containerDiv.appendChild(nameEnDiv);

    // name Chinese
    const nameZhDiv = document.createElement('div');
    const nameZhLabel = document.createElement('label');
    const nameZhTextDiv = document.createElement('div');
    const nameZhText = document.createElement('input');

    nameZhDiv.classList.add('form-group', 'row', 'mb-3');
    nameZhLabel.setAttribute('property-name', 'productNameZh');
    nameZhLabel.classList.add('col-sm-9', 'col-form-label', 'text-left');
    nameZhDiv.appendChild(nameZhLabel);
    nameZhTextDiv.classList.add('col-sm-9');
    nameZhText.classList.add('form-control');
    nameZhText.type = 'text';
    nameZhText.required = true;
    nameZhText.id ='productNameZh';
    nameZhText.value = product.prodNameZh || '';
    nameZhTextDiv.appendChild(nameZhText);
    nameZhDiv.appendChild(nameZhTextDiv);

    containerDiv.appendChild(nameZhDiv);

    //price
    const priceDiv = document.createElement('div');
    const priceLabel = document.createElement('label');
    const priceTextDiv = document.createElement('div');
    const priceText = document.createElement('input');

    priceDiv.classList.add('form-group', 'row', 'mb-3');
    priceLabel.setAttribute('property-name', 'price');
    priceLabel.classList.add('col-sm-4', 'col-form-label', 'text-left');
    priceDiv.appendChild(priceLabel);
    priceTextDiv.classList.add('col-sm-9');
    priceText.classList.add('form-control');
    priceText.type = 'number';
    priceText.id ='price';
    priceText.required = true;
    priceText.value = product.price || '';
    priceTextDiv.appendChild(priceText);
    priceDiv.appendChild(priceTextDiv);

    containerDiv.appendChild(priceDiv);

    //category
    const categoryDiv = document.createElement('div');
    const categoryLabel = document.createElement('label');
    const categorySelectDiv = document.createElement('div');
    const categorySelect = document.createElement('select');

    categoryDiv.classList.add('form-group', 'row', 'mb-3');
    categoryLabel.setAttribute('property-name', 'category');
    categoryLabel.classList.add('col-sm-4', 'col-form-label', 'text-left');
    categoryDiv.appendChild(categoryLabel);
    categorySelectDiv.classList.add('col-sm-9');
    categorySelect.classList.add('form-control');
    categorySelect.id ='selectCategoryMenu';
    categorySelect.required = true;
    if (isNew) {
        const categoryItemPlaceHolder = document.createElement('option');
        categoryItemPlaceHolder.setAttribute('property-name', 'select');
        categoryItemPlaceHolder.value ='';
        categorySelect.appendChild(categoryItemPlaceHolder);
    }
    categoriesData.forEach(category => {
        const categoryItem = document.createElement('option');
        categoryItem.setAttribute('display-value-en', category.categoryNameEn);
        categoryItem.setAttribute('display-value-zh', category.categoryNameZh);
        categoryItem.setAttribute('data-from-api' ,'true');
        categoryItem.value = JSON.stringify(category);
        if (category._id === product.category) {
            categoryItem.selected = true;
        }
        categorySelect.appendChild(categoryItem);
    })

    categorySelectDiv.appendChild(categorySelect);
    categoryDiv.appendChild(categorySelectDiv);
    containerDiv.appendChild(categoryDiv);

    //brand
    const brandDiv = document.createElement('div');
    const brandLabel = document.createElement('label');
    const brandSelectDiv = document.createElement('div');
    const brandSelect = document.createElement('select');

    brandDiv.classList.add('form-group', 'row', 'mb-3');
    brandLabel.setAttribute('property-name', 'brand');
    brandLabel.classList.add('col-sm-4', 'col-form-label', 'text-left');
    brandSelectDiv.appendChild(brandLabel);
    brandSelectDiv.classList.add('col-sm-9');
    brandSelect.classList.add('form-control');
    brandSelect.id ='selectBrandMenu';
    brandSelect.required = true;
    if (isNew) {
        const brandItemPlaceHolder = document.createElement('option');
        brandItemPlaceHolder.setAttribute('property-name', 'select');
        brandItemPlaceHolder.value ='';
        brandSelect.appendChild(brandItemPlaceHolder);
    }
    brandsData.forEach(brand => {
        const brandItem = document.createElement('option');
        brandItem.setAttribute('display-value-en', brand.brandNameEn);
        brandItem.setAttribute('display-value-zh', brand.brandNameZh);
        brandItem.setAttribute('data-from-api' ,'true');
        brandItem.value = JSON.stringify(brand);
        if (brand._id === product.brand) {
            brandItem.selected = true;
        }
        brandSelect.appendChild(brandItem);
    })

    brandSelectDiv.appendChild(brandSelect);
    brandDiv.appendChild(brandSelectDiv);
    containerDiv.appendChild(brandDiv);
   
    //description English
    const descEnDiv = document.createElement('div');
    const descEnLabel = document.createElement('label');
    const descEnTextDiv = document.createElement('div');
    const descEnText = document.createElement('textarea');

    descEnDiv.classList.add('form-group', 'row', 'mb-3');
    descEnLabel.setAttribute('property-name', 'productDescriptionEn');
    descEnLabel.classList.add('col-sm-9', 'col-form-label', 'text-left');
    descEnDiv.appendChild(descEnLabel);
    descEnTextDiv.classList.add('col-sm-9');
    descEnText.classList.add('form-control');
    descEnText.type = 'text';
    descEnText.id ='productDescriptionEn';
    descEnText.required = true;
    descEnText.value = product.prodDescEn || '';
    descEnText.rows = 3;
    descEnTextDiv.appendChild(descEnText);
    descEnDiv.appendChild(descEnTextDiv);

    containerDiv.appendChild(descEnDiv);

    //description Chinese
    const descZhDiv = document.createElement('div');
    const descZhLabel = document.createElement('label');
    const descZhTextDiv = document.createElement('div');
    const descZhText = document.createElement('textarea');

    descZhDiv.classList.add('form-group', 'row', 'mb-3');
    descZhLabel.setAttribute('property-name', 'productDescriptionZh');
    descZhLabel.classList.add('col-sm-9', 'col-form-label', 'text-left');
    descZhDiv.appendChild(descZhLabel);
    descZhTextDiv.classList.add('col-sm-9');
    descZhText.classList.add('form-control');
    descZhText.type = 'text';
    descZhText.id ='productDescriptionZh';
    descZhText.required = true;
    descZhText.value = product.prodDescZh || '';
    descZhText.rows = 3;
    descZhTextDiv.appendChild(descZhText);
    descZhDiv.appendChild(descZhTextDiv);

    containerDiv.appendChild(descZhDiv);

    //id 
    const idInput = document.createElement('input');
    idInput.type = 'hidden'; 
    idInput.id = 'productId';
    idInput.value = product._id;

    containerDiv.appendChild(idInput);

    rowDiv.appendChild(containerDiv);
    productDetailDiv.appendChild(rowDiv);
    
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML ='';
    buttonDiv.classList.add('container', 'text-center', 'd-flex');

    if (!isNew) { 
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.style.marginRight = '2em';
        saveBtn.type= "submit";

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn','btn-danger');
        deleteBtn.setAttribute('property-name', 'delete');
        deleteBtn.setAttribute('data-target','#confirmModal');
        deleteBtn.setAttribute('data-toggle','modal');
        deleteBtn.type='button';
        deleteBtn.id='deleteButton';
        buttonDiv.appendChild(saveBtn);
        buttonDiv.appendChild(deleteBtn);
    } else {
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.type= "submit";
        buttonDiv.appendChild(saveBtn);
    }
    
    productForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if ($('#selectCategoryMenu').val() === "" || $('#selectBrandMenu').val() === "") {
            errorMessage.show(); 
        }
        modifyProduct(event, isNew);
    });

    productDetailDiv.appendChild(buttonDiv);
    productForm.appendChild(productDetailDiv);
    return productForm;
}

function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
      var output = document.getElementById('displayImage');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function generateCategoryDetail(category, isNew){

    const categoryForm = document.createElement('form');
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('col-md-12');

    //Category Name English:
    const catEnDiv = document.createElement('div');
    const catEnLabel = document.createElement('label');
    const catEnTextDiv = document.createElement('div');
    const catEnText = document.createElement('input');

    catEnDiv.classList.add('form-group', 'row', 'mb-3');
    catEnLabel.setAttribute('property-name', 'categoryNameEn');
    catEnLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    catEnDiv.appendChild(catEnLabel);
    catEnTextDiv.classList.add('col-sm-12');
    catEnText.classList.add('form-control');
    catEnText.type = 'text';
    catEnText.id ='catEnName';
    catEnText.value = category.categoryNameEn || '';
    catEnText.required = true;
    catEnTextDiv.appendChild(catEnText);
    catEnDiv.appendChild(catEnTextDiv);

    containerDiv.appendChild(catEnDiv);

    //Category Name Chinese:
    const catZhDiv = document.createElement('div');
    const catZhLabel = document.createElement('label');
    const catZhTextDiv = document.createElement('div');
    const catZhText = document.createElement('input');

    catZhDiv.classList.add('form-group', 'row', 'mb-3');
    catZhLabel.setAttribute('property-name', 'categoryNameZh');
    catZhLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    catZhDiv.appendChild(catZhLabel);
    catZhTextDiv.classList.add('col-sm-12');
    catZhText.classList.add('form-control');
    catZhText.type = 'text';
    catZhText.id ='catZhName';
    catZhText.value = category.categoryNameZh || '';
    catZhText.required = true;
    catZhTextDiv.appendChild(catZhText);
    catZhDiv.appendChild(catZhTextDiv);

    containerDiv.appendChild(catZhDiv);

    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'categoryId';
    idInput.value = category._id;
    containerDiv.appendChild(idInput);

    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML ='';
    buttonDiv.classList.add('text-center');

    if (!isNew) { 
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.style.marginRight = '2em';
        saveBtn.type= "submit";

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn','btn-danger');
        deleteBtn.setAttribute('property-name', 'delete');
        deleteBtn.setAttribute('data-target','#confirmModal');
        deleteBtn.setAttribute('data-toggle','modal');
        deleteBtn.id='deleteButton';
        deleteBtn.type='button';
        buttonDiv.appendChild(saveBtn);
        buttonDiv.appendChild(deleteBtn);
    } else {
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.type= "submit";
        buttonDiv.appendChild(saveBtn);
    }

    categoryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        modifyCategory(event, isNew);
    });

    containerDiv.appendChild(buttonDiv);
    categoryForm.appendChild(containerDiv);

    return categoryForm;
}


function generateBrandDetail(brand, isNew){

    const brandForm = document.createElement('form');
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('col-md-12');

    //Brand Name English:
    const brandEnDiv = document.createElement('div');
    const brandEnLabel = document.createElement('label');
    const brandEnTextDiv = document.createElement('div');
    const brandEnText = document.createElement('input');

    brandEnDiv.classList.add('form-group', 'row', 'mb-3');
    brandEnLabel.setAttribute('property-name', 'brandNameEn');
    brandEnLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    brandEnDiv.appendChild(brandEnLabel);
    brandEnTextDiv.classList.add('col-sm-12');
    brandEnText.classList.add('form-control');
    brandEnText.type = 'text';
    brandEnText.id ='brandEnName';
    brandEnText.required = true;
    brandEnText.value = brand.brandNameEn || '';
    brandEnTextDiv.appendChild(brandEnText);
    brandEnDiv.appendChild(brandEnTextDiv);

    containerDiv.appendChild(brandEnDiv);

    //Brand Name Chinese:
    const brandZhDiv = document.createElement('div');
    const brandZhLabel = document.createElement('label');
    const brandZhTextDiv = document.createElement('div');
    const brandZhText = document.createElement('input');

    brandZhDiv.classList.add('form-group', 'row', 'mb-3');
    brandZhLabel.setAttribute('property-name', 'brandNameZh');
    brandZhLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    brandZhDiv.appendChild(brandZhLabel);
    brandZhTextDiv.classList.add('col-sm-12');
    brandZhText.classList.add('form-control');
    brandZhText.type = 'text';
    brandZhText.id ='brandZhName';
    brandZhText.value = brand.brandNameZh || '';
    brandZhText.required = true;
    brandZhTextDiv.appendChild(brandZhText);
    brandZhDiv.appendChild(brandZhTextDiv);

    containerDiv.appendChild(brandZhDiv);

    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'brandId';
    idInput.value = brand._id;
    containerDiv.appendChild(idInput);

    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML ='';
    buttonDiv.classList.add('text-center');

    if (!isNew) { 
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.style.marginRight = '2em';
        saveBtn.type= "submit";

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn','btn-danger');
        deleteBtn.setAttribute('property-name', 'delete');
        deleteBtn.setAttribute('data-target','#confirmModal');
        deleteBtn.setAttribute('data-toggle','modal');
        deleteBtn.id='deleteButton';
        deleteBtn.type='button';

        buttonDiv.appendChild(saveBtn);
        buttonDiv.appendChild(deleteBtn);
    } else {
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.type= "submit";
        buttonDiv.appendChild(saveBtn);
    }

    brandForm.addEventListener('submit', function(event) {
        event.preventDefault();
        modifyBrand(event, isNew);
    });


    containerDiv.appendChild(buttonDiv);
    brandForm.appendChild(containerDiv);

    return brandForm;
}

function generateUser(user, isNew) { 

    const userForm = document.createElement('form');
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('col-md-12');
    
    //User Id:
    const userIdDiv = document.createElement('div');
    const userIdLabel = document.createElement('label');
    const userIdTextDiv = document.createElement('div');
    const userIdText = document.createElement('input');

    userIdDiv.classList.add('form-group', 'row', 'mb-3');
    userIdLabel.setAttribute('property-name', 'userId');
    userIdLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    userIdDiv.appendChild(userIdLabel);
    userIdTextDiv.classList.add('col-sm-12');
    userIdText.classList.add('form-control');
    userIdText.type = 'text';
    userIdText.id ='userId';
    userIdText.readOnly = isNew ? false : true;
    userIdText.value = user.userId || '';
    userIdText.required = true;
    userIdTextDiv.appendChild(userIdText);
    userIdDiv.appendChild(userIdTextDiv);

    containerDiv.appendChild(userIdDiv);

    //password
    const passwordDiv = document.createElement('div');
    const passwordLabel = document.createElement('label');
    const passwordTextDiv = document.createElement('div');
    const passwordText = document.createElement('input');

    passwordDiv.classList.add('form-group', 'row', 'mb-3');
    passwordLabel.setAttribute('property-name', 'password');
    passwordLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    passwordDiv.appendChild(passwordLabel);
    passwordTextDiv.classList.add('col-sm-12');
    passwordText.classList.add('form-control');
    passwordText.type = 'password';
    passwordText.id ='password';
    passwordText.required = true;
    passwordText.setAttribute('oncopy',"return false");
    passwordText.setAttribute('oncut',"return false");
    passwordText.setAttribute('onpaste',"return false");
    passwordTextDiv.appendChild(passwordText);
    passwordDiv.appendChild(passwordTextDiv);

    containerDiv.appendChild(passwordDiv);

    //Confirm password
    const confirmPasswordDiv = document.createElement('div');
    const confirmPasswordLabel = document.createElement('label');
    const confirmPasswordTextDiv = document.createElement('div');
    const confirmPasswordText = document.createElement('input');
    const errorSpan = document.createElement('span');

    confirmPasswordDiv.classList.add('form-group', 'row', 'mb-3');
    confirmPasswordLabel.setAttribute('property-name', 'confirmPassword');
    confirmPasswordLabel.classList.add('col-sm-12', 'col-form-label', 'text-left');
    confirmPasswordDiv.appendChild(confirmPasswordLabel);
    confirmPasswordTextDiv.classList.add('col-sm-12');
    confirmPasswordText.classList.add('form-control');
    confirmPasswordText.type = 'password';
    confirmPasswordText.id ='confirmPassword';
    confirmPasswordText.required = true;
    confirmPasswordText.setAttribute('oncopy',"return false");
    confirmPasswordText.setAttribute('oncut',"return false");
    confirmPasswordText.setAttribute('onpaste',"return false");
    errorSpan.classList.add('hidden');
    errorSpan.style.color ='red';
    errorSpan.id="passwordMatchError";
    errorSpan.setAttribute('property-name', 'passwordNotMatch');

    confirmPasswordTextDiv.appendChild(confirmPasswordText);
    confirmPasswordTextDiv.appendChild(errorSpan);
    confirmPasswordDiv.appendChild(confirmPasswordTextDiv);

    containerDiv.appendChild(confirmPasswordDiv);

    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML ='';
    buttonDiv.classList.add('text-center');

    if (!isNew) { 
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.type= "submit";
        saveBtn.style.marginRight= '2em';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn','btn-danger');
        deleteBtn.setAttribute('property-name', 'delete');
        deleteBtn.setAttribute('data-target','#confirmModal');
        deleteBtn.setAttribute('data-toggle','modal');
        deleteBtn.id='deleteButton';
        deleteBtn.type='button';

        buttonDiv.appendChild(saveBtn);
        buttonDiv.appendChild(deleteBtn);
    } else {
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('btn','btn-primary');
        saveBtn.setAttribute('property-name', 'save');
        saveBtn.type= "submit";
        buttonDiv.appendChild(saveBtn);
    }

    userForm.addEventListener('submit', function(event) {
        event.preventDefault();
        modifyUser(event, isNew);
    });

    containerDiv.appendChild(buttonDiv);
    userForm.appendChild(containerDiv);

    return userForm;
}

async function modifyProduct(event, isNew) {
    event.preventDefault();
    let method = 'POST';
    const confirmModal = document.getElementById('resultContentModal');
    const formData = new FormData();
    const modelNo = document.getElementById('modelNo').value.trim();
    const productEnName = document.getElementById('productNameEn').value.trim();
    const productZhName = document.getElementById('productNameZh').value.trim();
    const price = document.getElementById('price').value.trim();
    const productDescriptionEn = document.getElementById('productDescriptionEn').value.trim();
    const productDescriptionZh = document.getElementById('productDescriptionZh').value.trim();
    const fileImage = document.getElementById('fileUpload').files[0];
    const categorySelect = document.getElementById('selectCategoryMenu').value;
    const brandSelect = document.getElementById('selectBrandMenu').value;
    const productId = document.getElementById('productId').value;

    formData.append('file', fileImage);
    formData.append('price', price);
    formData.append('modelNo', modelNo);
    formData.append('discountPrice', price);
    formData.append('prodDescEn', productDescriptionEn);
    formData.append('prodDescZh', productDescriptionZh);
    formData.append('prodNameEn', productEnName);
    formData.append('prodNameZh', productZhName);
    formData.append('categoryId', (JSON.parse(categorySelect))._id);
    formData.append('brandId', (JSON.parse(brandSelect))._id);
    if (!isNew) {
        formData.append('id', productId);
        method = 'PATCH';
    }
    try {
        showSpinner();
        const response = await fetch(BASE_PATH +'product', {
            method,
            body: formData
        }); 
        if (!response.ok) {
            throw new Error('Error');
        }
        hideSpinner();
        confirmModal.setAttribute('property-name', 'success');
        getContent();
        $('#resultModal').modal('show');
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();
        $('#resultModal').modal('show');
    } 
}

async function modifyCategory(event, isNew){
    event.preventDefault();
    let method = 'POST';
    let body = {};
    const confirmModal = document.getElementById('resultContentModal');
    const categoryNameEn = document.getElementById('catEnName').value.trim();
    const categoryNameZh = document.getElementById('catZhName').value.trim();
    if (isNew) {
        body = {
            'categoryNameEn':categoryNameEn,
            'categoryNameZh':categoryNameZh
        };
    } else {
        const categoryId = document.getElementById('categoryId').value.trim();
        body = {
            'categoryNameEn':categoryNameEn,
            'categoryNameZh':categoryNameZh,
            'id':categoryId
        };
        method = 'PATCH';
    }

    try {
        showSpinner();
        const response = await fetch(BASE_PATH +'category', {
            method,
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(body)
        }); 
        if (!response.ok) {
            throw new Error('Error');
        }
        hideSpinner();
        confirmModal.setAttribute('property-name', 'success');
        getContent();
        $('#resultModal').modal('show');
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();
        $('#resultModal').modal('show');
    } 
}

async function modifyBrand(event, isNew){
    event.preventDefault();
    let method = 'POST';
    let body = {};
    const confirmModal = document.getElementById('resultContentModal');
    const brandNameZh = document.getElementById('brandZhName').value.trim();
    const brandNameEn = document.getElementById('brandEnName').value.trim();
    if (isNew) {
        body = {
            'brandNameEn':brandNameEn,
            'brandNameZh':brandNameZh
        };
    } else {
        const brandId = document.getElementById('brandId').value.trim();
        body = {
            'brandNameEn':brandNameEn,
            'brandNameZh':brandNameZh,
            'id':brandId
        };
        method = 'PATCH';
    }

    try {
        showSpinner();
        const response = await fetch(BASE_PATH +'brand', {
            method,
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(body)
        }); 
        if (!response.ok) {
            throw new Error('Error');
        }
        hideSpinner();
        confirmModal.setAttribute('property-name', 'success');
        getContent();
        $('#resultModal').modal('show');
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();
        $('#resultModal').modal('show');
    } 
}

async function modifyUser(event, isNew){
    event.preventDefault();
    let method = 'POST';
    const confirmModal = document.getElementById('resultContentModal');
    const passwordNotMatch = document.getElementById('passwordMatchError');
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!isNew) {
        method='PATCH';
    }

    if (password!== confirmPassword) {
        passwordNotMatch.classList.remove('hidden');
    } else {
        passwordNotMatch.classList.add('hidden');
        const body = {
            'password':password,
            'reEntryPassword': confirmPassword,
            'userId': userId
        };
        
        try {
            showSpinner();
            const response = await fetch(BASE_PATH +'user', {
                method,
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(body)
            }); 
            if (!response.ok) {
                throw new Error('Error');
            }
            hideSpinner();
            confirmModal.setAttribute('property-name', 'success');
            getContent();
            $('#resultModal').modal('show');
        } catch (error) {
            confirmModal.setAttribute('property-name', 'error');
            getContent();
            hideSpinner();
            $('#resultModal').modal('show');
        } 
    }
}

async function confirmDelete(event, tab) {
    event.preventDefault();
    const confirmModal = document.getElementById('resultContentModal');
    let id;
    let body;
    switch (tab) {
        case 'product':
            id = document.getElementById('productId').value;
            body = JSON.stringify({ id }) 
            break;
        case 'category':
            id = document.getElementById('categoryId').value;
            body = JSON.stringify({ id }) 
            break;    
        case 'brand':
            id = document.getElementById('brandId').value;
            body = JSON.stringify({ id }) 
            break;
        case 'user':
            id = document.getElementById('userId').value;
            body = JSON.stringify({ userId : id }) 
            break;
        default:
            break;
    }
    $('#confirmModal').modal('hide');

    try {
        showSpinner();
        const response = await fetch(BASE_PATH +tab, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json' 
            },
            body : body
        }); 
        if (!response.ok) {
            throw new Error('Error');
        }
        hideSpinner();
        confirmModal.setAttribute('property-name', 'success');
        getContent();
        $('#resultModal').modal('show');
    } catch (error) {
        confirmModal.setAttribute('property-name', 'error');
        getContent();
        hideSpinner();
        $('#resultModal').modal('show');
    }

}

function generateConfirmDeleteModal(tab){
    const modalDiv = document.createElement('div');
    modalDiv.classList.add('modal','fade', 'backdrop');
    modalDiv.id="confirmModal";
    modalDiv.tabIndex = "-1";
    modalDiv.role="dialog";
    modalDiv.ariaLabelledby="confirmModalLabel";

    const modalDialogDiv = document.createElement('div');
    modalDialogDiv.classList.add('modal-dialog', 'centered-modal');
    modalDialogDiv.role = 'document';

    const modalContentDiv = document.createElement('div');
    modalContentDiv.classList.add('modal-content');

    const modalHeaderDiv = document.createElement('div');
    modalHeaderDiv.classList.add('modal-header');

    const modalCancelCross = document.createElement('button');
    modalCancelCross.classList.add('close');
    modalCancelCross.setAttribute('data-dismiss','modal');
    modalCancelCross.ariaLabel = "Close";
    modalCancelCross.innerHTML= "<span aria-hidden='true'>&times;</span>";
    modalHeaderDiv.appendChild(modalCancelCross);

    const modalTitle = document.createElement('h4');
    modalTitle.classList.add('modal-title');
    modalTitle.setAttribute('property-name', 'deleteConfirmHeader');
    modalTitle.id = 'confirmModalLabel';
    modalHeaderDiv.appendChild(modalTitle);

    modalContentDiv.appendChild(modalHeaderDiv);

    const modalBodyDiv = document.createElement('div');
    modalBodyDiv.classList.add('modal-body');
    modalBodyDiv.setAttribute('property-name', 'deleteConfirmMessage');
    modalContentDiv.appendChild(modalBodyDiv);

    const modalFooterDiv = document.createElement('div');
    modalFooterDiv.classList.add('modal-footer');

    const modalCancelBtn = document.createElement('button');
    modalCancelBtn.classList.add('btn','btn-default');
    modalCancelBtn.setAttribute('property-name', 'cancel');
    modalCancelBtn.setAttribute('data-dismiss','modal');
    modalFooterDiv.appendChild(modalCancelBtn);

    const modalConfirmBtn = document.createElement('button');
    modalConfirmBtn.classList.add('btn','btn-danger');
    modalConfirmBtn.setAttribute('property-name', 'confirm');
    modalConfirmBtn.id = 'confirmDelete';
    modalConfirmBtn.addEventListener('click', (event) => confirmDelete(event, tab));
    modalFooterDiv.appendChild(modalConfirmBtn);

    modalContentDiv.appendChild(modalFooterDiv);

    modalDialogDiv.appendChild(modalContentDiv);
    modalDiv.appendChild(modalDialogDiv);

    $(modalDiv).modal({
        backdrop: 'static', 
        show: false
    });

    return modalDiv;
}  

// function generateResultModal(tab){
//     const modalDiv = document.createElement('div');
//     modalDiv.classList.add('modal','fade', 'backdrop');
//     modalDiv.id="resultModal";
//     modalDiv.tabIndex = "-1";
//     modalDiv.role="dialog";
//     modalDiv.ariaLabelledby="resultModalLabel";

//     const modalDialogDiv = document.createElement('div');
//     modalDialogDiv.classList.add('modal-dialog', 'centered-modal');
//     modalDialogDiv.role = 'document';

//     const modalContentDiv = document.createElement('div');
//     modalContentDiv.classList.add('modal-content');

//     const modalBodyDiv = document.createElement('div');
//     modalBodyDiv.classList.add('modal-body');
//     modalBodyDiv.id="resultContentModal";
//     modalBodyDiv.setAttribute('property-name', 'message');
//     modalContentDiv.appendChild(modalBodyDiv);

//     const modalFooterDiv = document.createElement('div');
//     modalFooterDiv.classList.add('modal-footer');

//     const modalCancelBtn = document.createElement('button');
//     modalCancelBtn.classList.add('btn','btn-default');
//     modalCancelBtn.setAttribute('property-name', 'confirm');
//     modalCancelBtn.setAttribute('data-dismiss','modal');
//     modalFooterDiv.appendChild(modalCancelBtn);

//     modalContentDiv.appendChild(modalFooterDiv);
//     modalDialogDiv.appendChild(modalContentDiv);
//     modalDiv.appendChild(modalDialogDiv);

//     $(modalDiv).modal({
//          backdrop: 'static', 
//          show: false
//     });

//     modalDiv.addEventListener('click', function (event) {
//         if (event.target.matches('[data-dismiss="modal"]')) {
//             const resultContentModal = document.getElementById('resultContentModal');
//             const displayedMessage = resultContentModal.getAttribute('property-name');
//             if (displayedMessage ==='success') {
//                 clickSystemTab(tab)
//             }
//         }
//     });

//     return modalDiv;
// }
