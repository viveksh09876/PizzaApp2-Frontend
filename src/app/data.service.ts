import { Injectable } from '@angular/core';
import { Http, Response, Jsonp  } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';
import { UtilService } from './util.service';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class DataService {

  constructor(private http: Http, private jsonp:Jsonp, private utilService: UtilService) { }

  domain = environment.cmsApiPath;
  selectedFavItemData = null;
  allDealsData = null;

  
  getSlides(lang_id): Observable<any>{

    return this.http.get( this.domain + '/webservice/get_slides/'+lang_id)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }
  
  getMenuData(storeId, country): Observable<any>{

    return this.http.get( this.domain + '/webservice/get_all_categories_data/'+storeId+ '/'+country)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getAllBanners(): Observable<any>{
    return this.http.get( this.domain + '/webservice/get_slides')
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getIp(): Observable<any>{
    return this.http.get( this.domain + '/webservice/getip')
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getItemData(slug, menuCountry): Observable<any>{
    if(menuCountry == null) {
      menuCountry = 'UK';
    }
    return this.http.get( this.domain + '/webservice/getItemData/'+slug+'/'+menuCountry)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  setLocalStorageData(key, data) {
    localStorage.setItem(key, data);
  }
 
  getLocalStorageData(key) {
    return localStorage.getItem(key);
  }

  clearLocalStorageData() {
    localStorage.clear();
    return;
  }

  placeOrder(data): Observable<any>{
    return this.http.post( this.domain + '/webservice/placeOrder', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getCitiesSuggestions(countryCode, searchKey): Observable<any>{
    return this.http.get( this.domain + '/webservice/getCitiesSuggestion/'+searchKey+'/'+countryCode)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 
   
  getAreaSuggestions(country, searchKey): Observable<any>{   
    return this.http.get( this.domain + '/webservice/getAreaSuggestion/'+country+'/'+searchKey)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 


  getStoreList(city): Observable<any>{   
    return this.http.get( this.domain + '/webservice/getStoreList/'+city)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }
                  
  
  getAreaStoreList(street): Observable<any>{   
    return this.http.get( this.domain + '/webservice/getAreaStoreList/'+street)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getStoresFromPostalCode(code): Observable<any>{   
    return this.http.get( this.domain + '/webservice/getStoresFromPostalCode/'+code)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 

  getStoresFromLatLong(lat, lng): Observable<any>{   
  
    return this.http.get( this.domain + '/webservice/getStoresFromLatLong/'+lat+'/'+lng)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );


  }   

  getStoreDetails(id): Observable<any>{   
  
    return this.http.get( this.domain + '/webservice/getStoreDetails/'+id)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );


  }
                  
  getStoreDetailsByStoreId(id): Observable<any>{   
  
    return this.http.get( this.domain + '/webservice/getStoreDetailsByStoreId/'+id)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );


  }  


  login(username, password): Observable<any>{   
    
    let data = { username: username, password: password};
    return this.http.post( this.domain + '/webservice/login', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }


  getTwitterFeeds(name): Observable<any>{   
  
    return this.http.get( this.domain + '/webservice/getTwitterFeeds/'+name)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );


  }

  saveFavItem(userId, favTitle, itemData, type): Observable<any>{   
    
    let data = {  user_id: userId,
                  fav_name: favTitle,
                  fav_type: type,
                  fav_detail: itemData
                };
    return this.http.post( this.domain + '/webservice/saveFavItem', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }

  getFbFeeds(name): Observable<any>{

    return this.http.get( this.domain + '/webservice/getFbFeed/'+name)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getIgFeeds(name): Observable<any>{

    return this.http.get( this.domain + '/webservice/getIgFeed/'+name)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  sendCateringInfo(cateringInfo): Observable<any>{   
    let data = cateringInfo;
    return this.http.post( this.domain + '/webservice/sendCateringInfo', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }

   sendContactInfo(ContactInfo): Observable<any>{   
    let data = ContactInfo;
    return this.http.post( this.domain + '/webservice/sendContactInfo', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }
                  
  sendApplyInfo(ApplyInfo): Observable<any>{   
    let data = ApplyInfo;
    return this.http.post( this.domain + '/webservice/sendApplyInfo', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }

  sendCareerInfo(CareerInfo): Observable<any>{   
    let data = CareerInfo;
    return this.http.post( this.domain + '/webservice/sendCareerInfo', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }

  getCountryStore(countryName): Observable<any>{
    return this.http.get( this.domain + '/webservice/getCountryStores/'+countryName)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getPrefreces(): Observable<any>{
    return this.http.get( this.domain + '/webservice/getPrefrences/')
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }
  
  getUserPrefreces(userId): Observable<any>{
    return this.http.get( this.domain + '/webservice/getUserPrefreces/'+userId)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }
  
  registerUser(userInfo): Observable<any>{   
    let data = userInfo;
    return this.http.post( this.domain + '/webservice/signUp', data)
                    .map((res: Response) => res.json())
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
                
  }

  getFav(type, userId): Observable<any>{

    return this.http.get( this.domain + '/webservice/getFav/'+ type + '/' + userId)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  
  setSelectedFavItemData(data){
    this.selectedFavItemData = data;
  }

  getSelectedFavItemData(): Observable<any>{
    return this.selectedFavItemData;
  }


  getformattedFavData(favData, menuCountry): Observable<any>{
  if(menuCountry == null) {
      menuCountry = 'UK';
    }
      var data = { menuCountry: menuCountry, favData: favData };
      return this.http.post( this.domain + '/webservice/getFavItemData', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  applyCoupon(orderData): Observable<any>{
        return this.http.post( this.domain + '/webservice/applyCoupon', orderData)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getFavOrderData(orderData, menuCountry): Observable<any>{
  if(menuCountry == null) {
      menuCountry = 'UK';
    }
        var data = { menuCountry: menuCountry, orderData: orderData };
        return this.http.post( this.domain + '/webservice/getFavOrderData', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }
                
  getReOrderData(orderData, menuCountry): Observable<any>{
  if(menuCountry == null) {
      menuCountry = 'UK';
    }
        var data = { menuCountry: menuCountry, orderData: orderData };
        return this.http.post( this.domain + '/webservice/getReOrderData', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getProfile(userId): Observable<any>{

    return this.http.get( this.domain + '/webservice/getProfile/'+ userId)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  updateProfile(userData): Observable<any>{
        var data = userData;
        return this.http.post( this.domain + '/webservice/updateProfile', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 
  
   updatePrefrence(userData): Observable<any>{
        var data = userData;
        return this.http.post( this.domain + '/webservice/updatePrefrence', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 

  getOrderHistory(userId): Observable<any>{
    return this.http.get( this.domain + '/webservice/getOrderHistory/'+ userId)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  addAddress(userData): Observable<any>{
        var data = userData;
        return this.http.post( this.domain + '/webservice/addAddress', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 

  editAddress(userData): Observable<any>{
        var data = userData;
        return this.http.post( this.domain + '/webservice/editAddress', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 
                

  deleteAddress(userData): Observable<any>{
        var data = userData;
        return this.http.post( this.domain + '/webservice/deleteAddress', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 
  
   setAsDefault(userData): Observable<any>{
        var data = userData;
        return this.http.post( this.domain + '/webservice/setAsDefault', data)
                  .map((res: Response) => res.json())
                  .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 

   getPageInfo(pageId): Observable<any>{
        return this.http.get( this.domain + '/webservice/getPageInfo/'+ pageId)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );

  } 

  getCountries(): Observable<any>{
        return this.http.get( this.domain + '/webservice/get_countries/')
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );

  } 

  forgotPassword(userData): Observable<any>{
    var data = userData;
    return this.http.post( this.domain + '/webservice/forgot_password', data)
              .map((res: Response) => res.json())
              .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  } 

  resetPassword(userData): Observable<any>{
    var data = userData;
    return this.http.post( this.domain + '/webservice/reset_password', data)
              .map((res: Response) => res.json())
              .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }  

  getItemSuggestions(addedCategories): Observable<any>{
    var data = addedCategories;
    return this.http.post( this.domain + '/webservice/getItemSuggestions', data)
              .map((res: Response) => res.json())
              .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  sendPaymentData(cardDetails): Observable<any>{
    var data = cardDetails;
    return this.http.post( this.domain + '/webservice/sendPaymentData', data)
              .map((res: Response) => res.json())
              .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  getDealData(dealId): Observable<any>{

    return this.http.get( this.domain + '/webservice/getDealData/' + dealId)
                      .map( (res: Response) => res.json() )
                        .catch( (error: any) => Observable.throw(error.json().error || 'server error') );

  }

  isValidPostalCode(code) {
    let validCodes = [
      'EH39',
      'EH91',
      'EH92',
      'EH93',
      'EH104',
      'EH105',
      'EH106',
      'EH111',
      'EH130',
      'EH139',
      'EH141',
      '110074'
    ];
    let flag = false;

    if (code.length > 3 && code.charAt(2) == '9') { 

      if (code.charAt(3) == '1' || code.charAt(3) == '2' || code.charAt(3) == '3') {
        flag = true;
      }
      
    } else if (code.length >= 3 && code.charAt(2) == '3' && code.charAt(0) == 'E' && code.charAt(3) == '9'){
      flag = true;
    } else {
      
      if (code.length > 4) {
        code = code.slice(0,4);
      }

      validCodes.forEach(function(a){
        
        if (a.indexOf(code) > -1) {
          flag = true;
        } 
      });
    }

    return flag;   
  }


  getDealTypeData(id) {
    let allDealsData = JSON.parse(this.getLocalStorageData('allDealsData'));
    if (allDealsData != null) {
      for (var i=0; i<allDealsData.length; i++) {
          if (allDealsData[i]['id'] == id) {
            return allDealsData[i];
          }
       }
    }

    ////console.log('id', id);
    // return this.http.get( this.domain + '/webservice/getDealItemList/'+id)
    // .map( (res: Response) => res.json() )
    // .catch( (error: any) => Observable.throw(error.json().error || 'server error') );

  }
  
  getAllDeals() {
    
    return this.http.get( this.domain + '/webservice/getDealItemList')
    .map( (res: Response) => res.json() )
    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
    
  }

  setAllDealsData(data) {
    this.setLocalStorageData('allDealsData', JSON.stringify(data));
  }
  
  formatCartData(allItems, page) {
	  
	  let deals = {};
	  let otherItems = [];
	  
	  //separate deal and other items
	  for (var i=0; i<allItems.length; i++) {
      
		  if (allItems[i].Product.dealId != undefined) {
			  if (deals[allItems[i].Product.comboUniqueId] == undefined) {
				  deals[allItems[i].Product.comboUniqueId] = [];
			  }
			  deals[allItems[i].Product.comboUniqueId].push(allItems[i]);
		  } else {
			  otherItems.push(allItems[i]);
		  }
	  }
	  ////console.log('ch', deals, otherItems, page);
	  let totPrice = 0;
	  let dealsArr = [];
    
    if (Object.keys(deals).length > 0) {

        //validate deal items
        for (var key in deals) {
          if (deals.hasOwnProperty(key)) {

              let dId = deals[key][0].Product.dealId;
              //console.log(dId);
              //TODO: Optimise this dirty code
              //dId = +dId;
              ////console.log('did=', dId, typeof dId);
              if (isNaN(dId)) {
                //console.log('before did', dId);
               // dId = this.getDealIdFromCode(dId).subscribe(data => {
                 dId = this.getDealIdFromCode(dId);
                 //console.log('did', dId, deals);
                  let valid = this.validateDealItems(deals[key], dId, deals[key][0].Product.comboUniqueId);
                   
                    if (!valid) {
                      for (var i=0; i<deals[key].length; i++) {
                        let dObj = deals[key][i];
                        if (page != 'deal') {
                          delete dObj.dealPrice;
                          delete dObj.Product.dealId;
                          delete dObj.Product.comboUniqueId;
                          delete dObj.Product.position;
                        }
                        
                        otherItems.push(dObj);
                      }
                      
                      delete deals[key];
                    } else {
                      totPrice += deals[key][0].dealPrice;
                      
                      let titleText = this.getDealTitle(dId);
                        let dealObject = {
                          title: titleText,
                          totalCostPrice: Number(totPrice.toFixed(2)),
                          dealData: deals[key]
                        }
                        
                        dealsArr.push(dealObject);
                      //})
                      
                    }


                    let otherItemsPrice = Number(this.utilService.calculateOverAllCost(otherItems).toFixed(2));
                    let returnObj = {
                      deals: dealsArr,
                      otherItems: otherItems,
                      totalPrice: Number((totPrice + otherItemsPrice).toFixed(2))
                    }

                    return returnObj;

                  //});
                  
                //});
              } else {
                  
                  let valid = this.validateDealItems(deals[key], dId, deals[key][0].Product.comboUniqueId);
                  
                    ////console.log(465, valid);
                    if (!valid) {
                      for (var i=0; i<deals[key].length; i++) {
                        let dObj = deals[key][i];
                        if (page != 'deal') {
                          delete dObj.dealPrice;
                          delete dObj.Product.dealId;
                          delete dObj.Product.comboUniqueId;
                          delete dObj.Product.position;
                        }
                        
                        otherItems.push(dObj);
                      }
                      
                      delete deals[key];
                    } else {
                      totPrice += deals[key][0].dealPrice;
                      ////console.log('totprice', totPrice);
                      let titleText = this.getDealTitle(dId);
                        let dealObject = {
                          title: titleText,
                          totalCostPrice: Number(totPrice.toFixed(2)),
                          dealData: deals[key]
                        }
                        
                        dealsArr.push(dealObject);
                      //})
                      
                    }

                    let otherItemsPrice = Number(this.utilService.calculateOverAllCost(otherItems).toFixed(2));
                    let returnObj = {
                      deals: dealsArr,
                      otherItems: otherItems,
                      totalPrice: Number((totPrice + otherItemsPrice).toFixed(2))
                    }

                    return returnObj;

                   

                  //});
                  
              }

          
          }
          
          
        }

    } else {
      let otherItemsPrice = Number(this.utilService.calculateOverAllCost(otherItems).toFixed(2));
      
      let returnObj = {
        deals: dealsArr,
        otherItems: otherItems,
        totalPrice: Number((totPrice + otherItemsPrice).toFixed(2))
      }

      return returnObj;
     
    }

	  
	  
	  
    
	  //return returnObj;
	  
	  
  }
  
  
	validateDealItems(allItems, dealCode, comboUniqueId) {
		  let type = dealCode;
		
      //this.getDealTypeData(type).subscribe(dealData => {
        let dealData = this.getDealTypeData(type);
        //console.log('deeldata', dealData, comboUniqueId, type);
        //dealData = dealData[0];
        //console.log('dealData', dealData);
        let categoriesArr = dealData['categories'];
        let keepCats = [];      //cats for which products added
        let atLeastoneEnable = false;
        let isExistArr = [];
           
  
        let count = 0;
        for (var i=0; i<categoriesArr.length; i++) {
          
          for (var j=0; j<allItems.length; j++) {
            
            if (allItems[j].Product.dealId != undefined) {
              
              
              ////console.log('ct', allItems[j].Product.position, categoriesArr[i].pos, allItems[j].Product.comboUniqueId);
              if (allItems[j].Product.position == +categoriesArr[i].pos && allItems[j].Product.comboUniqueId == comboUniqueId) {
                ////console.log('ct-count: ', count);
                count++;
              }
              
              
              let itemCatId = allItems[j].Product.category_id;
              
              if (categoriesArr[i].qty == count && allItems[j].Product.comboUniqueId == comboUniqueId) {         
                keepCats.push(categoriesArr[i].pos);
                count = 0;
              }
              
            }
          }
        }
        
        for (var i=0; i<categoriesArr.length; i++) {
          ////console.log('keepcats', keepCats, 'pos: ', categoriesArr[i].pos);
          if (keepCats.indexOf(categoriesArr[i].pos.toString()) < 0) {
            categoriesArr[i].isEnable = true;
          } else {
            categoriesArr[i].isEnable = false;
          }
        }
        ////console.log('catArr: ', categoriesArr);
        for(var i=0; i<categoriesArr.length; i++) {
          if (categoriesArr[i].isEnable) {
            
            atLeastoneEnable = true;
            break;
          }
        }

        let resp = false;
        ////console.log('atleasr', atLeastoneEnable);
        if (!atLeastoneEnable) {
          resp = true;
        }         
        

        return resp;
        
      //});
      
		  
	}
	
	
	getDealTitle(dealCode) {
		let type = dealCode;
		
    //let deal = this.getDealTypeData(type).subscribe(data => {
      let deal = this.getDealTypeData(type);
      //deal = data[0];
      ////console.log('deal-title', deal['title']);
      return deal['title'];
     
    //});
    
  }
  
  getDealCode(dealId) {
	  let type = dealId;
	

    let deal = this.getDealTypeData(type);
    return deal['code'];
  }
  
  getDealIdFromCode(code) {

    let dealData = JSON.parse(this.getLocalStorageData('allDealsData'));

    if (dealData != null) {
      for (var i=0; i<dealData.length; i++) {
        if (dealData[i]['code'] == code) {
          return dealData[i]['id'];
        }
      }
    }
    

    // return this.http.get( this.domain + '/webservice/getDealIdFromCode/'+code)
    // .map( (res: Response) => res.json() )
    // .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
    

    // if (code == 'CPLNIGHT') {
    //   return 1;
    // } else if (code == 'DOUBLEUP7') {
    //   return 5;
    // } else if(code == 'LRGNIGHT') {
    //   return 3;
    // } else if(code == 'SKINNYIT') {
    //   return 4;
    // } else if (code == 'KIDSMEAL') {
    //   return 2;
    // } else if (code == 'MEDNIGHT') {
    //   return 6;
    // } else if (code == 'BITSIDE') {
    //   return 7;
    // } else if (code == 'PIZZA1299') {
    //   return 8;
    // }
  }
  

  getVoucherBalance(code) {
      return this.http.get( this.domain + '/webservice/getVoucherBalance/'+code)
      .map( (res: Response) => res.json() )
      .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }

  
	clearCart(): Observable<any> {
		this.setLocalStorageData('allItems', null);
		this.setLocalStorageData('order-now', null);
		this.setLocalStorageData('finalOrder', null);
		this.setLocalStorageData('favItemFetched', null);
		this.setLocalStorageData('favOrdersFetched', null); 
		this.setLocalStorageData('confirmationItems', null); 
		this.setLocalStorageData('confirmationFinalOrder', null);
		return;
	}

}


