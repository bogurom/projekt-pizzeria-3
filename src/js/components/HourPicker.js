import {select, settings} from '../settings.js';
import {utils} from '../utils.js';
import {BaseWidget} from './BaseWidget.js';
// import {RangeSlider} from '../../vendor/range-slider.js';

export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;

    // console.log('rangeSlider:', rangeSlider);
    // console.log('RangeSlider:', RangeSlider);
    // rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
      console.log('thisWidget.dom.input.value:', thisWidget.dom.input.value);
      console.log('thisWidget.dom.output:', thisWidget.dom.output);
    });
  }

  parseValue(value){
    const parsedValue = utils.numberToHour(value);
    return parsedValue;
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
    const date = new Date();

    thisWidget.dom.output.innerHTML = thisWidget.parseValue(date.getTime());
  }
}
