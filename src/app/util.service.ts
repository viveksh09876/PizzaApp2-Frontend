import { Injectable } from '@angular/core';
import * as moment from "moment";
import { extendMoment } from "moment-range";
const rangeMoment = extendMoment(moment);

@Injectable()
export class UtilService {

  constructor() { }

  showFooter = true;
  currencyCode = '£';

  calculateOverAllCost(items) {
    let overAllPrice = 0;

    if (items != null) {
      for (var i = 0; i < items.length; i++) {
        //console.log(items[i].totalItemCost, items[i]);
        overAllPrice += parseFloat(items[i].totalItemCost);
      }
    }

    overAllPrice = Number(overAllPrice.toFixed(2));

    return overAllPrice;
  }


  toISOString(date) {
    var dt = new Date(date);
    var tzo = -dt.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function (num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
      };
    return dt.getFullYear() +
      '-' + pad(dt.getMonth() + 1) +
      '-' + pad(dt.getDate()) +
      'T' + pad(dt.getHours()) +
      ':' + pad(dt.getMinutes()) +
      ':' + pad(dt.getSeconds()) +
      dif + pad(tzo / 60) +
      ':' + pad(tzo % 60);
  }

  updateFooterDisplay(isShow) {
    this.showFooter = isShow;
  }



  formatFavData(item) {
    let favData = { itemId: null, itemName: null, itemSlug: null, qty: 1, totalItemCost: 0, modifiers: [] }
    //console.log('format', item);
    favData.itemId = item.Product.id;
    favData.itemName = item.Product.title;
    favData.itemSlug = item.Product.slug;
    favData.qty = item.Product.qty;

    if (item.totalItemCost) {
      favData.totalItemCost = item.totalItemCost;
    }


    if (item.ProductModifier.length > 0) {
      for (var i = 0; i < item.ProductModifier.length; i++) {
        let options = item.ProductModifier[i].Modifier.ModifierOption;
        let modObj = {
          modifier_id: null,
          option: []
        };

        let plus = ['217', 'I100', 'I101', '999991', '999992', '999993'];

        for (var j = 0; j < options.length; j++) {
          modObj.modifier_id = options[j].Modifier.id;
          let goFlag = false;

          if ((options[j].Option.is_checked && !options[j].Option.is_included_mod)) {
            goFlag = true;
          } else if (options[j].Option.add_extra) {
            goFlag = true;
          } else if (!options[j].Option.is_checked && options[j].Option.is_included_mod && plus.indexOf(options[j].Option.plu_code) < 0) {
            //console.log(options[j].Option.name, options[j].Option.is_checked, options[j].Option.is_included_mod);
            goFlag = true;
          } else if (options[j].Option.is_checked && plus.indexOf(options[j].Option.plu_code) > -1) {
            goFlag = true;
          }

          if (goFlag) {
            //console.log('option', options[j].Option.name, options[j].Option.is_checked, options[j].Option.is_included_mod);

            let opt = {
              id: options[j].Option.id,
              name: options[j].Option.name,
              plu_code: options[j].Option.plu_code,
              is_checked: options[j].Option.is_checked,
              is_included_mod: options[j].Option.is_included_mod,
              is_topping: options[j].Option.is_topping,
              no_modifier: options[j].Option.no_modifier,
              price: options[j].Option.price,
              quantity: options[j].Option.quantity,
              send_code: options[j].Option.send_code,
              send_code_permanent: options[j].Option.send_code_permanent,
              default_checked: options[j].Option.default_checked,
              add_extra: options[j].Option.add_extra,
              subOption: null
            }

            let subArr = [];
            if (options[j].Option.OptionSuboption.length > 0) {
              let subOp = options[j].Option.OptionSuboption;
              if (subOp.length > 0) {
                for (var k = 0; k < subOp.length; k++) {
                  if (subOp.SubOption) {
                    if (subOp.SubOption.is_active) {
                      subArr.push(subOp.SubOption.id);
                    }
                  }
                }
              }
            }
            opt.subOption = subArr;

            modObj.option.push(opt);
          }

        }

        favData.modifiers.push(modObj);
      }
    }
    //console.log(favData);

    return favData;
  }


  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  findNearbyStore(stores, userLat, UserLong) {
    let myStore = stores[0];
    let myStoreDistance = this.getDistanceFromLatLonInKm(myStore.Store.latitude, myStore.Store.longitude, userLat, UserLong);

    for (var i = 0; i < stores.length; i++) {
      if (i != 0) {
        let distance = this.getDistanceFromLatLonInKm(stores[i].Store.latitude, stores[i].Store.longitude, userLat, UserLong);
        if (distance < myStoreDistance) {
          myStore = stores[i];
        }
      }
    }
    return myStore;
  }

  formatCountryName(name) {
    if (name == 'United States' || name == 'United States of America' || name == 'USA') {
      return 'USA';
    } else if (name == 'United Arab Emirates' || name == 'UAE') {
      return 'UAE';
    } else {
      return name;
    }
  }


  getMinutes() {
    let min = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    return min;
  }

  getNowDateTime(min) {
    let d1 = new Date();
    let d2 = new Date(d1);
    d2.setMinutes(d1.getMinutes() + parseInt(min));
    return d2;
  }

  subtractTime(fromTime, min) {
    let d2 = new Date(fromTime);
    d2.setMinutes(fromTime.getMinutes() - parseInt(min));
    return d2;
  }

  formatDate(dateVal) {
    var newDate = new Date(dateVal);

    var sMonth = this.padValue(newDate.getMonth() + 1);
    var sDay = this.padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour = newDate.getHours().toString();
    var sMinute = this.padValue(newDate.getMinutes());
    var sAMPM = "AM";

    var iHourCheck = parseInt(sHour);

    /* if (iHourCheck > 12) {
         sAMPM = "PM";
         sHour = (iHourCheck - 12).toString();
     }
     else if (iHourCheck === 0) {
         sHour = "12";
     }*/
    if (iHourCheck == 12) {
      sAMPM = 'PM';
    } else if (iHourCheck == 0) {
      sHour = "12";
    } else if (iHourCheck > 12) {
      sHour = (iHourCheck - 12).toString();
      sAMPM = 'PM';
    }

    sHour = this.padValue(sHour);

    return sYear + "/" + sMonth + "/" + sDay + " " + sHour + ":" + sMinute + " " + sAMPM;
  }

  padValue(value) {
    return (value < 10) ? "0" + value : value;
  }

  getMonths() {
    let monthsArr = [
      { value: '1', text: 'January' },
      { value: '2', text: 'February' },
      { value: '3', text: 'March' },
      { value: '4', text: 'April' },
      { value: '5', text: 'May' },
      { value: '6', text: 'June' },
      { value: '7', text: 'July' },
      { value: '8', text: 'August' },
      { value: '9', text: 'September' },
      { value: '10', text: 'October' },
      { value: '11', text: 'November' },
      { value: '12', text: 'December' }
    ];

    return monthsArr;
  }

  getYears(limit) {
    let yearArr = [];
    let year = (new Date()).getFullYear();
    for (var i = year; i <= limit; i++) {
      yearArr.push(i);
    }

    return yearArr;
  }

  getStoreTimings() {
    let n = this.getCurrentDay();
    let storeTime = '12:00pm - 9:45pm';
    if (n == 'Friday' || n == 'Saturday') {
      storeTime = '12:00pm - 10:45pm';
    }

    return storeTime;
  }


  getCurrentDay() {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[d.getDay()];
    return n;
  }

  inTimeRange(time, startTime, endTime) {
    //Setup today vars
    var today = moment(new Date());
    var ayear = today.year();
    let amonth = null;
    let adate = null;
    amonth = today.month() + 1;  // 0 to 11
    adate = today.date();
    amonth = String(amonth).length < 2 ? "0" + amonth : amonth;
    adate = String(adate).length < 2 ? "0" + adate : adate;
    //Create moment objects
    var moment1, moment2;
    var temp = endTime.split(" ");
    if (temp[1].toLowerCase() == "am") {
      var test1 = ayear + "-" + amonth + "-" + adate + " " + startTime;
      var test2 = ayear + "-" + amonth + "-" + adate + " " + endTime;

      //Make sure that both times aren't morning times
      if (moment(test2).isAfter(test1)) {
        var moment1String = ayear + "-" + amonth + "-" + adate + " " + startTime;
        var moment2String = ayear + "-" + amonth + "-" + adate + " " + endTime;
      }
      else {
        var moment1String = ayear + "-" + amonth + "-" + adate + " " + startTime;
        var moment2String = moment(moment1String, "YYYY-MM-DD").add('days', 1).format('YYYY-MM-DD');
        moment2String = moment2String + " " + endTime;
        //var moment2String = ayear + "-" + amonth + "-" + (adate + 1) + " " + endTime;

      }

      moment1 = moment(moment1String, "YYYY-MM-DD HH:mm A");
      moment2 = moment(moment2String, "YYYY-MM-DD HH:mm A");
    }
    else {
      var moment1String = ayear + "-" + amonth + "-" + adate + " " + startTime;
      var moment2String = ayear + "-" + amonth + "-" + adate + " " + endTime;
      moment1 = moment(moment1String, "YYYY-MM-DD HH:mm A");
      moment2 = moment(moment2String, "YYYY-MM-DD HH:mm A");
    }
    //Run check
    var start = moment1.toDate();
    var end = moment2.toDate();

    var when;
    if (String(time).toLowerCase() == "now") {
      when = moment(new Date());
    }
    else {
      var timeMoment1String = ayear + "-" + amonth + "-" + adate + " " + time;
      when = moment(timeMoment1String);
    }

    var range = rangeMoment.range(start, end);
    //var range = moment.range(start, end);
    return when.within(range);
  }


  getAllDateRange(storeTimeList, selectedTime) {

    if (storeTimeList == null || storeTimeList == 'undefined' || storeTimeList.length < 1) {
      return true;
    }

    var today = moment(selectedTime, "YYYY-MM-DD HH:mm A");
    let todayDay = today.days();
    var ayear = today.year();
    let amonth = null;
    let adate = null;
    amonth = today.month() + 1;  // 0 to 11
    adate = today.date();
    amonth = String(amonth).length < 2 ? "0" + amonth : amonth;
    adate = String(adate).length < 2 ? "0" + adate : adate;
    var moment1, moment2;
    var returndata = false;

    storeTimeList.forEach(function (element) {
      if (element.from_day == todayDay || element.to_day == todayDay) {
        var storeFromTime = element.from_time + ":" + element.from_minutes;
        storeFromTime = moment(storeFromTime, 'HH:mm').format('hh:mm a');
        storeFromTime = ayear + "-" + amonth + "-" + adate + " " + storeFromTime;

        var storeToTime = element.to_time + ":" + element.to_minutes;
        storeToTime = moment(storeToTime, 'HH:mm').format('hh:mm a');
        storeToTime = ayear + "-" + amonth + "-" + adate + " " + storeToTime;

        if (element.from_day == todayDay) {
          if (element.from_day != element.to_day) {
            var days = parseInt(element.to_day) - parseInt(element.from_day);
            if (days > 0 || (element.from_day == 6 && element.to_day == 0)) {
              storeToTime = moment(storeToTime, "YYYY-MM-DD HH:mm A").add(1, 'days').format('YYYY-MM-DD HH:mm A');
            }
          }
        } else if (element.to_day == todayDay) {
          if (element.from_day != element.to_day) {
            var days = parseInt(element.to_day) - parseInt(element.from_day);
            if (days > 0 || (element.from_day == 6 && element.to_day == 0)) {
              storeFromTime = moment(storeFromTime, "YYYY-MM-DD HH:mm A").add(-1, 'days').format('YYYY-MM-DD HH:mm A');
            }
          }
        }
        moment1 = moment(storeFromTime, "YYYY-MM-DD HH:mm A");
        moment2 = moment(storeToTime, "YYYY-MM-DD HH:mm A");
        var fromtime = (moment1.toDate()).getTime();
        var toTime = (moment2.toDate()).getTime();
        var currentDate = (today.toDate()).getTime();
        if (currentDate >= fromtime && currentDate <= toTime) {
          returndata = true;
          return;
        }
      }
    });
    return returndata;
  }

  generateUniqueId() {

    let length = 8;
    let timestamp = +new Date;

    var _getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let generate = function () {
      var ts = timestamp.toString();
      var parts = ts.split("").reverse();
      var id = "";

      for (var i = 0; i < length; ++i) {
        var index = _getRandomInt(0, parts.length - 1);
        id += parts[index];
      }

      return id;
    }

    var uid = generate();
    return uid;
  }


  getTotalCost(totalCost, vouchers) {
    if (vouchers != null && vouchers.length > 0) {
      for (var i = 0; i < vouchers.length; i++) {
        if (totalCost > 0) {
          totalCost = totalCost - Number(vouchers[i].balance);
        }

      }
    }

    totalCost = Number(totalCost.toFixed(2));

    if (totalCost < 0) {
      totalCost = 0;
    }

    return totalCost;

  }
  /**
   * @author aruncnt@gmail.com 
   * @param currentItem is the product detail with modifer
   * @Return amount of that given product on th basis of ot modifer
   */

  calculateTotalCost(currentItem) {

    let total = 0;
    let defaultSize = 'small';

    if (currentItem.Product.category_id == 1) {

      let itemBasePrice = false;
      let itemSizePrice = '';
      let is_crust_size_price_added = false;
      let priceBinding = false;


      if (currentItem.ProductModifier.length > 0) {

        for (var h = 0; h < currentItem.ProductModifier.length; h++) {
          let defoptions = currentItem.ProductModifier[h].Modifier.ModifierOption;

          for (var v = 0; v < defoptions.length; v++) {
            if (defoptions[v].Option.is_checked) {
              if (defoptions[v].Option.plu_code == 999991) {
                //////console.log('def1');
                defaultSize = 'small'; break;
              } else if (defoptions[v].Option.plu_code == 999992) {
                //////console.log('def2');
                defaultSize = 'medium'; break;
              } else if (defoptions[v].Option.plu_code == 999993) {
                //////console.log('def3');
                defaultSize = 'large'; break;
              }
            }
          }
        }
        //////console.log('def init', defaultSize, itemSizePrice);
        for (var i = 0; i < currentItem.ProductModifier.length; i++) {
          let options = currentItem.ProductModifier[i].Modifier.ModifierOption;

          for (var j = 0; j < options.length; j++) {

            if (options[j].Option.is_checked || options[j].Option.is_included_mod) {
              if (options[j].Option.price) {

                let addPrice = 0;
                if (!options[j].Option.is_included_mod && options[j].Option.is_checked) {

                  if (typeof options[j].Option.price[defaultSize] == 'string') {
                    //////console.log('def', defaultSize, is_crust_size_price_added);
                    if (is_crust_size_price_added == true) {
                      priceBinding = true;
                      addPrice = parseFloat(options[j].Option.price[defaultSize]);
                      itemBasePrice = true;
                      //////console.log('checkbaseprice1', itemBasePrice, addPrice);
                    } else if (itemSizePrice == 'true' || itemSizePrice == '') {

                      if (currentItem.Product.plu_code != 999999) {
                        priceBinding = true;

                        addPrice = parseFloat(options[j].Option.price[defaultSize]);
                        if (addPrice > 0) {
                          itemBasePrice = true;
                        }

                        //////console.log(1230, defaultSize, options[j].Option.price[defaultSize], addPrice, itemBasePrice);
                      } else {
                        //////console.log(123, defaultSize);
                        if (itemSizePrice != '' || options[j].Option.plu_code == 'I101') {
                          priceBinding = true;
                          addPrice = parseFloat(options[j].Option.price[defaultSize]);
                          itemBasePrice = true;
                        }


                      }

                    } else if ((itemSizePrice == 'large' || itemSizePrice == 'medium' || itemSizePrice == 'small') && total != 0) {
                      priceBinding = true;
                      addPrice = parseFloat(options[j].Option.price[defaultSize]);
                      itemBasePrice = true;
                    }

                  } else {
                    if (itemBasePrice && itemSizePrice != '' && !options[j].Option.is_included_mod && total == 0) {

                    } else {

                      if (itemSizePrice != '') {

                        addPrice = parseFloat(options[j].Option.price);
                      }

                    }

                  }

                } else {

                  if ((options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101' || options[j].Option.plu_code == '217') && options[j].Option.is_checked) {
                    if (typeof options[j].Option.price[defaultSize] == 'string') {

                      addPrice = parseFloat(options[j].Option.price[defaultSize]);
                      itemBasePrice = true;
                      priceBinding = true;
                      itemSizePrice = defaultSize;
                      //////console.log('plu', defaultSize, options[j].Option.price[defaultSize], itemSizePrice);
                    }
                  }
                }

                //////console.log('initial add price', addPrice);
                if (options[j].Option.price.small && options[j].Option.is_topping == undefined) {
                  //////console.log('obj', options[j].Option);

                  for (var x = 0; x < currentItem.ProductModifier.length; x++) {
                    let p_op = currentItem.ProductModifier[x].Modifier.ModifierOption;
                    for (var y = 0; y < p_op.length; y++) {
                      //////////console.log('new', p_op[y].Option);

                      if (p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999991 && p_op[y].Option.is_checked) {
                        defaultSize = 'small';
                      } else if (p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999992 && p_op[y].Option.is_checked) {

                        defaultSize = 'medium';
                      } else if (p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999993 && p_op[y].Option.is_checked) {
                        defaultSize = 'large';
                      }

                      if (options[j].Option.dependent_modifier_option_id == p_op[y].Option.id) {
                        if (p_op[y].Option.is_checked && options[j].Option.is_checked) {

                          addPrice = parseFloat(options[j].Option.price[defaultSize]);
                          itemBasePrice = true;
                          itemSizePrice = defaultSize;
                          if (options[j].Option.price[defaultSize] != 0) {
                            is_crust_size_price_added = true;
                          }

                          //////console.log('plu', defaultSize, options[j].Option.price[defaultSize], 'itembaseprice',itemBasePrice, addPrice);  

                        }
                        //////console.log('check',defaultSize, options[j].Option.dependent_modifier_id, p_op[y].Option);
                      }

                      if (p_op[y].Option.is_checked && options[j].Option.is_checked && (options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101')) {

                        itemSizePrice = 'true';
                      }


                      if (p_op[y].Option.is_checked && p_op[y].Option.is_included_mod == false && options[j].Option.is_checked) {

                        if (p_op[y].Option.plu_code == 999991) {  //small

                          if (typeof options[j].Option.price.small == 'string') {

                            addPrice = parseFloat(options[j].Option.price.small);

                            itemSizePrice = 'small';
                            defaultSize = 'small';
                            if (options[j].Option.price.small == 0) {
                              is_crust_size_price_added = false;
                              priceBinding = false;
                            } else {
                              priceBinding = true;
                            }
                          }

                        } else if (p_op[y].Option.plu_code == 999992) {
                          if (typeof options[j].Option.price.medium == 'string') {

                            addPrice = parseFloat(options[j].Option.price.medium);
                            itemSizePrice = 'medium';
                            defaultSize = 'medium';
                            if (addPrice > 0) {
                              itemBasePrice = true;
                            }

                            if (options[j].Option.price.medium == 0) {
                              is_crust_size_price_added = false;
                              priceBinding = false;
                            } else {
                              priceBinding = true;
                            }

                            //////console.log('med', options[j].Option.price.medium,  options[j].Option.name , options[j].Option.is_checked, options[j].Option.is_included_mod, p_op[y].Option.is_included_mod, itemBasePrice, priceBinding);
                          }

                        } else if (p_op[y].Option.plu_code == 999993) {
                          if (typeof options[j].Option.price.large == 'string') {


                            addPrice = parseFloat(options[j].Option.price.large);
                            itemSizePrice = 'large';
                            defaultSize = 'large';
                            if (options[j].Option.price.large == 0) {
                              priceBinding = false;
                              is_crust_size_price_added = false;
                            } else {
                              priceBinding = true;
                            }

                            //////console.log('large: ', options[j].Option.price.large,  options[j].Option.name , options[j].Option.is_checked, options[j].Option.is_included_mod, p_op[y].Option.is_included_mod, 'itembaseprice: ',itemBasePrice, 'pricebinding:',priceBinding);

                          }

                        }
                      }

                    }
                  }

                  //////console.log('addPrice', addPrice);
                } else if (options[j].Option.price.small && options[j].Option.is_topping != undefined && options[j].Option.is_included_mod == false && defaultSize != 'true' && is_crust_size_price_added == true) {


                  addPrice = parseFloat(options[j].Option.price[defaultSize]);

                } else if (options[j].Option.price != null && options[j].Option.is_included_mod == false && options[j].Option.price.small == undefined) {

                  addPrice = parseFloat(options[j].Option.price);

                }




                if (options[j].Option.is_checked && options[j].Option.default_checked == false) {

                  options[j].Option.send_code = 1;
                } else if (options[j].Option.is_checked == false && options[j].Option.default_checked == true) {

                  options[j].Option.send_code = 1;
                } else if (options[j].Option.is_checked == true && options[j].Option.default_checked == true) {

                  options[j].Option.send_code = 0;
                }

                if (options[j].Option.is_checked == false && options[j].Option.is_included_mod == true) {
                  options[j].Option.send_code = 1;
                }

                if (options[j].Option.is_checked == false && options[j].Option.is_included_mod == false) {
                  options[j].Option.send_code = 0;
                }

                if (options[j].Option.plu_code == '217' || options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101') {
                  if (options[j].Option.is_checked == true) {
                    options[j].Option.send_code = 1;
                  } else {
                    options[j].Option.send_code = 0;
                  }

                }


                //////console.log('check',options[j].Option.name, options[j].Option.send_code, options[j].Option.is_checked, itemBasePrice, itemSizePrice, defaultSize, options[j].Option.is_topping, is_crust_size_price_added, 'priceBinding =', priceBinding, 'includedMod', options[j].Option.is_included_mod, options[j].Option.add_extra);

                if (options[j].Option.is_checked && options[j].Option.add_extra && priceBinding == true) {

                  if (options[j].Option.price[defaultSize]) {
                    //////console.log(123);
                    addPrice += parseFloat(options[j].Option.price[defaultSize]);
                  } else {

                    addPrice += parseFloat(options[j].Option.price);
                  }
                  options[j].Option.send_code = 1;
                }


                if (currentItem.Product.plu_code == 999999) {
                  if (!isNaN(addPrice)) {

                    total += addPrice;
                  }

                } else {

                  if (!isNaN(addPrice)) {
                    total += addPrice;
                  }
                }
              }
            }
          }
        }
      }


      if (currentItem.Product.price && currentItem.Product.price[defaultSize] != undefined) {
        total += parseFloat(currentItem.Product.price[defaultSize]);
      }
      //////console.log('total', total, itemBasePrice, itemSizePrice);
      if (!itemBasePrice) {
        total = 0;
      }
      if (!itemBasePrice && currentItem.Product.plu_code == 999999) {
        //////console.log(12345);
        total = 0;
      }

      if (currentItem.Product.plu_code != 999999 && total == 10) {
        //////console.log(1234);
        total = 0;
      }

      if (currentItem.Product.plu_code != 999999 && itemSizePrice == '') {
        //////console.log(123, itemSizePrice);
        total = 0;
      }


    } else {


      if (currentItem.ProductModifier.length > 0) {
        let defaultSize = 'small';
        let totalModCount = currentItem.ProductModifier.length;

        for (var i = 0; i < currentItem.ProductModifier.length; i++) {

          let options = currentItem.ProductModifier[i].Modifier.ModifierOption;
          let freeOptionCount = currentItem.ProductModifier[i].free;

          for (var j = 0; j < options.length; j++) {

            if (options[j].Option.is_checked && options[j].Option.default_checked == false) {
              options[j].Option.send_code = 1;

              if (options[j].Option.is_included_mod == false) {

                if (freeOptionCount == 0) {
                  if (typeof options[j].Option.price.small == 'string') {
                    total += parseFloat(options[j].Option.price[defaultSize]);
                  } else {
                    total += parseFloat(options[j].Option.price);
                  }
                } else {
                  freeOptionCount = parseInt(freeOptionCount) - 1;
                }

              }


            } else if (options[j].Option.is_checked == false && options[j].Option.default_checked == true) {
              options[j].Option.send_code = 0;
            } else if (options[j].Option.is_checked == true && options[j].Option.default_checked == true) {
              options[j].Option.send_code = 1;
              if (options[j].Option.is_included_mod == false) {
                if (typeof options[j].Option.price.small == 'string') {
                  total += parseFloat(options[j].Option.price[defaultSize]);
                } else {
                  total += parseFloat(options[j].Option.price);
                }
              }
            }

            if (options[j].Option.default_checked && options[j].Option.plu_code == 999991) {
              defaultSize = 'small';
            } else if (options[j].Option.default_checked && options[j].Option.plu_code == 999992) {
              defaultSize = 'medium';
            } else if (options[j].Option.default_checked && options[j].Option.plu_code == 999993) {
              defaultSize = 'large';
            }

            if (options[j].Option.add_extra) {
              //////////console.log(defaultSize, options[j].Option.price);
              if (typeof options[j].Option.price.small == 'string') {
                total += parseFloat(options[j].Option.price[defaultSize]);
              } else {
                total += parseFloat(options[j].Option.price);
              }

            }

          }
        }
      }
      total += parseFloat(currentItem.Product.price);
    }
    total = Number(total.toFixed(2));
    return total;

  }


 
}
