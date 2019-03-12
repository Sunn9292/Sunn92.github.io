window.onload = function () {
    showNavMenu();
    showCategories();
    showBrands();
    showProducts();

    document.getElementById('search').addEventListener('change', filterPosts);

    $(".sort-element").click(onSortProducts);































    //==================================================

    //SHOPPING CART 
    var removeCartItemButtons = document.getElementsByClassName('cart_quantity_delete');
    for(let i = 0; i < removeCartItemButtons.length; i++){
        var removeCross = removeCartItemButtons[i];
        removeCross.addEventListener('click', removeCartItem);
    }

    var quantityInputs = document.getElementsByClassName('cart_quantity_input');
    for(let i = 0; i < quantityInputs.length; i++){
        var input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    //var addToCartButtons = document.getElementsByClassName('')


    //......................
    toggleCart();
    //......................
    //SHOPPING CART END
    //=========================================================
}

function showNavMenu(){
    $.ajax({
        url: "data/navmenu.json",
        method: "get",
        type: "json",
        success: function(navmenu){
            printNavMenu(navmenu);
        },
        error: function(err){
            alert(err);
        }
    })
}

function printNavMenu(navmenu){
    let html = `<ul class="nav navbar-nav collapse navbar-collapse">`;
    navmenu.forEach(element => {
        html += printSingleMenu(element);        
    });
    html += `</ul>`;
    $(".mainmenu").html(html);
}

function printSingleMenu(menu){
    return `<li><a href="${menu.href}" class="${menu.classActive}">${menu.text}</a></li>`;
}

//Ispis kategorija

function showCategories(){
    $.ajax({
        url: "data/categories.json",
        mathod: "get",
        dataType: "json",
        success: function(categories){
            printCategories(categories);
        },
        error: function(err){
            console.log('milena');
            alert(err);
        }
    })
}

function printCategories(categories){
    let html = `<div class="panel panel-default">`;
    categories.forEach(element => {
        html += printSingleCategory(element);
    });
    html += `</div>`;
    $('.panel-group').html(html);

    $('.filter-category').click(onFilterByCategory)
}

function printSingleCategory(category){
    return `
        <div class="panel-heading">
        <h4 class="panel-title">
            <a href="#" class="filter-category" data-id="${category.id}">
                ${category.title}
            </a>
        </h4>
        </div>
        

    `;
    //${printCollapseDdl(category.collapse.collapseTorF)}
    //klikom na this se poziva fja printCollapseDdl -- click()
    //$().toggle()
}

// FILTRIRANJE PO KATEGORIJI

function onFilterByCategory(e){
    e.preventDefault();

    let categoryId = $(this).data('id');

    ajaxProducts(function(products){
        products = filterByCategory(products, categoryId);
        printProducts(products);
    });
}

function filterByCategory(products, categoryId){
    return products.filter(x => x.category.id == categoryId);
}

//FILTRIRANJE PO BRENDOVIMA

function onFilterByBrand(e){
    e.preventDefault();
    
    let brandId = $(this).data('id');
    ajaxProducts(function(products){
        products = filterByBrand(products, brandId);
        printProducts(products);
    });
}

function filterByBrand(products, brandId){
    return products.filter(x => x.brand.id == brandId);
}

//Ispis brendova

function showBrands(){
    $.ajax({
        url: "data/brands.json",
        method: "get",
        dataType: "json",
        success: function(brands){
            printBrands(brands);
        },
        error: function(err){
            alert(err);
        }
    });
}

function printBrands(brand){
    let html = `<ul class="nav nav-pills nav-stacked">`;
    brand.forEach(element => {
        html += printSingleBrand(element);
    });
    html += `</ul>`;
    $('.brands-name').html(html);

    $('.filter-brand').click(onFilterByBrand);
}

function printSingleBrand(brand){
    return `<li><a href="#" class="filter-brand" data-id="${brand.id}"> <span class="pull-right">(${brand.numOfBrands})</span>${brand.title}</a></li>`;
}

//Ispis proizvoda

function showProducts(){
    //$.ajax({
    //    url: "data/products.json",
    //    method: "get",
    //    dataType: "json",
    //    success: function(products){
    //        printProducts(products);
    //    },
    //    error: function(){

    //    }
    //});
    ajaxProducts(
        function(products){
            // iz localStorage -> ako je postojala selekcija ranije, da se po tome sortira pri ucitavanju strane
            sortFilterByRemembered(products);
            printProducts(products);

            // Ovde moramo pozvati za prikaz boja, jer prikaz boja zavisi od JSON-a "produsts", odatle se iscitavaju boje
            //showColors(products);
        }
    );
}

function printProducts(product){
    let html = `<h2 class="title text-center">Our products</h2>`;
    
    product.forEach(element => {
        html += `
        <div class="col-sm-4">
            <div class="product-image-wrapper">
                <div class="single-products">
                    <div class="productinfo text-center">
                        <img src="${element.picture.src}" alt="${element.picture.alt}" />
                        <h2>$${element.price}</h2>
                        <p>${element.name}</p>
                        <p>${element.description}</p>
                        <a href="#" class="btn btn-default add-to-cart"><i class="fa fa-shopping-cart"></i>Add to cart</a>
                    </div>
                    <div class="product-overlay">
                        <div class="overlay-content">
                            <h2>$${element.price}</h2>
                            <p>${element.name}</p>
                            <a href="#" class="btn btn-default add-to-cart"><i class="fa fa-shopping-cart"></i>Add to cart</a>
                        </div>
                    </div>
                    <div class="fafa-stars">
						${printStars(element.stars)}
					</div>
                    <img src="${element.banners.src}" class="new" alt="" />
                </div>
                <div class="choose">
                    <ul class="nav nav-pills nav-justified">
                        <li><a href="#"><i class="fa fa-plus-square"></i>Add to wishlist</a></li>
                        <li><a href="#"><i class="fa fa-plus-square"></i>Add to compare</a></li>
                    </ul>
                </div>
            </div>
        </div>
        `;
    });
    $('.features_items').html(html);
}

function printStars(star){
    let html =``;
    for(let i=1; i<=5; i++){
        if(i <= star){
            html += `<i class='fa fa-star'></i>`;
        }else{
            html += `<i class='fa fa-star-o'></i>`;
        }
    }
    return html;
}

//search filter

function filterPosts(){
    const userInput = this.value;
    $.ajax({
        url: "data/products.json",
        method: "get",
        dataType: "json",
        success: function(posts){
            const filteredPosts = posts.filter(element => {
                if(element.name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1){
                    return true;
                }
                if(element.description.toLowerCase().indexOf(userInput.toLowerCase()) !== -1){
                    return true;
                }
                if(element.price.toString().indexOf(userInput.toString()) !== -1){
                    return true;
                }
            });
            printProducts(filteredPosts);
        },
        error: function(err){
            alert(err);
        }
    });
}

//sort 
function onSortProducts(e){
    e.preventDefault(); 

    let sortBy = $(this).data('sortby'); 
    let order = $(this).data('order');
    console.log(sortBy + "=" + order);
    rememberSort(sortBy, order);

    ajaxProducts(function(products){
        sortProducts(products, sortBy, order);
        printProducts(products);
    });
}


function getStorage(){
    return JSON.parse(localStorage.getItem('sort'));
}
function setStorage(value){
    return localStorage.setItem('sort', JSON.stringify(value));
}
function isEmptyStorage(){
    return localStorage.getItem('sort') === null;
}

function inArray(array, element){
    return array.indexOf(element)!==-1;
}


// LOCAL STORAGE PAMCENJE STA JE KORISNIK IZABRAO ZA FILTER I SORT
function sortFilterByRemembered(products){
    if(!isEmptyStorage()){
        let selection = getStorage();
        if(!isEmptyStorage()){
            sortProducts(products, selection.sortBy, selection.order);
        }
    }
}

function sortProducts(products, sortBy, order) {
    products.sort(function(a,b){
        let valueA = (sortBy=='price')? a.price.new : a.name;
        let valueB = (sortBy=='price')? b.price.new : b.name;
        if(valueA > valueB)
            return order=='asc' ? 1 : -1;
        else if(valueA < valueB)
            return order=='asc' ? -1 : 1;
        else 
            return 0;
    });
}

function rememberSort(sortBy, order){
    setStorage({ sortBy: sortBy, order: order});
}


function ajaxProducts(callbackSuccess){ 
    $.ajax({
        url: "data/products.json",
        method: "GET",
        success: callbackSuccess
    });
}
















































//======================================================

//SHOPPING CART 

//toggle cart
function toggleCart(){
        const cartInfo = document.getElementById('cart-info');
        const cart = document.getElementById('cart');
        cartInfo.addEventListener('click', function(){
        cart.classList.toggle('show-cart');
    });
}

function updateCartTotal(){
    let cartItemContainer = document.getElementsByClassName('cart-items')[0];
    let cartRows = cartItemContainer.getElementsByClassName('cart-row');
    let total = 0;
    for(let i = 0; i < cartRows.length; i++){
        let cartRow = cartRows[i];
        let priceElement = cartRow.getElementsByClassName('cart-price')[0];
        let quantityElement = cartRow.getElementsByClassName('cart_quantity_input')[0];
        let price = parseFloat(priceElement.innerText.replace('$', ''));
        let quantity = quantityElement.value;
        total = total+(price * quantity);
    }
    
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total;

}

function removeCartItem(event){
    var buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
}

function quantityChanged(event){
    var input = event.target;
    if(isNaN(input.value) || input.value <= 0){
        input.value = 1;
    }
    updateCartTotal();
}

//SHOPPING CART END
