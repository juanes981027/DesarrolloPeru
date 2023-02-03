const axios = require('axios');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

exports.handler = function(context, event, callback) {
    //create Twilio Response
    let response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    //create default response body
    response.body = {
      isOpen: false,
      isHoliday: false,
      isPartialDay: false,
      isRegularDay: false,
      description: ''
    }

    const timezone = event.timezone;
    const country = event.country;

    //load JSON with schedule
    const jsonFile = `https://${context.DOMAIN_NAME}/${country}.json`;
    axios.get(jsonFile)
      .then(function (axiosResponse) {
        const schedule = axiosResponse.data;

        const currentDate = moment().tz(timezone).format('MM/DD/YYYY');
    console.log(currentDate);
        const isHoliday = currentDate in schedule.holidays;
        const isPartialDay = currentDate in schedule.partialDays;

        if (isHoliday) {
          response.body.isHoliday = true;

          if (typeof(schedule.holidays[currentDate].description) !== 'undefined') {
            response.body.description = schedule.holidays[currentDate].description;
          }

          callback(null, response);

        } else if (isPartialDay) {
          response.body.isPartialDay = true;

          if (typeof(schedule.partialDays[currentDate].description) !== 'undefined') {
            response.body.description = schedule.partialDays[currentDate].description;
          }

          if (checkIfInRange(schedule.partialDays[currentDate].begin, schedule.partialDays[currentDate].end, timezone) === true) {
            response.body.isOpen = true;
            callback(null, response);
          } else {
            callback(null, response);
          }
        } else {
          //regular hours
          const dayOfWeek = moment().tz(timezone).format('dddd');

          response.body.isRegularDay = true;
          if (checkIfInRange(schedule.regularHours[dayOfWeek].begin, schedule.regularHours[dayOfWeek].end, timezone) === true) {
            response.body.isOpen = true;
            callback(null, response);
          } else {
            callback(null, response);
          }
        }
      })
      .catch(function (error) {
        callback(error);
      })
};

function checkIfInRange(begin, end, timezone) {
  const currentDate = moment().tz(timezone).format('MM/DD/YYYY');
  const now = moment().tz(timezone);
  console.log(now);
  const beginMomentObject = moment.tz(`${currentDate} ${begin}`, 'MM/DD/YYYY HH:mm:ss', timezone);
  const endMomentObject = moment.tz(`${currentDate} ${end}`, 'MM/DD/YYYY HH:mm:ss', timezone);
  const range = moment.range(beginMomentObject, endMomentObject);

  return now.within(range);
}