import {app} from '../app.js';
import {templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import {select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';

export class Booking{
  constructor(bookingContainer){
    const thisBooking = this;

    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(argument){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    console.log('thisBooking.dom:', thisBooking.dom);
    thisBooking.dom.wrapper = argument;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log('thisBooking.dom.hoursAmount:', thisBooking.dom.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    console.log('thisBooking.dom.datePicker:', thisBooking.dom.datePicker);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);
    console.log('startEndDates:', startEndDates);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);
    console.log('getData params', params);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};
    console.log('eventsCurrent:', eventsCurrent);
    console.log('bookings:', bookings);
    console.log('eventsRepeat:', eventsRepeat);

    for(let eventCurrent of eventsCurrent){
      console.log('eventCurrent:', eventCurrent);
      // console.log('eventCurrent.date:', eventCurrent.date);
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }

    for(let booking of bookings){
      console.log('booking:', booking);
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }

    for(let eventRepeat of eventsRepeat){
      console.log('eventRepeat:', eventRepeat);
      const daysArray = [];
      const datesArray = [];

      for(let i=0; i < settings.datePicker.maxDaysInFuture; i++){
        daysArray.push(utils.addDays(thisBooking.datePicker.minDate, 1));
      }

      for(let day of daysArray){
        const dateString = utils.dateToStr(day);
        datesArray.push(dateString);
      }

      for(let date of datesArray){
        thisBooking.makeBooked(date, eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
      }

      console.log('daysArray:', daysArray);
      console.log('datesArray:', datesArray);
      console.log('thisBooking.datePicker.minDate:', thisBooking.datePicker.minDate);
      console.log('thisBooking.dom.datePicker:', thisBooking.dom.datePicker)
      console.log('thisBooking.datePicker', thisBooking.datePicker);

    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    const startingTime = utils.hourToNumber(hour);
    const lastTimeBlock = duration - 0.5 + startingTime;
    const timeBlocksArray = [];

    for(let i=0; i < duration*2; i++){
      timeBlocksArray.push(startingTime + i * 0.5);
    }

    console.log('timeBlocksArray:', timeBlocksArray);
    console.log('startingTime:', startingTime);
    console.log('lastTimeBlock:', lastTimeBlock);

    thisBooking.booked[date] = {};

    for(let timeBlock of timeBlocksArray){
      thisBooking.booked[date][timeBlock] = [table];
    }

    // thisBooking.booked[date][startingTime] = [table];
    // thisBooking.booked[date][lastTimeBlock] = [table];

    console.log('thisBooking.booked:', thisBooking.booked);
  }

  updateDOM(){
    const thisBooking = this;

    console.log('testing updateDOM()');
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    console.log('thisBooking.dom.tables:', thisBooking.dom.tables);

    for(let table of thisBooking.dom.tables){
      const tableNumber = table.getAttribute(settings.booking.tableIdAttribute);
      console.log('tableNumber:', tableNumber);

      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(tableNumber) >= 0){
        console.log('testing if else, true');
        table.classList.addClass(classNames.booking.tableBooked);
      } else {
        console.log('testing - not true;');
        // table.classList.removeClass(classNames.booking.tableBooked);
      }
    }
  }
}
