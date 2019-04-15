import {CartProduct} from './CartProduct.js';
import {select, settings, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';

export class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    // console.log('thisCart.dom.wrapper:', thisCart.dom.wrapper);
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    // console.log('thisCart.dom.productList:', thisCart.dom.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    //console.log('thisCart.dom.form:', thisCart.dom.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    //console.log('thisCart.dom.phone:', thisCart.dom.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    //console.log('thisCart.dom.address:', thisCart.dom.address);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      console.log('thisCart.dom:', thisCart.dom);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    // console.log('generatedHTML:', generatedHTML);

    /* create DOM elements using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    // console.log('generatedDOM:', generatedDOM);

    /* add DOM elements to thisCart.dom.productList */
    thisCart.dom.productList.appendChild(generatedDOM);

    // console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products:', thisCart.products);

    new CartProduct(menuProduct, generatedDOM);
    thisCart.update();
  }

  update(){
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    const products = thisCart.products;

    for(let product of products){
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    if(thisCart.totalNumber == 0){
      thisCart.deliveryFee = 0;
      thisCart.totalPrice = 0;
    }

    console.log('thisCart.totalNumber:', thisCart.totalNumber);
    console.log('thisCart.subtotalPrice:', thisCart.subtotalPrice);
    console.log('thisCart.totalPrice:', thisCart.totalPrice);

    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);

    console.log('thisCart.products:', thisCart.products);
    thisCart.products.splice(index, 1);
    console.log('thisCart.products after splice:', thisCart.products);
    console.log('cartProduct.dom.wrapper:', cartProduct.dom.wrapper);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      products: [],
      phone: thisCart.dom.phone,
      address: thisCart.dom.address,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
    };

    console.log('thisCart.products:', thisCart.products);

    for(let product of thisCart.products){
      payload.products.push(product.getData());
      // const productData = product.getData();
      // payload.products.push(productData);
      console.log('getting data');
      console.log('payload.products:', payload.products);
      // console.log('productData:', productData);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json;
      }).then(function(parsedResponse){
        console.log('parsedResponse:', parsedResponse);
      });
  }
}
