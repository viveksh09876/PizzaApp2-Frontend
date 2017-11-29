import { Component, OnInit } from '@angular/core';
import { PipeTransform, Pipe } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { OrdernowmodalComponent } from '../ordernowmodal/ordernowmodal.component';
import { SuggestionmodalComponent } from '../suggestionmodal/suggestionmodal.component';
import { MessageComponent } from '../message/message.component';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';

declare var jQuery: any;


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit {

  constructor(private dialogService:DialogService,
              private dataService: DataService, 
                private utilService: UtilService, 
                     private route: ActivatedRoute, 
                        private router: Router) { }

  menuData = null;
  categories: Array<any>;
  subcategories: Array<any>;
  items = [];
  itemsQtyBeforeCart={};
  orderNowDetails=null;
  totalCost = 0;
  netCost = 0;
  showViewCart = false;
  showFooter = true;
  cmsApiPath = environment.cmsApiPath;
  currencyCode = null;
  selectedMenuCat = null;
  addedCategories = [];
  suggestionProducts = [];
  formattedItems = null;
  nutritionInfo={};
  item=null;// this is for calculation function only 


  ngOnInit() {
    this.dataService.setLocalStorageData('favItemFetched', null);
    this.dataService.setLocalStorageData('favOrdersFetched', null); 
    this.dataService.setLocalStorageData('confirmationItems', null); 
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);

    this.currencyCode = this.utilService.currencyCode;
    this.getAllCategories(() => {
      this.getCartItems();        
    });
    this.orderNowDetails = JSON.parse(this.dataService.getLocalStorageData('order-now')); 
    if(this.orderNowDetails == null || this.orderNowDetails == 'null') {
      //this.updateStoreAndTime();
     }
    
    
    
  }


  getCartItems() {
    let items = this.dataService.getLocalStorageData('allItems');
    let orderNowDetails = this.dataService.getLocalStorageData('order-now'); 
    if((items != null && items != 'null') || (orderNowDetails != null && orderNowDetails != 'null')) {
      
      if(items != 'null' && items != null) {
        this.items = JSON.parse(items);
        //console.log('deals', JSON.parse(this.dataService.getLocalStorageData('allDealsData')));
		    let formattedItemsData = this.dataService.formatCartData(this.items, 'menu');
            this.formattedItems = formattedItemsData;
           // console.log('formatted', this.formattedItems);
            //let getTCost = Number(this.utilService.calculateOverAllCost(this.items).toFixed(2));
            this.totalCost =  formattedItemsData.totalPrice;
            
            this.netCost = this.totalCost;
        
            if (isNaN(this.netCost)) {
              this.netCost = 0;
            }

            this.showViewCart = true;  
             
        //});

      }      
      
    }
  }


  loadAddedCategories() {
    let items = this.items;
    let catsArr = [];
    for (var i=0; i<items.length; i++) {
      if (catsArr.indexOf(items[i].Product.category_id) < 0 && items[i].Product.dealId == undefined) {
        catsArr.push(items[i].Product.category_id);
      }
    }
    
    this.addedCategories = catsArr;
    return catsArr;
    //this.prepareSuggestions(this.addedCategories);
  }



  getAllCategories(callback){

      let storeId = 1;
      let menuCountry = 'UK';
      if(this.dataService.getLocalStorageData('nearByStore') != undefined && 
            this.dataService.getLocalStorageData('nearByStore') != '') { 

          let nearByStoreId = this.dataService.getLocalStorageData('nearByStore'); 
          menuCountry = this.dataService.getLocalStorageData('menuCountry');
      }

      this.dataService.getMenuData(storeId, menuCountry)
            .subscribe(data => {
                        
          this.menuData = data;
          ////console.log(this.menuData[0].name);
          this.selectedMenuCat = this.menuData[0].name;  

          this.route.params.subscribe(params => { 
            if(params['slug'] && params['slug']!= '') {
              this.selectedMenuCat = params['slug'];
              this.dataService.setLocalStorageData('selectedMenuCat', this.selectedMenuCat);
            }
          });    
          
          this.dataService.getAllDeals().subscribe(data => {
            this.dataService.setAllDealsData(data);
            for (var i=0; i<this.menuData.length; i++) {
              if (this.menuData[i].type == 'deal') {
                  this.menuData[i].products = data;
              }
            }
            
            callback();
          });
     }); 

      
  }


  goToCustomize(slug, modCount,cType,modifer_selected) {

    // this.dialogService.addDialog(MessageComponent, { title: 'block', message: 'In Store pickup only. Online ordering will be active from October 2nd onwards.', buttonText: 'OK', doReload: false }, { closeByClickingOutside:true }); 
    

    let orderNow = this.dataService.getLocalStorageData('order-now');
    let menuCountry = this.dataService.getLocalStorageData('menuCountry');

    let fromObj = {
      modCount: modCount,
      slug: slug,
      menuCountry: menuCountry,
      selectedMenuCat: this.selectedMenuCat
    }

    if (orderNow == undefined || orderNow == null || orderNow == 'null') {
      //open order-now modal
      this.dialogService.addDialog(OrdernowmodalComponent, { fromObj: fromObj }, { closeByClickingOutside:true }).subscribe((isReloadCart)=>{ 
        if (isReloadCart) {
          this.getCartItems();
        }
      }); 

      

    } else {
      if (modCount > 0) { 
        if(cType){
         this.addToCartCustomizeItem(slug,menuCountry,cType,modifer_selected);
        }else{
        //navigate to customize page
        this.router.navigate(['/item', slug]);      
        }  
      } else {
         //add product to cart without page refresh
         
         this.dataService.getItemData(slug, menuCountry)
          .subscribe(data => {
                data.originalItemCost = data.Product.price;
                data.totalItemCost = data.Product.price;
                // code for add qty  
                if(this.itemsQtyBeforeCart['qty_'+data.Product.plu_code]){
                   data.Product.qty = this.itemsQtyBeforeCart['qty_'+data.Product.plu_code];
                   data.totalItemCost = parseFloat(data.Product.price)*data.Product.qty;
                   this.itemsQtyBeforeCart['qty_'+data.Product.plu_code]=1;
                }
                /// end 
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
                      allItems[i].Product.qty += data.Product.qty;
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

                this.getCartItems();
            
          });
      }
    }
   this.orderNowDetails = JSON.parse(this.dataService.getLocalStorageData('order-now')); 
  }


  updateQuantity(type, plu, index) {

    let total = 0;

    for(var i=0; i<this.items.length; i++) {
      if(this.items[i].Product.plu_code == plu && i == index) {

          //increase
          if(type == 1) {
            this.items[i].Product.qty += 1;      
          }else{
           
            this.items[i].Product.qty = this.items[i].Product.qty - 1;
            if(this.items[i].Product.qty <= 0) {
              this.items[i].Product.qty = 1;
            }
          }

          let getOICost = Number(parseFloat(this.items[i].originalItemCost).toFixed(2));
          total =  getOICost*this.items[i].Product.qty;
          this.items[i].totalItemCost = total;

          break;
      }
    }

    let formattedItemsData = this.dataService.formatCartData(this.items, 'menu');
      this.formattedItems = formattedItemsData;
      this.totalCost =  formattedItemsData.totalPrice;
      this.netCost = this.totalCost;
    //});    
    
  }


  updateQuantityBeforeCart(type, plu_code) {
       var qty_key='qty_'+plu_code; 
       if(!this.itemsQtyBeforeCart[qty_key]){
              this.itemsQtyBeforeCart[qty_key]=1;
          }
       if(type == 1) {
            this.itemsQtyBeforeCart[qty_key] += 1;    
          }else{
            this.itemsQtyBeforeCart[qty_key] = this.itemsQtyBeforeCart[qty_key] - 1;
            if(this.itemsQtyBeforeCart[qty_key] <= 0) {
              this.itemsQtyBeforeCart[qty_key] = 1;
            }
       }
      //this.dataService.setLocalStorageData('itemsQtyBeforeCart',  JSON.stringify(this.itemsQtyBeforeCart));
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
            
            let formattedItemsData = this.dataService.formatCartData(this.items, 'menu');
              this.formattedItems = formattedItemsData;
              this.totalCost =  formattedItemsData.totalPrice;
              this.netCost = this.totalCost;
            //});    
            

          }else{
            this.items = [];
            this.dataService.setLocalStorageData('allItems', 'null');
            alert('No items remaining in your cart!');
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
        let formattedItemsData = this.dataService.formatCartData(this.items, 'menu');
          this.formattedItems = formattedItemsData;
          this.totalCost =  formattedItemsData.totalPrice;
          this.netCost = this.totalCost;
        //});    
        
      } else {
        this.items = [];
        this.dataService.setLocalStorageData('allItems', 'null');
        alert('No items remaining in your cart!');
      }
    }

  }


  editItem(index, prod) {
      this.router.navigate(['/item/edit', index]);
  }

  changTab(val) {
    this.router.navigate(['/menu', val]);
  }

  checkout() {    
    //this.goToCustomize('','');
    
    let orderNowDetails = JSON.parse(this.dataService.getLocalStorageData('order-now')); 
    
    if (orderNowDetails == null || orderNowDetails == 'null' || orderNowDetails == undefined) {

      this.dialogService.addDialog(OrdernowmodalComponent, { }, { closeByClickingOutside:true }).subscribe((isReloadCart)=>{ 
        if (isReloadCart) {
          this.getCartItems();
        }
      }); 


    } else {
      let goFlag = this.getSuggestions();
              //let goFlag = true;
              if (goFlag) {
                if (this.items.length > 0) {
                  
                    let minOrderFlag = true;
                    if (orderNowDetails.type == 'delivery' && this.totalCost < 12.99) {
                      minOrderFlag = false;
                    }
            
                    if (minOrderFlag) {
                      this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));    
                      this.dataService.setLocalStorageData('totalCost', this.totalCost); 
                      this.router.navigate(['/order-review']);
                    } else {
                      this.dialogService.addDialog(MessageComponent, { title: 'Alert', message: 'Minimum order should be ' + this.currencyCode + '12.99', buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true });
                    }
                  

                  
                } else {
                  this.dialogService.addDialog(MessageComponent, { title: 'Alert', message: 'No Items in cart. Please add atleast 1 item in cart to proceed.', buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true }); 
                  
                }      
              }  
            }   
  }


  getSuggestions() {
    let addedCats = this.loadAddedCategories();
    if (addedCats.length > 3) {
      return true;
    } else {
      let suggestionProducts = this.prepareSuggestions(addedCats, [], []);
      
        if (suggestionProducts == true) {
          return true;
        }
    }
  }


  prepareSuggestions(addedCategories, prodArr, addedProducts) {
    let menuItems = this.menuData;
    let products = prodArr;
    let myCats = [];
    

    if (menuItems != null) {
      //get categories which are not added
      for (var i=0; i<menuItems.length; i++) {
        if (menuItems[i].type != 'deal' && addedCategories.indexOf(menuItems[i].id) < 0) {
          myCats.push(menuItems[i].id);
        }
      }
      
      for (var i=0; i<myCats.length; i++) {
        if (products.length < 4) {
          let item = this.getProductFromCat(myCats[i]);
          if (item != undefined && addedProducts.indexOf(item.id) < 0) {
            products.push(item);
            addedProducts.push(item.id);
          }          
        }
      }

      this.suggestionProducts = products;

      if (this.suggestionProducts.length < 4) {
        this.prepareSuggestions(addedCategories, products, addedProducts);
      } else {
        
        let orderNowDetails = this.dataService.getLocalStorageData('order-now'); 
        if (orderNowDetails != null && orderNowDetails != undefined && orderNowDetails != '') {
          orderNowDetails = JSON.parse(orderNowDetails);
    
          //////console.log('suggestions', this.suggestionProducts);
        let dservice = this.dialogService.addDialog(SuggestionmodalComponent, { 
                items: products }, { closeByClickingOutside:true 
            }).subscribe((isSkipped)=>{
              //We get dialog result
              if(isSkipped) {
                this.router.navigate(['/order-review']);
              }
          }); 
        } else {
          return true;
        }

      }
      
    }
    
  }


  getProductFromCat(catId) {
    let menuItems = this.menuData;
    for (var i=0; i<menuItems.length; i++) {
      if (menuItems[i].id ==  catId) {

        //for pizza we get items from subcategories 
        if (menuItems[i].subCatsName.length > 0) {
          var tmpList = Object.keys(menuItems[i].subCats);
          var randomPropertyName = tmpList[ Math.floor(Math.random()*tmpList.length) ];
          var itemArr = menuItems[i].subCats[randomPropertyName];
          let item = itemArr[Math.floor(Math.random()*itemArr.length)]; 
          item.products[0].qty = 0;
          return item.products[0];

        } else {

          let itemArr = menuItems[i].products;
          let item = itemArr[Math.floor(Math.random()*itemArr.length)]; 
          if (item != undefined) {
            item['qty'] = 0;
            return item;
          }
          
        
        }
      }
    }
  }


  goToDeal(dealId) {
	let comboUniqueId = this.utilService.generateUniqueId();   
    this.router.navigate(['/deals', dealId, comboUniqueId]);
  }
  
  clearCart() {
	  this.dataService.clearCart();
	  this.items = [];
	  this.showViewCart = false;
	  this.formattedItems.deals = [];
	  this.formattedItems.otherItems = [];
          this.netCost = 0;
  }

  updateStoreAndTime(){
      this.dialogService.addDialog(OrdernowmodalComponent, { }, { closeByClickingOutside:true }).subscribe((data)=>{ 
        if (data) {
                     this.getCartItems();
         }
      this.orderNowDetails = JSON.parse(this.dataService.getLocalStorageData('order-now')); 
      }); 
 
}


  addToCartCustomizeItem(slug,menuCountry,cType,modifer_selected){
    //selected_modifier=selected_modifier?selected_modifier:262;
    console.log(modifer_selected);
    let list=modifer_selected.split('-');
    //these are like a radio for pizza 
    let Pizzalist=['999991','999992','999993','I100','I101','217'];
    console.log(list);
    this.dataService.getItemData(slug, menuCountry)
         .subscribe(data => { 
              // code for set modifier values
               if(data.ProductModifier.length > 0) {
               for(var i = 0; i < data.ProductModifier.length; i++) {
                   var ModifierOption=data.ProductModifier[i]['Modifier']['ModifierOption'];
                   for(var j = 0; j < ModifierOption.length; j++) {
                     if(list.indexOf(ModifierOption[j]['Option']['plu_code']) !== -1){
                       ModifierOption[j]['Option']['is_checked']=true;
                       ModifierOption[j]['Option']['send_code']=1;
                       }else if(cType!='pizza' || Pizzalist.indexOf(ModifierOption[j]['Option']['plu_code']) !== -1){
                       ModifierOption[j]['Option']['is_checked']=false;
                       ModifierOption[j]['Option']['send_code']=0;
                      }
                         
                   } 
                  data.ProductModifier[i]['Modifier']['ModifierOption']=ModifierOption;
                  data.Product.modifer_selected=modifer_selected;
               }
               // update price and qty for cart
               this.item=data;
               let totalPriceOnBasisOfModifier=this.calculateTotalCost();
               data.originalItemCost = totalPriceOnBasisOfModifier;
               data.totalItemCost = totalPriceOnBasisOfModifier;
               // code for add qty  
               if(this.itemsQtyBeforeCart['qty_'+data.Product.plu_code]){
                  data.Product.qty = this.itemsQtyBeforeCart['qty_'+data.Product.plu_code];
                  data.totalItemCost = parseFloat(data.totalItemCost)*data.Product.qty;
                  this.itemsQtyBeforeCart['qty_'+data.Product.plu_code]=1;
               }

               /// end 
               let temp = this.dataService.getLocalStorageData('allItems');
               if(temp == null || temp == 'null') {
                 let allItems = [];
                 allItems.push(data);
                 this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
               }else{
                 let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems')); 
                 let isExist = false;
                 for(var i=0; i<allItems.length; i++) { 
                   // check product id and its modifier is already
                   if(allItems[i].Product.id == data.Product.id && allItems[i].Product.modifer_selected==modifer_selected) {
                     allItems[i].Product.qty += data.Product.qty;
                     this.item=allItems[i];
                     var total=this.calculateTotalCost();// for get pizza and ther iten price 
                     total = total*allItems[i].Product.qty;
                     allItems[i].totalItemCost = Number(total.toFixed(2));
                     isExist = true;
                     break;
                   }
                 }         
                 
                 if(!isExist) {
                   allItems.splice(0,0,data);
                 }
                   
                 this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 

               }

               this.getCartItems();
          } 
         });
       

 }



    updateDefaultValue(z,y,subcategories){
       if(subcategories){
         // this.menuData[z]['subCats']['products'][y]['crust_price_selected']='';
       }else{
         this.menuData[z]['products'][y]['dipping_sauce_data_selected']=262;
       }
       return true;
}


getTotalCost() {
  
      let total = 0;
  
      // if (this.isDeal) {
      //   this.totalCost = Number(parseFloat(this.dealItem.price).toFixed(2));
      //   this.item.originalItemCost = this.totalCost;
      //   this.item.totalItemCost = this.totalCost;
      // } else {
       
        total = this.calculateTotalCost();
        this.totalCost = +total.toFixed(2);
        this.item.originalItemCost = this.totalCost;
        this.item.totalItemCost = this.totalCost;
  return total;
      //}
     
    }

calculateTotalCost() {
  
      let total = 0;
      let defaultSize = 'small';
    
      if(this.item.Product.category_id == 1) {
  
        let itemBasePrice = false;
        let itemSizePrice = '';
        let is_crust_size_price_added = false;
        let priceBinding = false;
        
  
        if(this.item.ProductModifier.length > 0) {
          
          for(var h = 0; h < this.item.ProductModifier.length; h++) {
            let defoptions = this.item.ProductModifier[h].Modifier.ModifierOption;
            
            for(var v = 0; v < defoptions.length; v++) {
              if(defoptions[v].Option.is_checked) {
                if(defoptions[v].Option.plu_code == 999991) {
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
          for(var i = 0; i < this.item.ProductModifier.length; i++) {
            let options = this.item.ProductModifier[i].Modifier.ModifierOption;
  
            for(var j = 0; j < options.length; j++) {
                
                if(options[j].Option.is_checked || options[j].Option.is_included_mod) {                
                  if(options[j].Option.price) {
                    
                    let addPrice = 0;
                    if(!options[j].Option.is_included_mod && options[j].Option.is_checked) {
                      
                      if(typeof options[j].Option.price[defaultSize] == 'string') {
                        //////console.log('def', defaultSize, is_crust_size_price_added);
                        if(is_crust_size_price_added == true) {
                          priceBinding = true;
                          addPrice = parseFloat(options[j].Option.price[defaultSize]);
                          itemBasePrice = true;
                          //////console.log('checkbaseprice1', itemBasePrice, addPrice);
                        }else if(itemSizePrice == 'true' || itemSizePrice == '') {
  
                          if(this.item.Product.plu_code != 999999) {
                            priceBinding = true;
                            
                            addPrice = parseFloat(options[j].Option.price[defaultSize]);
                            if (addPrice > 0) {
                              itemBasePrice = true;
                            }
                            
                            //////console.log(1230, defaultSize, options[j].Option.price[defaultSize], addPrice, itemBasePrice);
                          }else{
                            //////console.log(123, defaultSize);
                              if(itemSizePrice != '' || options[j].Option.plu_code == 'I101') {
                               priceBinding = true;
                                addPrice = parseFloat(options[j].Option.price[defaultSize]);
                                itemBasePrice = true;
                              }
                              
                            
                          }
                          
                        }else if((itemSizePrice == 'large' || itemSizePrice == 'medium' || itemSizePrice == 'small') && total != 0) {
                         priceBinding = true;
                          addPrice = parseFloat(options[j].Option.price[defaultSize]);
                          itemBasePrice = true;
                        }
                        
                      }else{
                        if(itemBasePrice && itemSizePrice != '' && !options[j].Option.is_included_mod && total == 0) {
                          
                        }else{
                          
                          if(itemSizePrice != '') {
                            
                            addPrice = parseFloat(options[j].Option.price);
                          }
                         
                        }
                      
                      }
                      
                    }else{
  
                      if((options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101' || options[j].Option.plu_code == '217') && options[j].Option.is_checked) {
                        if(typeof options[j].Option.price[defaultSize] == 'string') {
                          
                          addPrice = parseFloat(options[j].Option.price[defaultSize]);
                          itemBasePrice = true;
                          priceBinding = true;
                          itemSizePrice = defaultSize;
                          //////console.log('plu', defaultSize, options[j].Option.price[defaultSize], itemSizePrice);
                        }
                      }
                    }
                    
                    //////console.log('initial add price', addPrice);
                    if(options[j].Option.price.small && options[j].Option.is_topping == undefined) {
                      //////console.log('obj', options[j].Option);
                      
                      for(var x = 0; x < this.item.ProductModifier.length; x++) {
                        let p_op = this.item.ProductModifier[x].Modifier.ModifierOption;
                        for(var y = 0; y < p_op.length; y++) {
                          //////////console.log('new', p_op[y].Option);
  
                          if(p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999991 && p_op[y].Option.is_checked) {
                            defaultSize = 'small';
                          } else if(p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999992 && p_op[y].Option.is_checked) {
                           
                            defaultSize = 'medium';
                          } else if(p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999993 && p_op[y].Option.is_checked) {
                            defaultSize = 'large';
                          }
                          
                          if(options[j].Option.dependent_modifier_option_id == p_op[y].Option.id) {
                            if(p_op[y].Option.is_checked && options[j].Option.is_checked) {
                              
                              addPrice = parseFloat(options[j].Option.price[defaultSize]);
                              itemBasePrice = true;
                              itemSizePrice = defaultSize;
                              if(options[j].Option.price[defaultSize] != 0) {
                                  is_crust_size_price_added = true;
                                } 
  
                                //////console.log('plu', defaultSize, options[j].Option.price[defaultSize], 'itembaseprice',itemBasePrice, addPrice);  
                              
                            }
                            //////console.log('check',defaultSize, options[j].Option.dependent_modifier_id, p_op[y].Option);
                          }
  
                          if(p_op[y].Option.is_checked && options[j].Option.is_checked && (options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101')) {
                            
                            itemSizePrice = 'true';
                          }
                          
                          
                          if(p_op[y].Option.is_checked && p_op[y].Option.is_included_mod == false && options[j].Option.is_checked) {
                            
                            if(p_op[y].Option.plu_code == 999991) {  //small
  
                              if(typeof options[j].Option.price.small == 'string') {
                                
                                addPrice = parseFloat(options[j].Option.price.small);
                                
                                itemSizePrice = 'small';
                                defaultSize = 'small';
                                if(options[j].Option.price.small == 0) {
                                  is_crust_size_price_added = false;
                                  priceBinding = false;
                                }else{
                                  priceBinding = true;
                                }
                              }
                              
                            }else if(p_op[y].Option.plu_code == 999992) {
                              if(typeof options[j].Option.price.medium == 'string') {
                                
                                addPrice = parseFloat(options[j].Option.price.medium);
                                itemSizePrice = 'medium';
                                defaultSize = 'medium';
                                if (addPrice > 0) {
                                  itemBasePrice = true;
                                }
                                
                                if(options[j].Option.price.medium == 0) {
                                  is_crust_size_price_added = false;
                                  priceBinding = false;
                                }else{
                                  priceBinding = true;
                                } 
  
                                //////console.log('med', options[j].Option.price.medium,  options[j].Option.name , options[j].Option.is_checked, options[j].Option.is_included_mod, p_op[y].Option.is_included_mod, itemBasePrice, priceBinding);
                              }
                              
                            }else if(p_op[y].Option.plu_code == 999993) {
                              if(typeof options[j].Option.price.large == 'string') {
                                
                                
                                addPrice = parseFloat(options[j].Option.price.large);
                                itemSizePrice = 'large';
                                defaultSize = 'large';
                                if(options[j].Option.price.large == 0) {
                                  priceBinding = false;
                                  is_crust_size_price_added = false;
                                }else{
                                  priceBinding = true;
                                } 
                                
                                //////console.log('large: ', options[j].Option.price.large,  options[j].Option.name , options[j].Option.is_checked, options[j].Option.is_included_mod, p_op[y].Option.is_included_mod, 'itembaseprice: ',itemBasePrice, 'pricebinding:',priceBinding);
  
                              }
                              
                            }
                          }
                                                  
                        }
                      }
  
                      //////console.log('addPrice', addPrice);
                    }else if(options[j].Option.price.small && options[j].Option.is_topping != undefined && options[j].Option.is_included_mod == false && defaultSize != 'true' && is_crust_size_price_added == true){
                      
                      
                      addPrice = parseFloat(options[j].Option.price[defaultSize]);   
                                  
                    }else if(options[j].Option.price != null && options[j].Option.is_included_mod == false && options[j].Option.price.small == undefined){
                      
                      addPrice = parseFloat(options[j].Option.price);   
                                       
                    }
  
                    
                   
                    
                    if(options[j].Option.is_checked && options[j].Option.default_checked == false) {      
                           
                      options[j].Option.send_code = 1;                                  
                    }else if(options[j].Option.is_checked == false && options[j].Option.default_checked == true) {
                     
                      options[j].Option.send_code = 1;
                    }else if(options[j].Option.is_checked == true && options[j].Option.default_checked == true) {
                      
                      options[j].Option.send_code = 0;                    
                    }
  
                    if(options[j].Option.is_checked == false && options[j].Option.is_included_mod == true) {                   
                      options[j].Option.send_code = 1;
                    }
  
                    if(options[j].Option.is_checked == false && options[j].Option.is_included_mod == false) {                   
                      options[j].Option.send_code = 0;
                    }
  
                    if(options[j].Option.plu_code == '217' || options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101') {
                      if(options[j].Option.is_checked == true) {
                        options[j].Option.send_code = 1;
                      }else{
                        options[j].Option.send_code = 0;
                      }
                      
                    }
                    
  
                    //////console.log('check',options[j].Option.name, options[j].Option.send_code, options[j].Option.is_checked, itemBasePrice, itemSizePrice, defaultSize, options[j].Option.is_topping, is_crust_size_price_added, 'priceBinding =', priceBinding, 'includedMod', options[j].Option.is_included_mod, options[j].Option.add_extra);
  
                    if(options[j].Option.is_checked && options[j].Option.add_extra && priceBinding == true) {   
                        
                        if(options[j].Option.price[defaultSize]) {
                          //////console.log(123);
                          addPrice += parseFloat(options[j].Option.price[defaultSize]);   
                        }else{
                          
                          addPrice += parseFloat(options[j].Option.price);   
                        }                           
                        options[j].Option.send_code = 1;             
                    }
  
  
                    if(this.item.Product.plu_code == 999999) {
                      if(!isNaN(addPrice)) {
                        
                        total += addPrice;
                      }
                      
                    }else{
                      
                      if(!isNaN(addPrice)) {
                        total += addPrice;
                      }
                    }                                   
                  }               
                }
            }
          }
        }
  
       
        if(this.item.Product.price && this.item.Product.price[defaultSize] != undefined) {
          total += parseFloat(this.item.Product.price[defaultSize]);        
        }
        //////console.log('total', total, itemBasePrice, itemSizePrice);
        if(!itemBasePrice) {
          total = 0;
        }
        if(!itemBasePrice && this.item.Product.plu_code == 999999) {
         //////console.log(12345);
          total = 0;
        }
  
        if(this.item.Product.plu_code != 999999 && total == 10) {
         //////console.log(1234);
          total = 0;
        }
  
        if(this.item.Product.plu_code != 999999 && itemSizePrice == '') {
          //////console.log(123, itemSizePrice);
          total = 0;
        }
          
  
      }else{
  
  
          if(this.item.ProductModifier.length > 0) {
            let defaultSize = 'small';
            let totalModCount = this.item.ProductModifier.length;
  
            for(var i = 0; i < this.item.ProductModifier.length; i++) {
  
              let options = this.item.ProductModifier[i].Modifier.ModifierOption;
              let freeOptionCount = this.item.ProductModifier[i].free;
  
              for(var j = 0; j < options.length; j++) {
  
                  if(options[j].Option.is_checked && options[j].Option.default_checked == false) { 
                    options[j].Option.send_code = 1;
                    
                    if(options[j].Option.is_included_mod == false) {
                      
                      if(freeOptionCount == 0) {
                        if(typeof options[j].Option.price.small == 'string') {
                          total += parseFloat(options[j].Option.price[defaultSize]);
                        }else{
                          total += parseFloat(options[j].Option.price); 
                        }
                      } else {
                        freeOptionCount = parseInt(freeOptionCount) - 1;
                      }  
  
                    }
  
  
                  }else if(options[j].Option.is_checked == false && options[j].Option.default_checked == true) {
                    options[j].Option.send_code = 0;
                  }else if(options[j].Option.is_checked == true && options[j].Option.default_checked == true) {
                    options[j].Option.send_code = 1;
                    if(options[j].Option.is_included_mod == false) {
                      if(typeof options[j].Option.price.small == 'string') {
                        total += parseFloat(options[j].Option.price[defaultSize]);
                      }else{
                        total += parseFloat(options[j].Option.price); 
                      } 
                    }                  
                  }
  
                  if(options[j].Option.default_checked && options[j].Option.plu_code == 999991) {
                    defaultSize = 'small';
                  } else if(options[j].Option.default_checked && options[j].Option.plu_code == 999992) {
                    defaultSize = 'medium';
                  } else if(options[j].Option.default_checked && options[j].Option.plu_code == 999993) {
                    defaultSize = 'large';
                  }
  
                  if(options[j].Option.add_extra) {  
                    //////////console.log(defaultSize, options[j].Option.price);
                    if(typeof options[j].Option.price.small == 'string') {
                      total += parseFloat(options[j].Option.price[defaultSize]);
                    }else{
                      total += parseFloat(options[j].Option.price); 
                    }
                                        
                  }
  
              }
            }
          }
          total += parseFloat(this.item.Product.price);
      }
      total = Number(total.toFixed(2));
        return total;
  
    }


    }
