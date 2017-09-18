import { Component, OnInit } from '@angular/core';
import { PipeTransform, Pipe } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { OrdernowmodalComponent } from '../ordernowmodal/ordernowmodal.component';
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
  totalCost = 0;
  netCost = 0;
  showViewCart = false;
  showFooter = false;
  cmsApiPath = environment.cmsApiPath;
  currencyCode = null;
  selectedMenuCat = null;


  ngOnInit() {
    
    this.dataService.setLocalStorageData('favItemFetched', null);
    this.dataService.setLocalStorageData('favOrdersFetched', null); 
    this.dataService.setLocalStorageData('confirmationItems', null); 
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);

    this.currencyCode = this.utilService.currencyCode;
    this.getAllCategories();
    this.getCartItems();        
    
  }


  getCartItems() {
    let items = this.dataService.getLocalStorageData('allItems');
    let orderNowDetails = this.dataService.getLocalStorageData('order-now'); 
    if((items != null && items != 'null') || (orderNowDetails != null && orderNowDetails != 'null')) {
      
      if(items != 'null' && items != null) {
        this.items = JSON.parse(items);
        this.totalCost = this.utilService.calculateOverAllCost(this.items);
        this.netCost = this.totalCost;
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
          this.selectedMenuCat = this.menuData[0].name;  


          this.route.params.subscribe(params => { 
            if(params['slug'] && params['slug']!= '') {
              this.selectedMenuCat = params['slug'];
              this.dataService.setLocalStorageData('selectedMenuCat', this.selectedMenuCat);
            }
          });          
      }); 

      
  }


  goToCustomize(slug, modCount) {
    let orderNow = this.dataService.getLocalStorageData('order-now');
    if (orderNow == undefined || orderNow == null || orderNow == 'null') {
      //open order-now modal
      this.dialogService.addDialog(OrdernowmodalComponent, { }, { closeByClickingOutside:true }); 
    } else {
      if (modCount > 0) {
        //navigate to customize page
        this.router.navigate(['/item', slug]);        
      } else {
         //add product to cart without page refresh
         let menuCountry = this.dataService.getLocalStorageData('menuCountry');
         this.dataService.getItemData(slug, menuCountry)
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

                this.getCartItems();
            
          });
      }
    }
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

          total =  parseInt(this.items[i].originalItemCost)*this.items[i].Product.qty;
          this.items[i].totalItemCost = total;

          break;
      }
    }

    let getTCost = Number(this.utilService.calculateOverAllCost(this.items).toFixed(2));
    this.totalCost =  getTCost;
    this.netCost = this.totalCost;
   // console.log(type, this.totalCost, this.items.Product.qty);
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
            this.totalCost = this.utilService.calculateOverAllCost(allItems);
            this.netCost = this.totalCost; 

          }else{
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
    
    this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));    
    this.dataService.setLocalStorageData('totalCost', this.totalCost); 
    this.router.navigate(['/order-review']);
  }



}
