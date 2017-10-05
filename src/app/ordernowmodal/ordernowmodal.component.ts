import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import {DateRangePickDirective} from '../date-range-pick.directive';
import { DateRange } from '../date-range';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-ordernowmodal',
  templateUrl: './ordernowmodal.component.html',
  styleUrls: ['./ordernowmodal.component.css']
})
export class OrdernowmodalComponent extends DialogComponent<OrdernowModal, boolean> implements OnInit{

  constructor(dialogService: DialogService, private dataService: DataService, private router: Router, private utilService: UtilService) {
    super(dialogService);
   }

  dateRange:DateRange=new DateRange({});
   
  curDateTime = this.utilService.formatDate(this.utilService.getNowDateTime(35));
  userCountryName = '';
  userCountryCode = '';
  cityList = [];
  storeList = [];
  areaList = { areas: [], streets: []};
  selectedStore = { info: null, val: ''};
  showContent = 'pickup-delivery';
  cityVal = '';
  areaVal = '';
  postalCode = '';
  delivery_state = '';
  delivery_apartment = '';
  delivery_streetno = '';
  delivery_street = '';
  showOutletError = false;
  delivery_time = this.curDateTime;
  showTimeError = '';
  curDate = new Date();
  showStoreLoading = false;
  timeModalText = '';
  useStreetDb = false;
  streetArr = [];
  selectedStreet = '';
  citySource = [];
  showCityList = false;
  showAreaList = false;
  time = { hour: '01', minutes: '00' };
  showStoreTimeError = false;
  storeImg = null;
  currencyCode = this.utilService.currencyCode;
  storeTime = this.utilService.getStoreTimings();

  hours = [];
  minutes = this.utilService.getMinutes();

  order = {
    orderType: 'pickup',
    delivery_time_type: 'asap',
    selectedStore: this.selectedStore
  };

  isValidPostalFlag = true;

   
  pickerOptions: Object = {
    'showDropdowns': true,
    'singleDatePicker': true,
    'timePicker': true,
    'startDate': this.utilService.getNowDateTime(35),
    'minDate': this.utilService.getNowDateTime(35),
    'autoUpdateInput': true,
    'timePickerIncrement': 5,    
    locale: {
            format: 'YYYY/MM/DD hh:mm A',
            'applyLabel': 'Submit',
            'cancelLabel': 'Close'
        }
  };

  fromObj = this.fromObj;


  ngOnInit() {
    this.order['delivery_state'] = '';
    this.userCountryName = this.dataService.getLocalStorageData('userCountry');
    this.userCountryCode = this.dataService.getLocalStorageData('userCountryCode');
    if (this.userCountryName != undefined && this.userCountryName != null && this.userCountryName != '') {
      //this.userCountryName = 'uae';  //hardcode for testing
      if (this.userCountryName.toLowerCase() == 'uae' || this.userCountryName.toLowerCase() == 'united arab emirates') {
        this.useStreetDb = true;
        this.order['delivery_state'] = 'UAE';
      }
    }

    let user_details = this.dataService.getLocalStorageData('user-details');
    if (user_details != undefined) {
      user_details = JSON.parse(user_details);

      if (user_details['defaultAddress'] != null) {
        this.cityVal = user_details['defaultAddress'].city;
        this.areaVal = user_details['defaultAddress'].city;
        this.postalCode = user_details['defaultAddress'].postal_code;
        this.delivery_streetno = user_details['defaultAddress'].streetNo;
        this.delivery_apartment = user_details['defaultAddress'].apartment;
        this.order['delivery_state'] = user_details['defaultAddress'].state;
        
      }
    }

  }


  dateSelected(dateRange:DateRange) {
    this.dateRange=dateRange;
  }

  updateOrderType(type) {
    this.order.orderType = type;
    this.selectedStore.info = null;
    this.selectedStore.val = ''

    if(type == 'pickup') {
      this.timeModalText = 'What time would you like to pick up your order?';
    }else if(type == 'delivery') {
      this.timeModalText = 'What time would you like your order to be delivered?';
    }
  }

  selectCity(city) {
    this.getStores(city);
    this.cityVal = city;
    this.showCityList = false;
  }

  selectArea(area) {
    this.getAreaStreets(area);
    this.areaVal = area;
    this.cityVal = area;
    this.showAreaList = false;
  }

  getCities(searchKey) {

    if(searchKey.length > 2) {
      this.dataService.getCitiesSuggestions(this.userCountryCode, searchKey)
            .subscribe(data => {            
                this.cityList = data;
                this.showCityList = true;
                this.getStores(searchKey);
            });
    }
  
  }

  getStreetArea(searchKey) {
    if(searchKey.length > 1) {
      this.dataService.getAreaSuggestions(this.userCountryName, searchKey)
            .subscribe(data => {
                this.areaList = data;
                this.showAreaList = true;
                this.order['delivery_state'] = this.areaList.areas[0].country;
                this.getAreaStreets(this.areaList.areas[0].city);
            });
    }
  }


  getAreaStreets(area) {
    let streets = [];
    if(area != '' && this.areaList.streets.length > 0) {
      for(var i=0; i<this.areaList.streets.length; i++) {
        if(this.areaList.streets[i].area_name == area) {
          streets.push(this.areaList.streets[i]);
        }
      }
      if (streets.length > 0) {
        //console.log(streets);
        this.streetArr = streets;
      }
    }
  } 


  getAreaStores(street) {
    let stores = [];
    this.showStoreLoading = true;
    if(street != '' && this.areaList.streets.length > 0) {
      for(var i=0; i<this.areaList.streets.length; i++) {
        if(this.areaList.streets[i].street_name == street) {
          let storeObj = {
            Store: this.areaList.streets[i].Store
          }
          stores.push(storeObj);
        }
      }
    }
    this.storeList = stores;
  }


  getStores(cityVal) {
    this.showStoreLoading = true;
    this.dataService.getStoreList(cityVal)
          .subscribe(data => {                    
                    this.storeList = data;
                    this.selectedStore.val = data[0].Store.id;
                    this.setSelectedStore(data[0].Store.id);
                    this.showStoreLoading = false;                 
                }); 
  }
  
  getStoresFromPostalCode(postal_code) {
    this.showStoreLoading = true;
    this.dataService.getStoresFromPostalCode(postal_code)
        .subscribe(data => {                    
                    this.storeList = data;
                    this.showStoreLoading = false;                    
                }); 
  }


  setSelectedStore(id) {    
    if(id != '') { 
      let stores = this.storeList;     
      for(var i=0; i<stores.length; i++) {
         if(stores[i].Store.id == id) {
           this.selectedStore.info = stores[i];
           this.storeImg = environment.cmsApiPath + '/' + stores[i].Store.store_image;
           this.order['delivery_state'] = stores[i].Store.state;
           break;
         } 
      }

      this.showOutletError = false;    
    }else{
      this.showOutletError = true;
    }
  }

  goTotimeModal() {
    //this.getCurrentDateTime();
    if(this.selectedStore.val == '') {
      this.showOutletError = true;
    }else{
      this.order.selectedStore = this.selectedStore.info;
      this.showContent = 'delivery-time';
    }
  }

  updateDeliveryTimeType(type) {
    this.order.delivery_time_type = type;
    this.showOutletError = false;
    this.time.hour = '01';
  }

  goToMenu() {
  
    if(this.selectedStore.info != '') {

        let orderDetails = {
            
              type: this.order.orderType,
              delivery_time_type: this.order.delivery_time_type,
              delivery_time: this.delivery_time,
              selectedStore: this.order.selectedStore,
              address: {
                apartment: this.delivery_apartment,
                streetNo: this.delivery_streetno,
                street: this.delivery_street,
                city: this.cityVal,
                state: this.delivery_state,
                postal_code: this.postalCode
              
            }
        }

        if(orderDetails.type == 'delivery' && orderDetails.delivery_time_type == 'defer') {
           if(orderDetails.delivery_time == null) {
            this.showTimeError = 'Please select delivery date/time';
          }
        }

        this.dataService.setLocalStorageData('order-now', JSON.stringify(orderDetails));

        if (this.fromObj != null && this.fromObj != undefined && this.fromObj.modCount != undefined) {

          if (this.fromObj.modCount > 0) {

            this.close();
            this.router.navigate(['/item', this.fromObj.slug]); 

          } else {

            this.dataService.getItemData(this.fromObj.slug, this.fromObj.menuCountry)
            .subscribe(data => {
                 
                  data.originalItemCost = data.Product.price;
                  data.totalItemCost = data.Product.price;
                  let temp = this.dataService.getLocalStorageData('allItems');
                  
                  if(temp == null || temp == 'null') {
  
                    let allItems = [];  
                    allItems.push(data);
                    this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
  
                  }else{
  
                    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems')); 
                    let isExist = false;
                    for(var i=0; i<allItems.length; i++) {
                      if(allItems[i].Product.id == data.Product.id) {
                        allItems[i].Product.qty += 1;
                        allItems[i].totalItemCost = parseFloat(allItems[i].Product.price)*allItems[i].Product.qty;
                        isExist = true;
                        break;
                      }
                    }         
                    
                    if(!isExist) {
                      allItems.splice(0,0,data);
                    }
                      
                    this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
  
                  }
                  
                  this.result = true;
                  this.close();
                  
                  
            });
        
          }

        } else {
          this.close();
          this.router.navigate(['/menu']);
        }
        
        //window.location.reload();
      
       

    }else{
      this.showOutletError = true;
    }
    
  }
  


  getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.dataService.getStoresFromLatLong(position.coords.latitude, position.coords.longitude)
              .subscribe(data => {             
                    this.cityVal = data.cityVal;
                    this.postalCode = data.postalCode;      
                    this.storeList = data.stores;   
                    if (data.stores.length > 0) {
                      this.selectedStore.val = data.stores[0].Store.id;
                      this.setSelectedStore(data.stores[0].Store.id);
                    }                 
                }); 
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  }

  getCurrentDateTime() {
    let now = new Date();
    now.setMinutes(now.getMinutes() + 30);
  }

  validatePostalCode(val) {
    if (val.length >= 3) {
      let code = val.trim().toUpperCase();
      this.isValidPostalFlag = this.dataService.isValidPostalCode(code);

      if (this.isValidPostalFlag) {
        this.getStores('edinburgh');
      }

    } else {
      this.isValidPostalFlag = true;
    }
  }

}

export interface OrdernowModal {
  fromObj: object;
}
