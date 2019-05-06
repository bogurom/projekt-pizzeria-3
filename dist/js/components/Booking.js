import {app} from '../app.js';
import {templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import {select} from '../settings.js';
import {utils} from '../utils.js';

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
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log('thisBooking.dom.hoursAmount:', thisBooking.dom.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    console.log('thisBooking.dom.datePicker:', thisBooking.dom.datePicker);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}
