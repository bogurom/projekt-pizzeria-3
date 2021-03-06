import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    // console.log('thisProduct.form:', thisProduct.form);
    // console.log('thisProduct.formInputs:', thisProduct.formInputs);
    // console.log('thisProduct.priceElem:', thisProduct.priceElem);
  }

  initAccordion(){

    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;
    // console.log('trigger:', trigger);

    /* START: click event listener to trigger */
    trigger.addEventListener('click', function(event){

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
      // console.log('allActiveProducts:', allActiveProducts);

      /* START LOOP: for each active product */
      for (let activeProduct of allActiveProducts) {

        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element) {

          /* remove class active for the active product */
          activeProduct.classList.remove('active');
        /* END: if the active product isn't the element of thisProduct */
        }
      /* END LOOP: for each active product */
      }
  /* END: click event listener to trigger */
    })
  }

  initOrderForm(){
    const thisProduct = this;
    // console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    })
  }

  processOrder(){

    // metoda poprawnie oblicza cenę produktu, ale cena wyświetlana na stronie nie zmienia się...?
    const thisProduct = this;
    // console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData:', formData);

    thisProduct.params = {};

    /* set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;

    /* find all params */
    // console.log('thisProduct:', thisProduct);
    const allParams = thisProduct.data.params;
    // console.log('allParams:', allParams);

    /* START loop for each param */
    for(let paramId in allParams){
      const param = allParams[paramId];
      // console.log('param:', param);

      /* find all options in this param */
      const options = param['options'];
      // console.log('options:', options);

      /* START loop for each option */
      for(let optionId in options){

        const option = options[optionId];
        // console.log('option:', option);

        /* find price of this option */
        const priceOfOption = option.price;
        // console.log('priceOfOption:', priceOfOption);

        /* create new variable checked and set it to false */
        let checked = false;

        /* START if in formData there is a key equal to the key of the parameter and if in array under this key there is key of this option */
        if (formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1) {

          /* set checked to true */
          checked = true;
          // console.log('checked:', checked);

        /* END if in formData there is a key equal to key of the parameter and if in array under this key there is key of this option */
        }

        /* if option is checked and option is not deafult */
        if (checked && !option.default){

          /* add the price of this option to the price of this product */
          // console.log('previous price:', price);
          price += priceOfOption;
          // console.log('thisProduct.priceElem:', thisProduct.priceElem);
          // const innerHTMLOfPriceElem = thisProduct.priceElem.innerHTML;


        /* else if option is not checked and option is deafult */
        } else if(!checked && option.default){

          /* subtract the price of this option from the price of this product */
          // console.log('previous price:', price);
          price -= priceOfOption;

          // console.log('price of the option is subtracted from the price of the product. New price:', price);

        /* END if option is checked and option is not deafult */
        }

        thisProduct.priceElem.innerHTML = price;
        // console.log('price of the option is added to price of the product. New price:', price);

        /* find all images for this option */
        const imageSelector = "." + paramId + "-" + optionId;
        // console.log('imageSelector:', imageSelector);
        const allImagesforThisOption = thisProduct.imageWrapper.querySelectorAll(imageSelector);
        // console.log('allImagesforThisOption:', allImagesforThisOption);

        /* if option is selected */
        if(checked == true){

          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          /* START for each image for this option */
          for(let image of allImagesforThisOption){

            /* add class registered in classNames.menuProduct.imageVisible */
            image.classList.add(classNames.menuProduct.imageVisible);

          /* END for each image for this option */
          }


        } else {

          /* START for each image for this option */
          for(let image of allImagesforThisOption){

            /* remove class registered in classNames.menuProduct.imageVisible */
            image.classList.remove(classNames.menuProduct.imageVisible);

          /* END for each image for this option */
          }

        }

      /* END loop for each option */
    }

    /* END loop for each param */
  }

    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

    // console.log('total price:', thisProduct.price);
    // console.log('thisProduct.params:', thisProduct.params);
    // console.log('thisProduct.data.name:', thisProduct.data.name);

  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    // console.log('thisProduct.name:', thisProduct.name);
    thisProduct.amount = thisProduct.amountWidget.value;
    // console.log('thisProduct.amount:', thisProduct.amount);
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}
