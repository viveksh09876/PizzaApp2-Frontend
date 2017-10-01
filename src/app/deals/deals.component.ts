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
    addedCategories = [];
    suggestionProducts = [];   
    dealId = null;         

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
    this.getAllCategories();
    this.getCartItems(); 
    
  }


  getDealData() {

    this.dataService.getDealData(this.dealId).subscribe((data) => {
        console.log(data);
    });


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
          this.selectedMenuCat = this.menuData[0].name;  

          //this.loadAddedCategories();

          this.route.params.subscribe(params => { 
            if(params['slug'] && params['slug']!= '') {
              this.selectedMenuCat = params['slug'];
              this.dataService.setLocalStorageData('selectedMenuCat', this.selectedMenuCat);
            }
          });          
      }); 

      
  }


}
