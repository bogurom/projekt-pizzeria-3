import {app} from '../app.js';
import {templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {select} from '../settings.js';

export class Booking{
  constructor(){
    const thisBooking = this;

    thisBooking.render(app.initBooking);
    thisBooking.initWidgets();
  }

  render(argument){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    console.log('thisBooking.dom:', thisBooking.dom);
    thisBooking.dom.wrapper = argument;
    thisBooking.dom.wrapper = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log('thisBooking.dom.hoursAmount:', thisBooking.dom.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
