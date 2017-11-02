import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { DialogService } from "ng2-bootstrap-modal";
import { LoginComponent } from '../login/login.component';
import { FavmodalComponent } from '../favmodal/favmodal.component';
import { MessageComponent } from '../message/message.component';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import {DateRangePickDirective} from '../date-range-pick.directive';
import { DateRange } from '../date-range';
declare var $: any;

@Component({
  selector: 'app-orderreview',
  templateUrl: './orderreview.component.html',
  styleUrls: ['./orderreview.component.css']
})
export class OrderreviewComponent implements OnInit {

  dateRange:DateRange=new DateRange({});
  showLoading = true;
  items = null;
  totalCost = null;
  netCost = null;
  storeDetails = '';
  favTitle = '';
  couponMsg = '';
  order = { 
            storeId: '',
            coupon: '',
            couponDiscount: 0,
            user: {
                first_name: '',
                last_name: '',
                email: '',
                phone: ''
            },
            order_type: 'pickup',
            delivery_time: '',
            delivery_time_type: '',
            defer: {
              print_time: new Date().toString(),
              required_time: ''
            },
            address: {
              apartment: '',
              streetNo: '',
              street_no: '',
              street: '',
              city: '',
              state: '',
              postal_code: ''
            },
            order_details: []
          };

    validationError = {
      field: '',
      message: ''
    }

    showStep = 'step1';
    cmsApiPath = environment.cmsApiPath;
    showSavingFav = false;
    couponCode = '';
    showCouponWait = false;
    couponDiscount = 0;  
    isDiscountApply = false;
    currencyCode = null;
    isDubai = false;
    time = { hour: '01', minutes: '00' };
    showStoreTimeError = false;
    formattedItems = null;

    hours = [];
    minutes = this.utilService.getMinutes();
	isMealDeal = false;
    
    pickerOptions = {
        showDropdowns: true,
        singleDatePicker: true,
        timePicker: true,
        startDate: this.utilService.getNowDateTime(35),
        minDate: this.utilService.getNowDateTime(35),
        autoUpdateInput: true,
        timePickerIncrement: 5,    
        locale: {
                format: 'YYYY/MM/DD hh:mm A',
                'applyLabel': 'Submit',
                'cancelLabel': 'Close'
            }
      };

    isValidPostalFlag = true;  
    defaultAddress = null;
    useDefaultAddress = false;
    tempObj = null;

  constructor(private dataService: DataService,
               private dialogService:DialogService,
                private utilService: UtilService, 
                  private route: ActivatedRoute, 
                    private router: Router) { }
  
  ngOnInit() {
    this.currencyCode = this.utilService.currencyCode;
    this.getItems();
    this.updateUserDetails();
    this.order.storeId = '1';
    
    let uCountry = this.dataService.getLocalStorageData('userCountry');
    if (uCountry != undefined && uCountry != null && uCountry != '') {
      if (uCountry.toLowerCase() == 'uae' || uCountry.toLowerCase() == 'united arab emirates') {
        this.isDubai = true;
      }
    }  
    this.dataService.setLocalStorageData('favItemFetched', null);
    this.dataService.setLocalStorageData('favOrdersFetched', null); 
    this.dataService.setLocalStorageData('confirmationItems', null); 
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);

    let reOrderData = this.dataService.getLocalStorageData('reOrderData');
    if(reOrderData != null && reOrderData != 'null') {

      reOrderData = JSON.parse(reOrderData);
      this.order.order_type = reOrderData['order_type'];
      this.order.delivery_time_type = reOrderData['delivery_time_type'];
      this.order.storeId = reOrderData['storeId'];

      if (reOrderData['address'] != undefined) {
        this.order.address = reOrderData['address']; 
        this.order.address.streetNo = this.order.address.street_no;     
      }

      let curDateTime = this.utilService.formatDate(this.utilService.getNowDateTime(35));
      this.order.delivery_time = curDateTime;
      this.dataService.setLocalStorageData('reOrderData', null);

    } else {
    
      let orderDetailsData = this.dataService.getLocalStorageData('order-now');
      if(orderDetailsData != null && orderDetailsData != 'null') {
        
        let orderDetails = JSON.parse(orderDetailsData);  
        this.order.order_type = orderDetails.type;
        this.order.delivery_time = orderDetails.delivery_time;
        this.order.delivery_time_type = orderDetails.delivery_time_type;
        this.pickerOptions.startDate = new Date(this.order.delivery_time);
        this.order.address = orderDetails.address;
        
        if (orderDetails.selectedStore != undefined && orderDetails.selectedStore.Store.id != undefined) {
          this.order.storeId = orderDetails.selectedStore.Store.store_id;
          this.getStoreDetails(orderDetails.selectedStore.Store.id);
        } else if(this.dataService.getLocalStorageData('nearByStore') != undefined && 
            this.dataService.getLocalStorageData('nearByStore') != '') { 
            this.order.storeId = this.dataService.getLocalStorageData('nearByStore'); 
            //this.order.storeId = 'Marina';
        }

      } else {

        if(this.dataService.getLocalStorageData('nearByStore') != undefined && 
              this.dataService.getLocalStorageData('nearByStore') != '') { 

            this.order.storeId = this.dataService.getLocalStorageData('nearByStore'); 
            //this.order.storeId = 'Marina';
        }
      }
      
      // if(this.order.order_type == 'delivery') {
      //    this.totalCost += 6;
      // }
    }


    
    //console.log(this.order);
  }


  updateUserDetails() {
      let isLoggedIn = this.dataService.getLocalStorageData('isLoggedIn');
      if(isLoggedIn != undefined && isLoggedIn == 'true') {
        let userDetails = JSON.parse(this.dataService.getLocalStorageData('user-details'));

        this.dataService.getProfile(userDetails.id).subscribe(pdata => { 
            if (pdata.Address1 != '' && pdata.Address1 != null && pdata.Address1 != "null") {
              let address = JSON.parse(pdata.Address1);
              if (address.is_default == 1) {
                this.defaultAddress = address;
              }
            }
      
            if (pdata.Address2 != '' && pdata.Address2 != null && pdata.Address2 != "null") {
              let address = JSON.parse(pdata.Address2);
              if (address.is_default == 1) {
                this.defaultAddress = address;
              }
            }
      
            if (pdata.Address3 != '' && pdata.Address3 != null && pdata.Address3 != "null") {
              let address = JSON.parse(pdata.Address3);
              if (address.is_default == 1) {
                this.defaultAddress = address;
              }
            }
        });

        this.order['userid'] = userDetails.id;
        this.order.user = {
          first_name: userDetails.firstName,
          last_name: userDetails.lastName,
          email: userDetails.email,
          phone: userDetails.phone
        }
      }
  }


  getStoreDetails(storeId) {
    this.dataService.getStoreDetails(storeId)
      .subscribe(data => {              
              this.storeDetails = data;
              this.order.storeId = data.Store.store_id;
              ////console.log('store details', this.order.storeId);
          });
  }

  getItems() {
    
    if(this.dataService.getLocalStorageData('allItems') != null 
            && this.dataService.getLocalStorageData('allItems') != undefined) {
              
              this.items = JSON.parse(this.dataService.getLocalStorageData('allItems'));

              let formattedItemsData = this.dataService.formatCartData(this.items, 'orderreview');
              
			  if (formattedItemsData.deals.length > 0) {
				  this.isMealDeal = true;
			  }
              this.formattedItems = formattedItemsData;
          
              this.totalCost =  formattedItemsData.totalPrice;
              this.netCost = this.totalCost;
        
              
    }else{
      window.location.href = '/';
    }
    this.showLoading = false; 
  }

  updateQuantity(type, plu) {

    let total = 0;

    for(var i=0; i<this.items.length; i++) {
      if(this.items[i].Product.plu_code == plu) {

          let oldQty = this.items[i].Product.qty;
          //increase
          if(type == 1) {
            this.items[i].Product.qty += 1;      
          }else{
           
            this.items[i].Product.qty = this.items[i].Product.qty - 1;
            if(this.items[i].Product.qty <= 0) {
              this.items[i].Product.qty = 1;
            }
          }

          if (this.items[i].originalItemCost != undefined) {
            total =  parseFloat(this.items[i].originalItemCost)*this.items[i].Product.qty;
            
          } else {
            this.items[i].originalItemCost = this.items[i].totalItemCost/oldQty;
            total =  parseFloat(this.items[i].originalItemCost)*this.items[i].Product.qty;
          }

          this.items[i].totalItemCost = total;
          

          break;
      }
    }

    let formattedItemsData = this.dataService.formatCartData(this.items, 'orderreview');    
    this.formattedItems = formattedItemsData;
    this.totalCost =  formattedItemsData.totalPrice;
    this.netCost = this.totalCost;
   // //console.log(type, this.totalCost, this.items.Product.qty);
  }


  addDeliveryCost(e, type) {
    
    if(type == 'delivery') {
      //this.totalCost = parseFloat(this.totalCost) + 6;
     
    }else{
      //this.totalCost = parseFloat(this.totalCost) - 6;
    }
     
  }

  confirmOrder(isFormValid) {
    let isDelivery = this.order.order_type;
    if (this.order.address != undefined) {
      let apartment = this.order.address.apartment;
    }
    
    let city = this.order.address.city;
    let postal_code = this.order.address.postal_code;
    let state = this.order.address.state;
    let street = this.order.address.street;
    let street_no = this.order.address.street_no;
    let streetNo = this.order.address.streetNo;

    let isValid = this.validateFields();
    ////console.log('validate', this.order);
    if(isValid) {
      if(isDelivery=='delivery'){
        if(street==''){
          alert('Street name is required.');
        }else if(city==''){
          alert('City is required.');
        }else{
          this.placeFinalOrder();
        }
      }else{
        this.placeFinalOrder();
      }
    }else{
      alert('Please fill all required fields!');
    }
    
  }


  deleteItem(num, prod) {

    var y = confirm('Are you sure, you want to delete this item from order?');
      if(y) {
          let allItems = [];
          let item = this.items;
          this.items.splice(num, 1);
          allItems = this.items;

          if(allItems.length > 0) {
            
            this.items = allItems;
            this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));
            let formattedItemsData = this.dataService.formatCartData(this.items, 'orderreview');    
            this.formattedItems = formattedItemsData;
            this.totalCost =  formattedItemsData.totalPrice;
            this.netCost = this.totalCost;

          }else{
            this.items = [];
            this.dataService.setLocalStorageData('allItems', 'null');
            alert('No items remaining in your cart!');
            this.router.navigate(['/menu']);
          }
         
      }
      

  }


  deleteDealItem(dealId, comboUniqueId) {
    var y = confirm('Are you sure, you want to delete this deal from order?');
    if(y) {
      let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
      
      let remainingItems = [];

      for (var i=0; i<allItems.length; i++) {
        if (allItems[i].Product.dealId == undefined || (allItems[i].Product.dealId != dealId && allItems[i].Product.comboUniqueId != comboUniqueId)) {
          remainingItems.push(allItems[i]);
        }
      }

      if(remainingItems.length > 0) {
        this.items = remainingItems;    
        this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));
        let formattedItemsData = this.dataService.formatCartData(this.items, 'orderreview');    
        this.formattedItems = formattedItemsData;
        this.totalCost =  formattedItemsData.totalPrice;
        this.netCost = this.totalCost;
      } else {
        this.items = [];
        this.dataService.setLocalStorageData('allItems', 'null');
        alert('No items remaining in your cart!');
      }
    }

  }


  updateDeliveryTimeType(type) {
    this.order.delivery_time_type = type;
    if (type == 'asap') {
      this.order.delivery_time = this.utilService.formatDate(this.utilService.getNowDateTime(35));
    }
  }

  validateFields() {

    let order = this.order;

    //No items in cart
    if(this.items.length == 0) {
      alert('No items in your cart! You will be redirected to menu page.');
      this.router.navigate(['/menu']);
    }

    return true;

  }


  placeFinalOrder() {
    
    let goFlag = true;
    let tVal = null;

    if (this.order.order_type == 'delilvery' && !this.isValidPostalFlag) {
      goFlag = false;
    }
    this.order.delivery_time = $("#DateTimeDel").val();
    tVal = this.order.delivery_time;
    //console.log('orderstart', this.order);
    this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));

    if (goFlag) {

        let finalOrder = [];
        if(this.items.length > 0) {

            //check for minimum order for delivery
            if (this.order.order_type == 'delivery' && this.totalCost < 12.99) {

              this.dialogService.addDialog(MessageComponent, { title: 'Alert', message: 'Minimum order should be ' + this.currencyCode + '12.99', buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true });

            } else {

              let orderData = this.order;
              //console.log('orderData', orderData);
              if(orderData.address) {
              orderData.address.street_no = orderData.address.streetNo;
              
              if(orderData.address.state.toLowerCase() == 'dubai') {
                orderData.address.state = 'UAE';
              }
  
              if(orderData.address.postal_code == '') {
                orderData.address.postal_code = '0';
              }
                delete orderData.address.streetNo; 
              }
			  
			  //meal deal
			  if (this.isMealDeal) {
				  this.order['is_meal_deal'] = 'MEALDEAL';
        } 
        
        if (this.order.delivery_time_type == 'defer') {

          let rTime = new Date(tVal);
          let pTime = this.utilService.subtractTime(rTime, 20);

          orderData.defer = {
            print_time: pTime.toString(),
            required_time: rTime.toString()
          }
          
          orderData.defer.print_time = this.utilService.toISOString(orderData.defer.print_time);
          orderData.defer.required_time = this.utilService.toISOString(orderData.defer.required_time);

        }
  
          if(this.order.order_type == 'pickup') {
                //orderData.delivery_time;
                //delete orderData.delivery_time_type;
                delete orderData.address;
                //delete orderData.defer;
              }
  
              if(this.order.delivery_time_type == 'asap') {
                delete orderData.defer;
              }

              this.order.order_details = this.prepareFinalOrderData(this.items);
              this.order['latlong'] = this.dataService.getLocalStorageData('latlong');
              this.dataService.setLocalStorageData('finalOrder', JSON.stringify(orderData));
              ////console.log('order', this.order.order_details);
              this.showLoading = false;
              this.router.navigate(['/checkout']);
              
            }
            
          }

    }
      
  }



  prepareFinalOrderData(items) {

    let finalOrder = [];
    if(items.length > 0) {
        //console.log('placeorder', items);
        for(var p=0; p<items.length; p++) {
           let products = items[p];
          
           let product = { name: '', plu: '', category_id: products.Product.category_id, quantity: 1, modifier: [], dealId: null, comboUniqueId: null};
            product.name = products.Product.title;
            product.plu = products.Product.plu_code;
            product.quantity = products.Product.qty;

            if (products.Product.dealId != undefined) {
              let dCode = products.Product.dealId;
              //console.log('dcode', dCode);
              if(!isNaN(products.Product.dealId)) {
                product.dealId = this.dataService.getDealCode(products.Product.dealId);
              } else {
                product.dealId = products.Product.dealId;
              }
              
              product.comboUniqueId = products.Product.comboUniqueId;
            } else {
              delete product.dealId;
              delete product.comboUniqueId;
            }
            
            
          // //console.log(products);
            if(products.ProductModifier.length > 0) {
              
              for(var i = 0; i<products.ProductModifier.length; i++) {
                
                for(var j = 0; j < products.ProductModifier[i].Modifier.ModifierOption.length; j++) {
                    
                    let opt = products.ProductModifier[i].Modifier.ModifierOption[j].Option;
                    
                   
                      if((opt.plu_code == '217' || opt.plu_code == 'I100' || opt.plu_code == 'I101') && opt.is_checked) {
                          opt.send_code = 1;
                          ////console.log('fix', opt.name);
                      }

                    if((opt.send_code == 1) 
                        || (opt.plu_code == 999991 && opt.is_checked)
                          || (opt.plu_code == 999992 && opt.is_checked)  
                            || (opt.plu_code == 999993 && opt.is_checked)) {
                      
                      let isSizeCrust = false;
                      if(opt.plu_code == 999991
                          || opt.plu_code == 999992  
                            || opt.plu_code == 999993 
                              || opt.plu_code == 217
                                || opt.plu_code == 'I100'  
                                  || opt.plu_code == 'I101') {

                              isSizeCrust = true;
                      
                      }       


                      let circle_type = 'Full';

                      for(var a=0; a < opt.OptionSuboption.length; a++) {
                        if(opt.OptionSuboption[a].SubOption.is_active == true) {
                          circle_type = opt.OptionSuboption[a].SubOption.name;
                        }
                      }

                      let sendToOrder = true;
                      if(opt.category_id != 1 && opt.category_id != 8 && isSizeCrust == false) {
                        if(opt.is_checked && opt.default_checked) {
                          if(!opt.add_extra) {
                            sendToOrder = false;  
                          }
                        }
                      } 
                     
                      
                      if(sendToOrder) {

                          //console.log('verify: ply', opt.plu_code, 'sendcode: ', opt.send_code, 'issizecrust:', isSizeCrust, 'is_checked:', opt.is_checked, 'defalt checked: ', opt.default_checked, 'add extra', opt.add_extra);

                          let modType = 'modifier';
                          if(opt.is_included_mod) {
                            modType = 'included_modifier';
                          }

                          let val = {
                              plu: opt.plu_code,   
                              category_id: product.category_id,                
                              add_extra: opt.add_extra,
                              quantity: opt.quantity,
                              type: 0,
                              modifier_type: modType,
                              choice: circle_type,
                              send_code: opt.send_code                              
                          }

                          if (opt.plu_code == 999991 || opt.plu_code == 999992 || opt.plu_code == 999993 || opt.plu_code == 217 || opt.plu_code == 'I100' || opt.plu_code == 'I101') {

                            if (opt.is_checked) {
                              val.type = 1;
                              product.modifier.push(val);
                            }

                          } else {
                            if(opt.is_checked || opt.add_extra == true) {
                              val.type = 1;
                              
                            }
                            product.modifier.push(val);
                          }
                          
                          
                      }
                      
                    }

                }
              }
            }
            
            finalOrder.push(product); 
        }

      }
      //console.log('finalOerer', finalOrder);
      return finalOrder;

  }


  addToFav() {
    let isLoggedIn = this.dataService.getLocalStorageData('isLoggedIn');
    if(isLoggedIn == undefined || isLoggedIn == 'false') {
      //do login
        this.dialogService.addDialog(LoginComponent, {  }, { closeByClickingOutside:true });
    }else{
      //add fav
           
      let userDetails = JSON.parse(this.dataService.getLocalStorageData('user-details'));
      let userId = userDetails.id;
      let favData = null;

      let favOrdArr = [];
      for(var i=0; i < this.items.length; i++) {
        let favObj = this.utilService.formatFavData(this.items[i]);
        let favDataObj = {
          userId: userDetails.id,
          data: favObj
        }

        favOrdArr.push(favDataObj);
      }

      favData = favOrdArr;
      ////console.log('fav', favData);
      this.showSavingFav = true;
      this.dataService.saveFavItem(userId, this.favTitle, favData, 'order')
        .subscribe(data => {
            this.showSavingFav = false;
            this.openMessageModal('Your favourite item has been saved successfully!');
            ////console.log('fav resp', data);
        });  

    }
  
  }

    openMessageModal(messageText) {
        let self = this;
        self.dialogService.addDialog(MessageComponent, { title: 'Success', message: messageText, buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true });   
    }


    applyCoupon() {
      this.showCouponWait = true;
      
      if(this.couponCode.trim() != '') {

        let orderObj = {
          storeId: this.order.storeId,
          coupon: this.couponCode,
          order_type: this.order.order_type,
          order_details: this.prepareFinalOrderData(this.items)
        }
        
        this.dataService.applyCoupon(orderObj)
              .subscribe(data => {
                  let resp = data;
                 
                  if(resp.Status == 'Error') {
                    this.couponMsg = resp.Message;
                    this.showCouponWait = false;
                  }else if(resp.Status == 'OK') {
                    this.couponDiscount = parseFloat(resp.Discount);  
                    this.isDiscountApply = true;
                    this.couponMsg = 'Coupon appled successfully.';
                    this.showCouponWait = false;
                    this.order.coupon = this.couponCode;
                    this.order.couponDiscount = this.couponDiscount;
                    this.totalCost = this.totalCost - this.couponDiscount;
                  }

                  setTimeout(function(){
                    this.couponMsg = '';
                  }, 4000);
              }); 

      }else{
        this.showCouponWait = false;
        this.couponMsg = 'Please enter valid coupon';
      }

      setTimeout(function() {
        this.couponMsg = '';
      }, 4000);
    }


    removeCoupon() {
      this.order.coupon = '';
      this.isDiscountApply = false;
      this.totalCost = this.totalCost + this.couponDiscount;
      this.couponMsg = 'Coupon removed successfully.';
      setTimeout(function(){
        this.couponMsg = '';
      }, 4000);
    }


    editItem(index, prod) {
      this.router.navigate(['/item/edit', index]);
    }

    validatePostalCode(val) {
      if (val.length >= 3) {
        let code = val.trim().toUpperCase();
        this.isValidPostalFlag = this.dataService.isValidPostalCode(code);
      } else {
        this.isValidPostalFlag = true;
      }
    }

    displayDefaultAddress() {
      if (!this.useDefaultAddress) {
        this.tempObj = this.order.address;
        this.order.address.apartment = this.defaultAddress.apartment;
        this.order.address.street = this.defaultAddress.street;
        this.order.address.city = this.defaultAddress.city;
        this.order.address.postal_code = this.defaultAddress.postal_code;       
      } 
    }
	
	clearCart() {
		this.dataService.clearCart();
		window.location.href = '/';
	}


}
