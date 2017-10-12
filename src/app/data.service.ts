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

  
  getSlides(lang_id): Observable<any>{

    return this.http.get( this.domain + '/webservice/get_slides/'+lang_id)
                    .map( (res: Response) => res.json() )
                    .catch( (error: any) => Observable.throw(error.json().error || 'server error') );
  }
  
  getMenuData(storeId, country): Observable<any>{

    return this.http.get( this.domain + '/temp/get_all_categories_data/'+storeId+ '/'+country)
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
    return this.http.post( this.domain + '/temp/placeOrder', data)
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
        return this.http.post( this.domain + '/temp/applyCoupon', orderData)
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
    return this.http.post( this.domain + '/temp/getItemSuggestions', data)
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

    return this.http.get( this.domain + '/temp/getDealData/' + dealId)
                      .map( (res: Response) => res.json() )
                        .catch( (error: any) => Observable.throw(error.json().error || 'server error') );

  }

  isValidPostalCode(code) {
    let validCodes = [
      'EH91',
      'EH92',
      'EH93',
      'EH104',
      'EH105',
      'EH106',
      'EH111',
      'EH130',
      'EH139',
      'EH141'
    ];
    let flag = false;

    if (code.length > 3 && code.charAt(2) == '9') { 

      if (code.charAt(3) == '1' || code.charAt(3) == '2' || code.charAt(3) == '3') {
        flag = true;
      }
      
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
    
    if (id == 1) {
      let deal = {
        id: 1,
        title: 'Couples Night In - Feed two for £11 each',
        imageText: 'Couples Night In',
        description: 'Any Large pizza, sweet potato waffle fries or chicken wings, and a pesto focaccia and two dips for £22.00',
        code: 'CPLNIGHT',
        overallPrice: '22.00',
        listImage: 'assets/images/deals/couples-night-list.jpg',
        detailImage: 'assets/images/deals/couples-night-detail.jpg',
        categories: [
          {
            id: 1,
            qty: 1,
            isEnable: true,
            name: 'pizza',
            slug: 'pizzas',
            catText: 'Select any large pizza',
            products: [],
            modifiers: [{ modifierId: 1, modOptionPlu: 999993 }],
            itemCount: 1,
            itemCondition: null,
            pos: 0
          },
          {
            id: 3,
            qty: 1,
            isEnable: true,
            name: 'sides & salads',
            slug: 'sides&salads',
            catText: 'Add sweet potato waffle fries or chicken wings',
            products: ['15','11','12'],
            modifiers: [],
            itemCount: 1,
            itemCondition: 'OR',
            pos: 1
          },
          {
            id: 3,
            qty: 1,
            isEnable: true,
            name: 'sides & salads',
            slug: 'sides&salads',
            catText: 'Add pesto focaccia',
            products: ['14'],
            modifiers: [],
            itemCount: 1,
            itemCondition: null,
            pos: 2
          },
          {
            id: 3,
            qty: 2,
            isEnable: true,
            name: 'sides & salads',
            slug: 'sides&salads',
            catText: 'Add 2 dips',
            products: ['18'],
            modifiers: [],
            itemCount: 1,
            itemCondition: null,
            pos: 3
          }
        ]
      }

      return deal;
    
	} else if (id == 2) {
			
      let deal = {
        id: 2,
        title: 'Double up for £7',
        imageText: 'Double up for £7',
        description: 'Buy any medium or large pizza and get a second for just £7.00',
        code: 'DOUBLEUP7',
        overallPrice: '',
        listImage: 'assets/images/deals/double-up-list.jpg',
        detailImage: 'assets/images/deals/double-up-detail.jpg',
        categories: [
          {
            id: 1,
            qty: 1,
            isEnable: true,
            name: 'pizza',
            slug: 'pizzas',
            catText: 'Select any medium or large pizza',
            products: [],
            modifiers: [
                { modifierId: 1, modOptionPlu: '999992' },
                { modifierId: 1, modOptionPlu: '999993' }
              ],
            itemCount: 1,
            itemCondition: null,
            pos: 0
          },
          {
            id: 1,
            qty: 1,
            isEnable: true,
            name: 'pizza',
            slug: 'pizzas',
            catText: 'Select second pizza',
            products: [],
            modifiers: [
                { modifierId: 1, modOptionPlu: '999992' },
                { modifierId: 1, modOptionPlu: '999993' }
              ],
            itemCount: 1,
            itemCondition: null,
            pos: 1
          }
        ]
      }
	
		return deal;
			
	} else if (id == 3) {
		
      let deal = {
        id: 3,
        title: 'Large Night In - Feed four for £9 each',
        imageText: 'Large Night In',
        description: 'Two Large pizzas, two sides of your choice, and two dips for £36.00',
        code: 'LRGNIGHT',
        overallPrice: '36.00',
        listImage: 'assets/images/deals/large-night-list.jpg',
        detailImage: 'assets/images/deals/large-night-detail.jpg',
        categories: [
          {
            id: 1,
            qty: 2,
            isEnable: true,
            name: 'pizza',
            slug: 'pizzas',
            catText: 'Select two large pizza',
            products: [],
            modifiers: [{ modifierId: 1, modOptionPlu: '999993' }],
            itemCount: 1,
            itemCondition: null,
            pos: 0
          },
          {
            id: 3,
            qty: 2,
            isEnable: true,
            name: 'sides & salads',
            slug: 'sides&salads',
            catText: 'Select two sides',
            products: ['11','12','13','14','15'],
            modifiers: [],
            itemCount: 1,
            itemCondition: 'OR',
            pos: 1
          },
          {
            id: 3,
            qty: 2,
            isEnable: true,
            name: 'sides & salads',
            slug: 'sides&salads',
            catText: 'Add 2 dips',
            products: ['18'],
            modifiers: [],
            itemCount: 1,
            itemCondition: null,
            pos: 2
          }
        ]
      }

      return deal;
    
	} else if (id == 4) {
		
		let deal = {
        id: 4,
        title: 'Keep it skinny!',
        imageText: 'Keep it skinny!',
        description: 'Get a Caprese salad for £1 when you buy any medium skinny pizza',
        code: 'SKINNYIT',
        overallPrice: '',
        listImage: 'assets/images/deals/keep-it-skinny-list.jpg',
        detailImage: 'assets/images/deals/keep-it-skinny-detail.jpg',
        categories: [
          {
            id: 1,
            qty: 1,
            isEnable: true,
            name: 'pizza',
            slug: 'pizzas',
            catText: 'Select any medium skinny pizza',
            products: [],
            modifiers: [
                { modifierId: 1, modOptionPlu: '999992' },
                { modifierId: 2, modOptionPlu: 'I101' }
              ],
            itemCount: 1,
            itemCondition: null,
            pos: 0
          },
          {
            id: 3,
            qty: 1,
            isEnable: true,
            name: 'sides & salads',
            slug: 'sides&salads',
            catText: 'Select Caprese Salad',
            products: ['16'],
            modifiers: [],
            itemCount: 1,
            itemCondition: null,
            pos: 1
          }
        ]
      }
	
		return deal;
		
		
	} else if (id == 5) {
		
		let deal = {
			id: 5,
			title: "NKD kid's meal for £5.99",
			imageText: "NKD kid's meal",
			description: "Get a child's cheese & Tomato or Pepperoni, a pot of Jude's ice cream and a drink of your choice for £5.99 when you buy any medium or large size pizza",
			code: 'KIDSMEAL',
			overallPrice: '5.99',
			listImage: 'assets/images/deals/kids-meal-list.jpg',
			detailImage: 'assets/images/deals/kids-meal-detail.jpg',
			categories: [
			  {
				id: 1,
				qty: 1,
				isEnable: true,
				name: 'pizza',
				slug: 'pizzas',
				catText: 'Select any medium or large pizza',
				products: [],
				modifiers: [
					{ modifierId: 1, modOptionPlu: 999992 },
					{ modifierId: 1, modOptionPlu: 999993 }
				],
				itemCount: 1,
				itemCondition: null,
				pos: 0
			  },
			  {
				id: 8,
				qty: 1,
				isEnable: true,
				name: 'kids pizza',
				slug: 'kids pizza',
				catText: 'Select one kids pizza',
				products: [],
				modifiers: [],
				itemCount: 1,
				itemCondition: 'OR',
				pos: 1
			  },
			  {
				id: 4,
				qty: 1,
				isEnable: true,
				name: 'desserts',
				slug: 'desserts',
				catText: 'Select one ice cream',
				products: ['19','20','21','22'],
				modifiers: [],
				itemCount: 1,
				itemCondition: null,
				pos: 2
			  },
			  {
				id: 5,
				qty: 1,
				isEnable: true,
				name: 'beverages',
				slug: 'beverages',
				catText: 'select any drink',
				products: ['29','30','31'],
				modifiers: [],
				itemCount: 1,
				itemCondition: null,
				pos: 3
			  }
			]
		  }

      return deal;
    
		
	}


  }
  
  getAllDeals() {
	  let dealLength = 5;
	  let dealArr = [];
	  for (var i=1; i<=dealLength; i++) {
		  let deal = this.getDealTypeData(i);
		  dealArr.push(deal);
	  }
	  
	  return dealArr;
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
	  
	  let totPrice = 0;
	  let dealsArr = [];
	  
	  //validate deal items
	  for (var key in deals) {
		if (deals.hasOwnProperty(key)) {

      let dId = deals[key][0].Product.dealId;
      if (isNaN(dId)) {
        dId = this.getDealIdFromCode(dId);
      }

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
        

				let dealObject = {
					title: this.getDealTitle(dId),
					totalCostPrice: Number(totPrice.toFixed(2)),
					dealData: deals[key]
				}
				
				dealsArr.push(dealObject);
			}
			
		}
	  }
	  
	  
	  	  
	  let otherItemsPrice = Number(this.utilService.calculateOverAllCost(otherItems).toFixed(2));
	  let returnObj = {
		  deals: dealsArr,
		  otherItems: otherItems,
		  totalPrice: Number((totPrice + otherItemsPrice).toFixed(2))
	  }
	  
	  console.log('return obj', returnObj);
	  return returnObj;
	  
	  
  }
  
  
	validateDealItems(allItems, dealCode, comboUniqueId) {
		let type = dealCode;
		
		
		  let dealData = this.getDealTypeData(type);
		  let categoriesArr = dealData.categories;
		  let keepCats = [];      //cats for which products added
		  let atLeastoneEnable = false;
		  let isExistArr = [];
			   

		  let count = 0;
      for (var i=0; i<categoriesArr.length; i++) {
        
        for (var j=0; j<allItems.length; j++) {
          if (allItems[j].Product.dealId != undefined) {
            
            
            
            if (allItems[j].Product.position == categoriesArr[i].pos && allItems[j].Product.comboUniqueId == comboUniqueId) {
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
      
      console.log('keepCats', keepCats);
      
  
        for (var i=0; i<categoriesArr.length; i++) {
          
          if (keepCats.indexOf(categoriesArr[i].pos) < 0) {
            categoriesArr[i].isEnable = true;
          } else {
            categoriesArr[i].isEnable = false;
          }
        }
  
        for(var i=0; i<categoriesArr.length; i++) {
          if (categoriesArr[i].isEnable) {
            
            atLeastoneEnable = true;
            break;
          }
        }
		  
		  if (atLeastoneEnable) {
			  return false;
		  } else {
			  return true;
		  }
		  
	}
	
	
	getDealTitle(dealCode) {
		let type = dealCode;
		
		let deal = this.getDealTypeData(type);
		return deal.title;
  }
  
  getDealCode(dealId) {
		let type = dealId;
		
		let deal = this.getDealTypeData(type);
		return deal.code;
  }
  
  getDealIdFromCode(code) {
    if (code == 'CPLNIGHT') {
      return 1;
    } else if (code == 'DOUBLEUP7') {
      return 2;
    } else if(code == 'LRGNIGHT') {
      return 3;
    } else if(code == 'SKINNYIT') {
      return 4;
    } else if (code == 'KIDSMEAL') {
		return 5;
	}
  }


}


