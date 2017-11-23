import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

  constructor(private dataService: DataService, 
                  private route: ActivatedRoute, 
                    private router: Router,
                      private utilService: UtilService) { }

  items = [];
  orderData = null;
  totalCost = 0;
  netCost = 0;
  storeData = null;
  couponDiscount = 0;
  currencyCode = null;
  showLoading = true;
  orderId = null;
  formattedItems=null;

  ngOnInit() {
    this.currencyCode = this.utilService.currencyCode;
    this.getItems(); 
    this.getStoreDetails();  
    this.dataService.setLocalStorageData('order-now', null);
  }


  getItems() {

    if(this.dataService.getLocalStorageData('confirmationItems') != null 
            && this.dataService.getLocalStorageData('confirmationItems') != undefined) {

        this.orderId = this.dataService.getLocalStorageData('confirmationOrderId');
        
        this.dataService.setLocalStorageData('confirmationOrderId', null);
        
        this.items = JSON.parse(this.dataService.getLocalStorageData('confirmationItems'));
        this.orderData = JSON.parse(this.dataService.getLocalStorageData('confirmationFinalOrder'));
        this.dataService.formatCartData(this.items, 'confirmation', (formattedItemsData) => {
          this.formattedItems = formattedItemsData;
          //console.log('this.formattedItems', this.formattedItems);
              this.totalCost =  formattedItemsData.totalPrice;
              this.netCost = this.totalCost; 
              if(this.orderData.couponDiscount != 0 && !isNaN(this.orderData.couponDiscount)) {
                this.couponDiscount = this.orderData.couponDiscount;
                this.totalCost = this.totalCost - this.orderData.couponDiscount;
              }
              // if(this.orderData.order_type == 'delivery') {
              //     this.totalCost += 6;
              // } 
        });
        
        

    } else {
      window.location.href = '/';
    }
    

    this.showLoading = false;
  }

  getStoreDetails() {

     this.dataService.getStoreDetailsByStoreId(this.orderData.storeId)
          .subscribe(data => {                        
              this.storeData = data;
          }); 
  }



}
