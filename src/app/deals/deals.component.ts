import { Component, OnInit } from '@angular/core';
import { PipeTransform, Pipe } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { OrdernowmodalComponent } from '../ordernowmodal/ordernowmodal.component';
import { MessageComponent } from '../message/message.component';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.css']
})
export class DealsComponent implements OnInit {

  constructor(private dialogService:DialogService,
    private dataService: DataService, 
      private utilService: UtilService, 
           private route: ActivatedRoute, 
              private router: Router) { }


    menuData = null;
    categories: Array<any>;
    subcategories: Array<any>;
    items = [];
    totalCost = 0;
    netCost = 0;
    showViewCart = false;
    showFooter = false;
    cmsApiPath = environment.cmsApiPath;
    currencyCode = null;
    selectedMenuCat = null;
    selectedDealMenuCatIndex = null;
    selectedDealMenuCatId = null;
    addedCategories = [];
    suggestionProducts = [];   
    dealId = null;   
    dealData = null; 
    dealCode = null;
    comboUniqueId = 987;   
    dealValidated = false;  

  ngOnInit() {
    this.dataService.setLocalStorageData('favItemFetched', null);
    this.dataService.setLocalStorageData('favOrdersFetched', null); 
    this.dataService.setLocalStorageData('confirmationItems', null); 
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);

    this.route.params.subscribe(params => { 
      if(params['dealId'] && params['dealId']!= '') {
        this.dealId = params['dealId'];
        this.getDealData();
        
      }
    });

    this.currencyCode = this.utilService.currencyCode;
    
    this.getCartItems(); 
    
  }


  getDealData() {

    this.dataService.getDealData(this.dealId).subscribe((data) => {
        console.log(data);
        this.dealData = data;
        this.dealCode = data.deal.Deal.code;
        this.getAllCategories();
        
    });

  }

  validateDealItems() {
    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
    
    if (allItems != null) {

      let categoriesArr = this.dealData.categories;
      let keepCats = [];

      for (var i=0; i<allItems.length; i++) {
        let itemCatId = allItems[i].Product.category_id;
        let index = categoriesArr.findIndex(obj => obj.id == itemCatId);
        if (index >= 0) {
          categoriesArr[index].isEnable = false;
          keepCats.push(categoriesArr[index].id);
        } else {
          categoriesArr[index].isEnable = true;
        } 
      }

      for (var i=0; i<categoriesArr.length; i++) {
        if (keepCats.indexOf(categoriesArr[i].id) > -1) {
          categoriesArr[i].isEnable = false;
        } else {
          categoriesArr[i].isEnable = true;
        }
      }

      for(var i=0; i<categoriesArr.length; i++) {
        if (categoriesArr[i].isEnable) {
          this.selectedDealMenuCatIndex = i;
          this.selectedDealMenuCatId = categoriesArr[i].id;
          break;
        }
      }

      this.dealData.categories = categoriesArr;

    } else {

      for(var i=0; i<this.dealData.categories.length; i++) {
        this.dealData.categories[i].isEnable = true;  
      }
            
      this.selectedDealMenuCatIndex = 0;
      this.selectedDealMenuCatId = this.dealData.categories[0].id;
            
    }
  }


  validateDealConditions() {
    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
      if (allItems != null) {   
        let isNotValid = false;     
        let categoriesArr = this.dealData.categories;

        for (var i=0; i<categoriesArr.length; i++) {
          if (categoriesArr[i].isEnable) {
            isNotValid = true;
            break;
          }
        }

        return isNotValid;

      } else {
        return false;
      }
  }


  autoMoveToNextTab(categoriesArr) {

    
    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
    if (allItems == null) {
      for(var i=0; i<this.dealData.categories.length; i++) {
        this.dealData.categories[i].isEnable = true;  
      }
    }

    let catsArr = this.dealData.categories;
    for(var i=0; i<this.dealData.categories.length; i++) {
      if (this.dealData.categories[i].isEnable) {
        this.selectedDealMenuCatIndex = i;
        this.selectedDealMenuCatId = this.dealData.categories[i].id;
        break;
      }
    }
  }




  getCartItems() {
    let items = this.dataService.getLocalStorageData('allItems');
    let orderNowDetails = this.dataService.getLocalStorageData('order-now'); 
    if((items != null && items != 'null') || (orderNowDetails != null && orderNowDetails != 'null')) {
      
      if(items != 'null' && items != null) {
        this.items = JSON.parse(items);
        
        let getTCost = Number(this.utilService.calculateOverAllCost(this.items).toFixed(2));
        this.totalCost =  getTCost;
        
        this.netCost = this.totalCost;

        //this.loadAddedCategories();
      }      
      this.showViewCart = true;      
    }
  }


  getAllCategories(){
    
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
          //console.log(this.menuData[0].name);
          this.selectedMenuCat = 'meal deals';  
          
          this.validateDealItems();

          //this.loadAddedCategories();

          this.route.params.subscribe(params => { 
            if(params['slug'] && params['slug']!= '') {
              this.selectedMenuCat = params['slug'];
              this.dataService.setLocalStorageData('selectedMenuCat', this.selectedMenuCat);
            }
          });          
      }); 

      
  }


  changeCatTab(catId) {
    let catsArr = this.dealData.categories;
    let index = catsArr.findIndex(obj => obj.id == catId);
    let indexObj = catsArr[index];
    this.selectedDealMenuCatIndex = 0;
    this.selectedMenuCat = indexObj['slug'];
    this.selectedDealMenuCatId = catId;
  }

  addToCart(slug, modCount) {
    
        let orderNow = this.dataService.getLocalStorageData('order-now');
        let menuCountry = this.dataService.getLocalStorageData('menuCountry');
    
        let fromObj = {
          modCount: modCount,
          slug: slug,
          menuCountry: menuCountry,
          selectedMenuCat: this.selectedMenuCat,
          isDeal: true,
          dealId: this.dealId, 
          comboUniqueId: this.comboUniqueId, 
          selectedDealMenuCatIndex: this.selectedDealMenuCatIndex
        }
    
        if (orderNow == undefined || orderNow == null || orderNow == 'null') {
          //open order-now modal
          this.dialogService.addDialog(OrdernowmodalComponent, { fromObj: fromObj }, { closeByClickingOutside:true }).subscribe((isReloadCart)=>{ 
            if (isReloadCart) {
              this.getCartItems();
              this.validateDealItems();
            }
          }); 
    
          
    
        } else {
          if (modCount > 0) {
            //navigate to customize page
            this.router.navigate(['/item/deal/', this.dealId, this.comboUniqueId, this.selectedDealMenuCatIndex, slug]);        
          } else {
             //add product to cart without page refresh
             
             this.dataService.getItemData(slug, menuCountry)
              .subscribe(data => {

                   data.Product['dealId'] = this.dealId;
                   data.Product['comboUniqueId'] = this.comboUniqueId;
                    data.originalItemCost = this.getProductDealPrice(data.Product.plu_code, data.Product.category_id);

                    data.totalItemCost = data.originalItemCost ;

                    //data.originalItemCost = data.Product.price;
                    //data.totalItemCost = data.Product.price;
                    let temp = this.dataService.getLocalStorageData('allItems');
                    
                    if(temp == null || temp == 'null') {
    
                      let allItems = [];  
                      allItems.push(data);
                      this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
                      this.validateDealItems();
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
                      this.validateDealItems();  
                    }
                    this.getCartItems();

              });
          }
        }
      }


    checkout() {
      let isValid = this.validateDealConditions();
      if (!isValid) {
        this.router.navigate(['/order-review']); 
      } else {
        alert('Please add all required items in deal');
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
              
              let getTCost = Number(this.utilService.calculateOverAllCost(allItems).toFixed(2));
              this.totalCost =  getTCost;
              this.netCost = this.totalCost; 
  
            }else{
              this.items = [];
              this.dataService.setLocalStorageData('allItems', 'null');
              alert('No items remaining in your cart!');
            }
            
            this.validateDealItems();

        }  
        
    }    


    checkForDealArray(pluCode, catId) {
      let prodArr = this.dealData.products;
      if (catId != 1) {
        let index = prodArr.findIndex(obj => obj.product_plu == pluCode);
        if (index > -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    getProductDealPrice(pluCode, catId) {
      let prodArr = this.dealData.products;
      let index = prodArr.findIndex(obj => obj.product_plu == pluCode);
      if (index > -1) {
        let prodObj = prodArr[index];
        return prodObj.price;
      }
      
    }
  

}
