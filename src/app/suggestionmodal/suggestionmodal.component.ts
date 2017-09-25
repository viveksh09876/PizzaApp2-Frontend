import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-suggestionmodal',
  templateUrl: './suggestionmodal.component.html',
  styleUrls: ['./suggestionmodal.component.css']
})
export class SuggestionmodalComponent extends DialogComponent<SuggestModal, boolean> {

  constructor(dialogService: DialogService, 
                private dataService: DataService, 
                  private utilService: UtilService,
                    private route: ActivatedRoute, 
                      private router: Router) { 
    super(dialogService);
  }

  items = this.items;
  cmsApiPath = environment.cmsApiPath;
  menuCountry = 'UK';
  item = null;
  showLoading = false;

  updateQuantity(type, id, index) {
    if (this.items[index].id == id) {
      if (type == 0) {
        this.items[index].qty -= 1;
        if (this.items[index].qty < 0) {
          this.items[index].qty = 0;
        }
      } else if (type == 1) {
        this.items[index].qty += 1;
      }
    }
  }


  addToCart() {
    var self = this;
    let addedItems = [];
    this.showLoading = true;
    if(this.dataService.getLocalStorageData('menuCountry') != null && 
      this.dataService.getLocalStorageData('menuCountry') != undefined) {

         this.menuCountry = this.dataService.getLocalStorageData('menuCountry');       
      }

    for (var i=0; i<this.items.length; i++) {
      if (this.items[i].qty > 0) {
        addedItems.push(this.items[i]);
      }
    }

    let counter = addedItems.length;
    
    
    if (addedItems.length == 0) {
      this.showLoading = false;
      alert('Please add atleast 1 item.');

    } else {
      var p=0;
      for (var j=0; j<addedItems.length; j++) {
          this.dataService.getItemData(addedItems[p].slug, this.menuCountry)
          .subscribe(data => {
              console.log(data.Product['qty']);
              console.log(addedItems[p], addedItems[p].qty);
              data.Product['qty'] = addedItems[p].qty;
              if(data.ProductModifier.length == 0) {
                  
                  data.originalItemCost = data.Product.price;
                  data.totalItemCost = data.Product.price*data.Product['qty'];
                  data.totalItemCost = Number(data.totalItemCost.toFixed(2));
                  let temp = this.dataService.getLocalStorageData('allItems');
                  
                  if(temp == null || temp == 'null') {
    
                    let allItems = [];  
                    allItems.push(data);
                    this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
                  
                  }else{
    
                    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));                  
                    allItems.splice(0,0,data);  
                    this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
                  }
    
              }else{
                  this.item = data;
                  let total = 0;
              
                  //total = Math.round(total * 100) / 100;
                  total = this.calculateTotalCost();
                  let totalCost = +total.toFixed(2);
                  this.item.originalItemCost = totalCost;
                  this.item.totalItemCost = totalCost*data.Product['qty'];
                  this.item.totalItemCost = Number(this.item.totalItemCost.toFixed(2));
                  let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
                  allItems.push(this.item);
                  this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
              }

              --counter;
              
              if (counter == 0) {
                this.showLoading = false;
                self.moveToOrderReview();
              }
              p++;
          }); 

          
        } 
    }
    
  }


  moveToOrderReview() {
    this.result = true;
    this.close();
    //this.router.navigate(['/order-review']);
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
                    //console.log('def1');
                    defaultSize = 'small'; break;
                  } else if (defoptions[v].Option.plu_code == 999992) {
                    //console.log('def2');
                    defaultSize = 'medium'; break;
                  } else if (defoptions[v].Option.plu_code == 999993) {
                    //console.log('def3');
                    defaultSize = 'large'; break;
                  }
                }
              }
            }
            //console.log('def init', defaultSize, itemSizePrice);
            for(var i = 0; i < this.item.ProductModifier.length; i++) {
              let options = this.item.ProductModifier[i].Modifier.ModifierOption;
    
              for(var j = 0; j < options.length; j++) {
                  
                  if(options[j].Option.is_checked || options[j].Option.is_included_mod) {                
                    if(options[j].Option.price) {
                      
                      let addPrice = 0;
                      if(!options[j].Option.is_included_mod && options[j].Option.is_checked) {
                        
                        if(typeof options[j].Option.price[defaultSize] == 'string') {
                          //console.log('def', defaultSize, is_crust_size_price_added);
                          if(is_crust_size_price_added == true) {
                            priceBinding = true;
                            addPrice = parseFloat(options[j].Option.price[defaultSize]);
                            itemBasePrice = true;
                          }else if(itemSizePrice == 'true' || itemSizePrice == '') {
    
                            if(this.item.Product.plu_code != 999999) {
                              priceBinding = true;
                              //console.log(123, defaultSize, options[j].Option.price[defaultSize]);
                              addPrice = parseFloat(options[j].Option.price[defaultSize]);
                              itemBasePrice = true;
                            }else{
                              //console.log(123, defaultSize);
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
    
                        if((options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101' || options[j].Option.plu_code == '91') && options[j].Option.is_checked) {
                          if(typeof options[j].Option.price[defaultSize] == 'string') {
                            
                            addPrice = parseFloat(options[j].Option.price[defaultSize]);
                            itemBasePrice = true;
                            priceBinding = true;
                            itemSizePrice = defaultSize;
                            //console.log('plu', defaultSize, options[j].Option.price[defaultSize], itemSizePrice);
                          }
                        }
                      }
                      
                      ////console.log('initial add price', addPrice);
                      if(options[j].Option.price.small && options[j].Option.is_topping == undefined) {
                        ////console.log('obj', options[j].Option);
                        
                        for(var x = 0; x < this.item.ProductModifier.length; x++) {
                          let p_op = this.item.ProductModifier[x].Modifier.ModifierOption;
                          for(var y = 0; y < p_op.length; y++) {
                            ////console.log('new', p_op[y].Option);
    
                            if(p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999991 && p_op[y].Option.is_checked) {
                              defaultSize = 'small';
                            } else if(p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999992 && p_op[y].Option.is_checked) {
                             
                              defaultSize = 'medium';
                            } else if(p_op[y].Option.default_checked && p_op[y].Option.plu_code == 999993 && p_op[y].Option.is_checked) {
                              defaultSize = 'large';
                            }
                            
                            if(options[j].Option.dependent_modifier_option_id == p_op[y].Option.id) {
                              if(p_op[y].Option.is_checked && options[j].Option.is_checked) {
                                //console.log('plu', defaultSize, options[j].Option.price[defaultSize]);
                                addPrice = parseFloat(options[j].Option.price[defaultSize]);
                                itemBasePrice = true;
                                itemSizePrice = defaultSize;
                                if(options[j].Option.price[defaultSize] != 0) {
                                    is_crust_size_price_added = true;
                                  } 
                                
                              }
                              //console.log('check',defaultSize, options[j].Option.dependent_modifier_id, p_op[y].Option);
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
                                  ////console.log('med', options[j].Option.price.medium,  options[j].Option.name , options[j].Option.is_checked, options[j].Option.is_included_mod, p_op[y].Option.is_included_mod);
                                  addPrice = parseFloat(options[j].Option.price.medium);
                                  itemSizePrice = 'medium';
                                  defaultSize = 'medium';
                                  if(options[j].Option.price.medium == 0) {
                                    is_crust_size_price_added = false;
                                    priceBinding = false;
                                  }else{
                                    priceBinding = true;
                                  } 
                                }
                                
                              }else if(p_op[y].Option.plu_code == 999993) {
                                if(typeof options[j].Option.price.large == 'string') {
                                  
                                  ////console.log('large: ', options[j].Option.price.large,  options[j].Option.name , options[j].Option.is_checked, options[j].Option.is_included_mod, p_op[y].Option.is_included_mod);
                                  addPrice = parseFloat(options[j].Option.price.large);
                                  itemSizePrice = 'large';
                                  defaultSize = 'large';
                                  if(options[j].Option.price.large == 0) {
                                    priceBinding = false;
                                    is_crust_size_price_added = false;
                                  }else{
                                    priceBinding = true;
                                  }                              
                                }
                                
                              }
                            }
                                                    
                          }
                        }
    
                        //console.log('addPrice', addPrice);
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
    
                      if(options[j].Option.plu_code == '91' || options[j].Option.plu_code == 'I100' || options[j].Option.plu_code == 'I101') {
                        if(options[j].Option.is_checked == true) {
                          options[j].Option.send_code = 1;
                        }else{
                          options[j].Option.send_code = 0;
                        }
                        
                      }
                      
    
                      ////console.log('check',options[j].Option.name, options[j].Option.send_code, options[j].Option.is_checked, itemBasePrice, itemSizePrice, defaultSize, options[j].Option.is_topping, is_crust_size_price_added, 'priceBinding =', priceBinding, 'includedMod', options[j].Option.is_included_mod, options[j].Option.add_extra);
    
                      if(options[j].Option.is_checked && options[j].Option.add_extra && priceBinding == true) {   
                          
                          if(options[j].Option.price[defaultSize]) {
                            ////console.log(123);
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
          //console.log('total', total);
          if(!itemBasePrice && this.item.Product.plu_code == 999999) {
           //console.log(12345);
            total = 0;
          }
    
          if(this.item.Product.plu_code != 999999 && total == 10) {
           //console.log(1234);
            total = 0;
          }
    
          if(this.item.Product.plu_code != 999999 && itemSizePrice == '') {
            //console.log(123, itemSizePrice);
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
                      ////console.log(defaultSize, options[j].Option.price);
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
    
          return total;
    
      }



}

export interface SuggestModal {
  items: object;
}