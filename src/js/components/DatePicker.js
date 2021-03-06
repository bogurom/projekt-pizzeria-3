import {select, settings} from '../settings.js';
import {utils} from '../utils.js';
import {BaseWidget} from './BaseWidget.js';

export class DatePicker extends BaseWidget{
  constructor(wrapper){
    // super(wrapper, settings.amountWidget.defaultValue);
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    console.log('thisWidget.value:', thisWidget.value);

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    console.log('thisWidget:', thisWidget);

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      "disable": [
        function(date) {
            // return true to disable
            return (date.getDay() === 1);
        }
      ],
      "locale": {
          "firstDayOfWeek": 1 // start week on Monday
      },
      onChange: function(selectedDates, dateStr, instance){
        thisWidget.value = dateStr;
      }
    });
  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}
