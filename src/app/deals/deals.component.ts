import { Component, OnInit } from '@angular/core';
import { PipeTransform, Pipe } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { OrdernowmodalComponent } from '../ordernowmodal/ordernowmodal.component';
import { MessageComponent } from '../message/message.component';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.css']
})
export class DealsComponent implements OnInit {

  constructor(private dialogService: DialogService,
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
  comboUniqueId = null;
  dealValidated = false;
  showLoading = false;
  formattedItems = null;
  orderNowDetails = null;
  nutritionInfo = {};
  customizeDropdown = {};


  ngOnInit() {
    this.dataService.setLocalStorageData('favItemFetched', null);
    this.dataService.setLocalStorageData('favOrdersFetched', null);
    this.dataService.setLocalStorageData('confirmationItems', null);
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);

    this.route.params.subscribe(params => {
      if (params['dealId'] && params['dealId'] != '') {
        this.dealId = params['dealId'];
        this.getDealData(this.dealId);

      }

      if (params['comboUniqueId'] && params['comboUniqueId'] != '') {
        this.comboUniqueId = params['comboUniqueId'];
      }
    });

    this.currencyCode = this.utilService.currencyCode;

    this.getCartItems();
    this.orderNowDetails = JSON.parse(this.dataService.getLocalStorageData('order-now'));
    if (this.orderNowDetails == null || this.orderNowDetails == 'null') {
      this.updateStoreAndTime('location');
    }

  }


  getDealData(dealId) {
    //this.dataService.getDealTypeData(dealId).subscribe(data => {
    let data = this.dataService.getDealTypeData(dealId);
   // console.log('deallllllll',data);
    this.dealData = data;
    this.dealCode = data['code'];
    this.getAllCategories();
    this.filterDealmodifier();
    //}); 
  }

  validateDealItems(allItems) {
    allItems = JSON.parse(allItems);
    if (allItems != null) {

      let categoriesArr = this.dealData.categories;
      let keepCats = [];      //cats for which products added
      let atLeastoneEnable = false;
      let isExistArr = {};


      let count = 0;
      for (var i = 0; i < categoriesArr.length; i++) {

        for (var j = 0; j < allItems.length; j++) {
          if (allItems[j].Product.dealId != undefined) {



            if (allItems[j].Product.position == categoriesArr[i].pos && allItems[j].Product.comboUniqueId == this.comboUniqueId) {
              count++;
            }


            let itemCatId = allItems[j].Product.category_id;

            if (categoriesArr[i].qty == count && allItems[j].Product.comboUniqueId == this.comboUniqueId) {
              keepCats.push(categoriesArr[i].pos);
              count = 0;
            }

          }
        }
      }

      ////console.log('keepCats', keepCats);


      for (var i = 0; i < categoriesArr.length; i++) {

        if (keepCats.indexOf(categoriesArr[i].pos) < 0) {
          categoriesArr[i].isEnable = true;
        } else {
          categoriesArr[i].isEnable = false;
        }
      }

      for (var i = 0; i < categoriesArr.length; i++) {
        if (categoriesArr[i].isEnable) {
          this.selectedDealMenuCatIndex = i;
          this.selectedDealMenuCatId = categoriesArr[i].id;
          atLeastoneEnable = true;
          break;
        }
      }

      if (!atLeastoneEnable) {
        //this.selectedDealMenuCatId = null;

        //calculate discount
        this.showLoading = true;
        ////console.log('dealcode', this.dealCode, 'dealdi', this.dealId);
        let thisDealItems = this.getThisDealItems(this.dealCode, allItems, this.comboUniqueId);

        //console.log('dealcode', thisDealItems);	
        let orderDetails = JSON.parse(this.dataService.getLocalStorageData('order-now'));
        let orderObj = {
          storeId: orderDetails.selectedStore.Store.store_id,
          coupon: '',
          order_type: orderDetails.type,
          order_details: this.prepareFinalOrderData(thisDealItems),
          is_meal_deal: 'MEALDEAL'
        }
        ////console.log('orderObj', orderObj);
        let discount = 0;
        this.dataService.applyCoupon(orderObj)
          .subscribe(data => {
            let resp = data;
            ////console.log('discount', data);
            if (resp.Status == 'Error') {
              discount = 0;
            } else if (resp.Status == 'OK') {
              discount = Number(parseFloat(resp.Discount).toFixed(2));
            }
            let updatedItems = this.mapDealItemPrices(allItems, this.dealId, this.comboUniqueId, discount);
            this.dataService.setLocalStorageData('allItems', JSON.stringify(updatedItems));

          });




        this.router.navigate(['/menu', 'meal deals']);
        //});


      }

      this.dealData.categories = categoriesArr;

    } else {

      for (var i = 0; i < this.dealData.categories.length; i++) {
        this.dealData.categories[i].isEnable = true;
      }

      this.selectedDealMenuCatIndex = 0;
      this.selectedDealMenuCatId = this.dealData.categories[0].id;

    }
  }


  mapDealItemPrices(allItems, dealId, comboUniqueId, discount) {
    let curDealItems = [];
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].Product.comboUniqueId == comboUniqueId) {
        curDealItems.push(allItems[i]);
      }
    }

    let totalPrice = 0
    for (var i = 0; i < curDealItems.length; i++) {
      let price = Number(parseFloat(curDealItems[i].totalItemCost).toFixed(2));

      totalPrice += price;

    }

    ////console.log(discount);
    let discountPrice = Number(parseFloat(discount).toFixed(2));
    totalPrice = totalPrice - discountPrice;
    ////console.log(totalPrice, discountPrice);

    for (var i = 0; i < allItems.length; i++) {
      for (var j = 0; j < curDealItems.length; j++) {
        if (allItems[i].Product.id == curDealItems[j].Product.id && allItems[i].Product.comboUniqueId == curDealItems[j].Product.comboUniqueId) {
          allItems[i]['dealPrice'] = totalPrice;
        }
      }
    }


    return allItems;

  }




  getDiscount(dealItems, dealId, dealCode) {
    let orderDetails = JSON.parse(this.dataService.getLocalStorageData('order-now'));
    let orderObj = {
      storeId: orderDetails.selectedStore.Store.store_id,
      coupon: '',
      order_type: orderDetails.type,
      order_details: this.prepareFinalOrderData(dealItems),
      is_meal_deal: 'MEALDEAL'
    }
    ////console.log('orderObj', orderObj);
    this.dataService.applyCoupon(orderObj)
      .subscribe(data => {
        let resp = data;
        ////console.log('discount', data);
        if (resp.Status == 'Error') {
          return 0;
        } else if (resp.Status == 'OK') {
          return Number(parseFloat(resp.Discount).toFixed(2));
        }


      });

  }


  getThisDealItems(dealId, allItems, comboUniqueId) {
    let itemsArr = [];
    var j = 1;

    for (var i = 0; i < allItems.length; i++) {
      let dId = allItems[i].Product.dealId;
      if (!isNaN(dId)) {

        //this.dataService.getDealCode(dId, (deId) => {
        let deId = this.dataService.getDealCode(dId);

        dId = deId;

        if (allItems[i] != undefined && allItems[i].Product.dealId != undefined && dId == dealId && allItems[i].Product.comboUniqueId == comboUniqueId) {
          let itemObj = allItems[i];
          itemObj.Product.dealId = this.dealCode;
          itemsArr.push(itemObj);
        }


        //});
      }

    }


    return itemsArr;

    //return itemsArr;
  }


  prepareFinalOrderData(items) {

    let finalOrder = [];
    if (items.length > 0) {

      for (var p = 0; p < items.length; p++) {
        let products = items[p];

        let product = { name: '', plu: '', category_id: products.Product.category_id, quantity: 1, modifier: [], dealId: null, comboUniqueId: null };
        product.name = products.Product.title;
        product.plu = products.Product.plu_code;
        product.quantity = products.Product.qty;
        product.dealId = products.Product.dealId;
        product.comboUniqueId = products.Product.comboUniqueId;

        // ////console.log(products);
        if (products.ProductModifier.length > 0) {

          for (var i = 0; i < products.ProductModifier.length; i++) {

            for (var j = 0; j < products.ProductModifier[i].Modifier.ModifierOption.length; j++) {

              let opt = products.ProductModifier[i].Modifier.ModifierOption[j].Option;


              if ((opt.plu_code == '217' || opt.plu_code == 'I100' || opt.plu_code == 'I101') && opt.is_checked) {
                opt.send_code = 1;
                //////console.log('fix', opt.name);
              }

              if ((opt.send_code == 1)
                || (opt.plu_code == 999991 && opt.is_checked)
                || (opt.plu_code == 999992 && opt.is_checked)
                || (opt.plu_code == 999993 && opt.is_checked)) {

                let isSizeCrust = false;
                if (opt.plu_code == 999991
                  || opt.plu_code == 999992
                  || opt.plu_code == 999993
                  || opt.plu_code == 217
                  || opt.plu_code == 'I100'
                  || opt.plu_code == 'I101') {

                  isSizeCrust = true;

                }


                let circle_type = 'Full';

                for (var a = 0; a < opt.OptionSuboption.length; a++) {
                  if (opt.OptionSuboption[a].SubOption.is_active == true) {
                    circle_type = opt.OptionSuboption[a].SubOption.name;
                  }
                }

                let sendToOrder = true;
                if (opt.category_id != 1 && opt.category_id != 8 && isSizeCrust == false) {
                  if (opt.is_checked && opt.default_checked) {
                    if (!opt.add_extra) {
                      sendToOrder = false;
                    }
                  }
                }


                if (sendToOrder) {


                  let modType = 'modifier';
                  if (opt.is_included_mod) {
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

                  if (opt.is_checked || opt.add_extra == true) {
                    val.type = 1
                  }

                  product.modifier.push(val);
                }

              }

            }
          }
        }

        finalOrder.push(product);
      }

    }

    return finalOrder;

  }



  validateDealConditions() {
    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
    if (allItems != null) {
      let isNotValid = false;
      let categoriesArr = this.dealData.categories;

      for (var i = 0; i < categoriesArr.length; i++) {
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
      for (var i = 0; i < this.dealData.categories.length; i++) {
        this.dealData.categories[i].isEnable = true;
      }
    }

    let catsArr = this.dealData.categories;
    for (var i = 0; i < this.dealData.categories.length; i++) {
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
    if ((items != null && items != 'null') || (orderNowDetails != null && orderNowDetails != 'null')) {
      if (items != 'null' && items != null) {
        this.items = JSON.parse(items);
        let formattedItemsData = this.dataService.formatCartData(this.items, 'deal');
        this.formattedItems = formattedItemsData;
        this.totalCost = formattedItemsData.totalPrice;
        this.netCost = this.totalCost;
        //this.loadAddedCategories();
        //});

        this.showViewCart = true;
      } else {
        this.showViewCart = false;
      }

    }
  }

  /**
   * @description NEED TO MAKE THIS METHOD COMMON 
   * @param type 
   * @param plu 
   * @param index 
   */
  updateQuantity(type, plu, index) {

    let total = 0;

    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].Product.plu_code == plu && i == index) {

        //increase
        if (type == 1) {
          this.items[i].Product.qty += 1;
        } else {

          this.items[i].Product.qty = this.items[i].Product.qty - 1;
          if (this.items[i].Product.qty <= 0) {
            this.items[i].Product.qty = 1;
          }
        }

        let getOICost = Number(parseFloat(this.items[i].originalItemCost).toFixed(2));
        total = getOICost * this.items[i].Product.qty;
        this.items[i].totalItemCost = total;

        break;
      }
    }

    let formattedItemsData = this.dataService.formatCartData(this.items, 'menu');
    this.formattedItems = formattedItemsData;
    this.totalCost = formattedItemsData.totalPrice;
    this.netCost = this.totalCost;
    //});    

  }

  getAllCategories() {

    let storeId = 1;
    let menuCountry = 'UK';
    if (this.dataService.getLocalStorageData('nearByStore') != undefined &&
      this.dataService.getLocalStorageData('nearByStore') != '') {

      let nearByStoreId = this.dataService.getLocalStorageData('nearByStore');
      menuCountry = this.dataService.getLocalStorageData('menuCountry');
    }

    this.dataService.getMenuData(storeId, menuCountry)
      .subscribe(data => {

        this.menuData = data;
        ////console.log(this.menuData[0].name);
        this.selectedMenuCat = 'meal deals';


        var addedItems = this.dataService.getLocalStorageData('allItems');
        this.validateDealItems(addedItems);

        //this.loadAddedCategories();

        this.route.params.subscribe(params => {
          if (params['slug'] && params['slug'] != '') {
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

  addToCart(slug, modCount, cType, modifer_selected) {

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
      this.dialogService.addDialog(OrdernowmodalComponent, { fromObj: fromObj }, { closeByClickingOutside: true }).subscribe((isReloadCart) => {
        if (isReloadCart) {
          this.getCartItems();

          let addedItems = this.dataService.getLocalStorageData('allItems');
          this.validateDealItems(addedItems);
        }
      });



    } else {
      if (modCount > 0 && slug != 'chicken-tenders-2-2-2') {
        if (modifer_selected) {
          this.addToCartCustomizeItem(slug, menuCountry, cType, modifer_selected);
          //navigate to customize page
          // this.add_to_cart_dipping_sauce_data(slug,menuCountry,selected_modifier);
        } else { this.router.navigate(['/item/deal/', this.dealId, this.comboUniqueId, this.selectedDealMenuCatIndex, slug]); }
      } else {
        //add product to cart without page refresh

        this.dataService.getItemData(slug, menuCountry)
          .subscribe(data => {

            data.Product['dealId'] = this.dealId;
            data.Product['comboUniqueId'] = this.comboUniqueId;
            data.Product['position'] = this.selectedDealMenuCatIndex;


            data.originalItemCost = data.Product.price;
            data.totalItemCost = data.Product.price;
            let temp = this.dataService.getLocalStorageData('allItems');

            if (temp == null || temp == 'null') {

              let allItems = [];
              allItems.push(data);
              this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems));

              var addedItems = JSON.stringify(allItems);
              this.validateDealItems(addedItems);

            } else {

              let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
              allItems.push(data);
              /*
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
              
              */

              var addedItems = JSON.stringify(allItems);
              this.dataService.setLocalStorageData('allItems', addedItems);
              this.validateDealItems(addedItems);
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
    if (y) {
      let allItems = [];
      let item = this.items;
      this.items.splice(num, 1);
      allItems = this.items;

      if (allItems.length > 0) {

        this.items = allItems;
        this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));

        let formattedItemsData = this.dataService.formatCartData(this.items, 'deal');
        this.formattedItems = formattedItemsData;
        this.totalCost = formattedItemsData['totalPrice'];
        this.netCost = this.totalCost;
        //});    


      } else {
        this.items = [];
        this.dataService.setLocalStorageData('allItems', 'null');
        alert('No items remaining in your cart!');
      }

      var addedItems = JSON.stringify(this.items);
      this.validateDealItems(addedItems);

    }

  }

  deleteDealItem(dealId, comboUniqueId) {
    var y = confirm('Are you sure, you want to delete this deal from order?');
    if (y) {
      let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));

      let remainingItems = [];

      for (var i = 0; i < allItems.length; i++) {
        if (allItems[i].Product.dealId == undefined || (allItems[i].Product.dealId != dealId && allItems[i].Product.comboUniqueId != comboUniqueId)) {
          remainingItems.push(allItems[i]);
        }
      }

      if (remainingItems.length > 0) {
        this.items = remainingItems;
        this.dataService.setLocalStorageData('allItems', JSON.stringify(this.items));
        let formattedItemsData = this.dataService.formatCartData(this.items, 'deal');
        this.formattedItems = formattedItemsData;
        this.totalCost = formattedItemsData.totalPrice;
        this.netCost = this.totalCost;
        //});    

      } else {
        this.items = [];
        this.dataService.setLocalStorageData('allItems', 'null');
        alert('No items remaining in your cart!');
      }
    }

  }


  checkForDealArray(productId, pluCode, catId) {
    let prodArr = this.dealData.categories[this.selectedDealMenuCatIndex].products;
    if (prodArr != null && prodArr.length > 0) {
      if (prodArr.indexOf(productId) > -1) {
        return true;
      } else {
        return false;
      }
    } else if (this.dealData.categories[this.selectedDealMenuCatIndex].id == catId) {
      return true;
    } else {
      return false;
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


  backToMenuPage() {
    this.router.navigate(['/menu', 'meal deals']);
  }

  clearCart() {
    this.dataService.clearCart();
    this.items = [];
    this.showViewCart = false;
    this.formattedItems.deals = [];
    this.formattedItems.otherItems = [];
    this.netCost = 0;
  }


  updateStoreAndTime(whichEvn) {
    // for check on modal which button was click on this page
    this.dataService.setLocalStorageData('timeselector-click', JSON.stringify(whichEvn));
    this.dialogService.addDialog(OrdernowmodalComponent, {}, { closeByClickingOutside: true }).subscribe((data) => {
      if (data) {
        this.getCartItems();
      }
      this.orderNowDetails = JSON.parse(this.dataService.getLocalStorageData('order-now'));

    });

  }



  add_to_cart_dipping_sauce_data(slug, menuCountry, selected_modifier) {
    //selected_modifier=selected_modifier?selected_modifier:262;
    this.dataService.getItemData(slug, menuCountry)
      .subscribe(data => {
        // code for set modifier values
        if (data.ProductModifier.length > 0) {
          for (var i = 0; i < data.ProductModifier.length; i++) {
            var ModifierOption = data.ProductModifier[i]['Modifier']['ModifierOption'];
            for (var j = 0; j < ModifierOption.length; j++) {
              if (ModifierOption[j]['Option']['plu_code'] == selected_modifier) {
                ModifierOption[j]['Option']['is_checked'] = true;
                ModifierOption[j]['Option']['send_code'] = 1;
              } else {
                ModifierOption[j]['Option']['is_checked'] = false;
                ModifierOption[j]['Option']['send_code'] = 0;
              }

            }
            data.ProductModifier[i]['Modifier']['ModifierOption'] = ModifierOption;
            data.Product.selected_modifier = selected_modifier;
          }
          // update price and qty for cart
          data.originalItemCost = data.Product.price;
          data.totalItemCost = data.Product.price;
          data.Product['dealId'] = this.dealId;
          data.Product['comboUniqueId'] = this.comboUniqueId;
          data.Product['position'] = this.selectedDealMenuCatIndex;


          let temp = this.dataService.getLocalStorageData('allItems');

          if (temp == null || temp == 'null') {
            let allItems = [];
            allItems.push(data);
            this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems));
          } else {
            let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
            /*   let isExist = false;
               for(var i=0; i<allItems.length; i++) { 
                 // check product id and its modifier is already
                 if(allItems[i].Product.id == data.Product.id && allItems[i].Product.selected_modifier==selected_modifier) {
                   allItems[i].Product.qty += data.Product.qty;
                   var total = parseFloat(allItems[i].Product.price)*allItems[i].Product.qty;
                   allItems[i].totalItemCost = Number(total.toFixed(2));
                   isExist = true;
                   break;
                 }
               }         
               
               if(!isExist) {
                 allItems.splice(0,0,data);
               }
               */
            this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems));
            var addedItems = JSON.stringify(allItems);
            this.validateDealItems(addedItems);
          }

          this.getCartItems();
        }
      });


  }


  addToCartCustomizeItem(slug, menuCountry, cType, modifer_selected) {
    //selected_modifier=selected_modifier?selected_modifier:262;
    let list = modifer_selected.split('-');
    //these are like a radio for pizza 
    let Pizzalist = ['999991', '999992', '999993', 'I100', 'I101', '217'];
    this.dataService.getItemData(slug, menuCountry)
      .subscribe(data => {
        // code for set modifier values
        if (data.ProductModifier.length > 0) {
          for (var i = 0; i < data.ProductModifier.length; i++) {
            var ModifierOption = data.ProductModifier[i]['Modifier']['ModifierOption'];
            for (var j = 0; j < ModifierOption.length; j++) {
              if (list.indexOf(ModifierOption[j]['Option']['plu_code']) !== -1) {
                ModifierOption[j]['Option']['is_checked'] = true;
                ModifierOption[j]['Option']['send_code'] = 1;
              } else if (cType != 'pizza' || Pizzalist.indexOf(ModifierOption[j]['Option']['plu_code']) !== -1) {
                ModifierOption[j]['Option']['is_checked'] = false;
                ModifierOption[j]['Option']['send_code'] = 0;
              }

            }
            data.ProductModifier[i]['Modifier']['ModifierOption'] = ModifierOption;
            data.Product.modifer_selected = modifer_selected;
          }
          // update price and qty for cart
          let totalPriceOnBasisOfModifier = this.utilService.calculateTotalCost(data);
          data.originalItemCost = totalPriceOnBasisOfModifier;
          data.totalItemCost = totalPriceOnBasisOfModifier;
          data.Product['dealId'] = this.dealId;
          data.Product['comboUniqueId'] = this.comboUniqueId;
          data.Product['position'] = this.selectedDealMenuCatIndex;

          // code for add qty  
          //if(this.itemsQtyBeforeCart['qty_'+data.Product.plu_code]){
          //   data.Product.qty = this.itemsQtyBeforeCart['qty_'+data.Product.plu_code];
          //   data.totalItemCost = parseFloat(data.totalItemCost)*data.Product.qty;
          //   this.itemsQtyBeforeCart['qty_'+data.Product.plu_code]=1;
          // }

          /// end 
          let temp = this.dataService.getLocalStorageData('allItems');
          if (temp == null || temp == 'null') {
            let allItems = [];
            allItems.push(data);
            this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems));
            var addedItems = JSON.stringify(allItems);
            this.validateDealItems(addedItems);

          } else {
            let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
            allItems.push(data);
            /*let isExist = false;
                           for(var i=0; i<allItems.length; i++) { 
                             // check product id and its modifier is already
                             if(allItems[i].Product.id == data.Product.id && allItems[i].Product.modifer_selected==modifer_selected) {
                               allItems[i].Product.qty += data.Product.qty;
                               var total=this.utilService.calculateTotalCost(allItems[i]);// for get pizza and ther iten price 
                               total = total*allItems[i].Product.qty;
                               allItems[i].totalItemCost = Number(total.toFixed(2));
                               isExist = true;
                               break;
                             }
                           }         
                           
                           if(!isExist) {
                             allItems.splice(0,0,data);
                           }
              */
            this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems));
            var addedItems = JSON.stringify(allItems);
            this.validateDealItems(addedItems);
          }
          this.getCartItems();
        }
      });
  }


  /**
 * only for default value selection
 */

  updateDefaultValue(plu_code, modifier,cat) {
    // set default value if desiger sixe and product not avaible 
   if(cat && ((cat.allowSize.length>0 && -1 == cat.allowSize.indexOf('999993')) || (cat.allowProduct.length>0 && -1 == cat.allowProduct.indexOf('I100')))){
    modifier=cat.allowProduct[0]+'-'+cat.allowSize[0];
   }
   if (!this.customizeDropdown['_' + plu_code]) {
      this.customizeDropdown['_' + plu_code] = modifier;
    }
    return true;
  }

  filterDealmodifier() {
    if (this.dealData) {
      for (let i = 0; i < this.dealData.categories.length; i++) {
        this.dealData.categories[i].allowSize = [];
        this.dealData.categories[i].allowProduct = [];
        if (this.dealData.categories[i].modifiers) {
          for (let j = 0; j < this.dealData.categories[i].modifiers.length; j++) {
            if (this.dealData.categories[i].modifiers[j].modifierId == 1) {
              this.dealData.categories[i].allowSize.push(this.dealData.categories[i].modifiers[j].modOptionPlu);
            } else {
              this.dealData.categories[i].allowProduct.push(this.dealData.categories[i].modifiers[j].modOptionPlu);
            }
          }
        }
      }
    }
  }

  parseFloatCustome(price,price1,action){
    switch(action){
      case 'add':
      return (parseFloat(price)+parseFloat(price1)).toFixed(2);
    }
}
}
