import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { DialogService } from "ng2-bootstrap-modal";
import { LoginComponent } from '../login/login.component';
import { FavmodalComponent } from '../favmodal/favmodal.component';
import { MessageComponent } from '../message/message.component';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  item = null;
  totalCost = 0;
  netCost = 0;
  selectedModifiers = [];
  allItems = null;
  is_fav = false;
  cmsApiPath = environment.cmsApiPath;
  showAddToCart = true;
  menuCountry = null;
  currencyCode = null;
  isEdit = false;
  itemPos: 0;
  dealId = null;
  isDeal = false;
  comboUniqueId = null;
  dealCode = null;
  dealData = null;
  dealItem = null;
  position = null;

  constructor(private dialogService:DialogService,
              private dataService: DataService, 
                private route: ActivatedRoute, 
                  private router: Router,
                    private utilService: UtilService) { }

                    sub = null;

  ngOnInit() {
      
      this.currencyCode = this.utilService.currencyCode;
      if(this.dataService.getLocalStorageData('menuCountry') != null && 
                this.dataService.getLocalStorageData('menuCountry') != undefined) {

           this.menuCountry = this.dataService.getLocalStorageData('menuCountry');       
      }


      this.route.params.subscribe(params => {
        
        if(params['slug'] && params['slug'] != '') {

          if (params['dealId'] && params['dealId'] != '') {
            this.isDeal = true;
            this.dealId = params['dealId'];

            //this.dataService.getDealTypeData(this.dealId).subscribe(data => {
              let data = this.dataService.getDealTypeData(this.dealId);
              this.dealData = data;
              this.dealCode = data['code'];
            //});
            
          }

          if (params['comboUniqueId'] && params['comboUniqueId'] != '') {
            this.comboUniqueId = params['comboUniqueId'];
          }

          if (params['position'] && params['position'] != '') {
            this.position = params['position'];
          }

          if(params['slug'] != 'favourite') {
            this.getItemData(params['slug']);
            if(this.dataService.getLocalStorageData('allItems') != null
                  && this.dataService.getLocalStorageData('allItems') != 'null') {
              this.allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
              this.netCost = this.utilService.calculateOverAllCost(this.allItems);
            }

          }else{
              let favItemData = this.dataService.getLocalStorageData('favItemFetched');
              if(favItemData != null && favItemData != undefined) {
                favItemData = JSON.stringify(favItemData);
                this.getFavItemData(favItemData);
              }              
          }
          
        }else{
          //from edit item
          if(params['itemPos'] && params['itemPos']!= '') {
            
            this.isEdit = true;
            this.itemPos = params['itemPos'];
            let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems')); 
            this.item = allItems[params['itemPos']];
            this.getTotalCost();

          } else {
            alert('Invalid Page Requested!');
          }
        }

      });

  }

  getItemData(slug) {
     this.dataService.getItemData(slug, this.menuCountry)
          .subscribe(data => {
                
             if(data.ProductModifier.length == 0) {
                
                data.originalItemCost = data.Product.price;
                data.totalItemCost = data.Product.price;
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

                let selectedMenuCat = this.dataService.getLocalStorageData('selectedMenuCat');
                this.router.navigate(['/menu', selectedMenuCat]);
             
            }else{
                this.item = data;
                if (this.isDeal) {
                  this.updateItemForDeal();
                }
                this.getTotalCost();
             }
            
          });
  }


  updateItemForDeal() {
    

    let dealData = this.dealData.categories[this.position];
    let modifiersArr = null;
    
    if (dealData != null && dealData.modifiers != null && dealData.modifiers.length > 0) {
      if (dealData.products != null && dealData.products.length > 0) {
        for(var i=0; i<dealData.products.length; i++) {
          if (dealData.products[i].id == this.item.Product.id) {
            modifiersArr = dealData.modifiers[i];
          }
        }
      } else {
        modifiersArr = dealData.modifiers;
      }
	  
	  ////console.log('modifiersArr', modifiersArr);
  
      var temp = this.item.ProductModifier;
      var prodMods = this.item.ProductModifier;
      
      
	  for (var i=0; i<prodMods.length; i++) {
		 
		 let modOption = prodMods[i].Modifier.ModifierOption;
		 let isOneChecked = false;
		 let modId = null;
		 
		 for (var j=0; j<modOption.length; j++) {
			for (var k=0; k<modifiersArr.length; k++) {
				if (modOption[j].modifier_id == modifiersArr[k].modifierId) {
					
					modId = modifiersArr[k].modifierId;
					let index = modifiersArr.findIndex(obj => obj.modOptionPlu == modOption[j].Option.plu_code);
					//////console.log('index', index, modOption[j].Option.plu_code);
					if (index < 0) {
						prodMods[i].Modifier.ModifierOption[j]['isRemove'] = true;
						prodMods[i].Modifier.ModifierOption[j].Option.default_checked = false;
						prodMods[i].Modifier.ModifierOption[j].Option.is_checked = false;
						prodMods[i].Modifier.ModifierOption[j].Option.send_code = false;
						prodMods[i].Modifier.ModifierOption[j].Option.send_code_permanent = false;
					} else {
						if (prodMods[i].Modifier.ModifierOption[j].Option.default_checked) {
							isOneChecked = true;
						}
					}
				}
			}
		 }
		 
		 if (!isOneChecked) {
			for (var p=0; p<modOption.length; p++) {
				if (modId == prodMods[i].Modifier.ModifierOption[p].modifier_id && prodMods[i].Modifier.ModifierOption[p].isRemove == undefined) {
					prodMods[i].Modifier.ModifierOption[p].Option.default_checked = true;
					prodMods[i].Modifier.ModifierOption[p].Option.is_checked = true;
					prodMods[i].Modifier.ModifierOption[p].Option.send_code = true;
					prodMods[i].Modifier.ModifierOption[p].Option.send_code_permanent = true;
					break;
				}				
			}
		 }
		 
		 
	  }
	  	
	
      for (var i=0; i<prodMods.length; i++) {
        for(var j=0; j<prodMods[i].Modifier.ModifierOption.length; j++) {
  
          let pArr = prodMods[i].Modifier.ModifierOption.filter(val => val);
          prodMods[i].Modifier.ModifierOption = pArr;
          
        }
      }
      
      ////console.log(prodMods);
      this.item.ProductModifier = prodMods;
  
    }
    
  }


  getFavItemData(favData) {
     this.dataService.getformattedFavData(favData, this.menuCountry)
          .subscribe(data => {
                
             if(data.ProductModifier.length == 0) {
                
                data.originalItemCost = data.Product.price;
                data.totalItemCost = data.Product.price;
                let temp = this.dataService.getLocalStorageData('allItems');
                
                if(temp == null || temp == 'null') {

                  let allItems = [];                  
                  allItems.push(data);
                  this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
                 
                }else{

                  let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));                  
                  allItems.push(data);  
                  this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
                }

                this.router.navigate(['/menu']);
             
            }else{
                this.item = data;
                this.getTotalCost();
             }
            
          });
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

    //}
   
  }

  updateModifier(option_id, type, modifier_id) {
    
   
    if(this.item.ProductModifier.length > 0) {
     let isNoMod = false;
     let noModId = null;  
      for(var i = 0; i < this.item.ProductModifier.length; i++) {
        
        let options = this.item.ProductModifier[i].Modifier.ModifierOption;
        for(var j = 0; j < options.length; j++) {

            if(type == 'radio') {
              if(options[j].Option.id != option_id) {

                if(options[j].Modifier.id == modifier_id) {
                  ////////console.log(options[j].Option.name + ' first unchecked', options[j].Option);
                  options[j].Option.is_checked = false;
                }                
              }
            }

           

            if(options[j].Option.id == option_id) {
              
              options[j].Option.is_checked = !options[j].Option.is_checked;
              ////////console.log(123, options[j].Option);
              if(options[j].Option.is_checked && options[j].Option.no_modifier == 1) {
                isNoMod = true; 
                noModId = options[j].Option.id;
              }

              if(options[j].Option.OptionSuboption != undefined && options[j].Option.OptionSuboption.length > 0) {
                if(options[j].Option.is_checked == true) {                  
                  for(var n=0; n<options[j].Option.OptionSuboption.length; n++) {
                    if(n==0) {
                      options[j].Option.OptionSuboption[n].SubOption.is_active = true;
                    }else{
                      options[j].Option.OptionSuboption[n].SubOption.is_active = false;
                    }                    
                  }                 
                }else{
                  
                   for(var l=0; l<options[j].Option.OptionSuboption.length; l++) {
                    options[j].Option.OptionSuboption[l].SubOption.is_active = false;
                   } 
                }                
              }

              //hard code for pizza
              if(this.item.Product.category_id == '1' || this.item.Product.category_id == '8') {
                if(options[j].Option.dependent_modifier_option_id != null) {

                  let p_mod_id = options[j].Option.dependent_modifier_id; 
                  let p_op_id = options[j].Option.dependent_modifier_option_id;

                  for(var x=0; x<this.item.ProductModifier.length; x++) {
                    let p_options = this.item.ProductModifier[x].Modifier.ModifierOption;
                    for(var y=0; y<p_options.length; y++) {
                      
                      if(p_options[y].modifier_id == p_mod_id) {
                        if(p_options[y].Option.id == p_op_id) {
                          ////////////console.log(p_options[y].Option.name + ' checked');
                          p_options[y].Option.is_checked = true;
                          p_options[y].Option.subop_name = 'Full';

                        }else{
                          ////////////console.log(p_options[y].Option.name + ' unchecked');
                          p_options[y].Option.is_checked = false;
                                                   
                        }
                      }


                    }
                  }

                }
              }

              if(options[j].Option.is_checked == false) {
                options[j].Option.add_extra = false;
              }

            }
             
        }

        if(isNoMod) {            
            for(var t=0; t < options.length; t++) {   
                if(!options[t].Option.is_included_mod) {
                  if(noModId != options[t].Option.id) {
                    options[t].Option.is_checked = false;
                  }else{
                    options[t].Option.send_code = 0;
                  }
                }
            }            
        }
          

      }

      
      
      

    }
    
    let total = this.calculateTotalCost();
    
    if(total == 0 || isNaN(total)) {

      this.showAddToCart = false;
      this.dialogService.addDialog(MessageComponent, { title: 'Alert', message: 'This customization is not availabe!', buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true }); 

    }else{
      this.showAddToCart = true;
	/*
      if (this.isDeal) {
        this.totalCost = Number(parseFloat(this.item.Product.price).toFixed(2));
        this.item.originalItemCost = this.totalCost;
        this.item.totalItemCost = this.totalCost;
      } else {*/
        this.totalCost = total;
        this.item.originalItemCost = this.totalCost;
  
        if(this.item.Product.qty) {
            total = total*parseFloat(this.item.Product.qty);
        }
        this.item.totalItemCost = total;
      //}
      
    }

  }


  updateExtra(option_id, type, controlType) {
     
      //modifier    
      if(this.item.ProductModifier.length > 0) {
        for(var i = 0; i < this.item.ProductModifier.length; i++) {
          let options = this.item.ProductModifier[i].Modifier.ModifierOption;
          for(var j = 0; j < options.length; j++) {

              if(options[j].Option.id == option_id && type == 'modifier') {  
                options[j].Option.add_extra = !options[j].Option.add_extra;  
                
                if(options[j].Option.add_extra == true) {
                  options[j].Option.is_checked = true;

                  if(options[j].Option.OptionSuboption != undefined && options[j].Option.OptionSuboption.length > 0) {
                      
                        for(var n=0; n<options[j].Option.OptionSuboption.length; n++) {
                          if(n==0) {
                            options[j].Option.OptionSuboption[n].SubOption.is_active = true;
                          }else{
                            options[j].Option.OptionSuboption[n].SubOption.is_active = false;
                          }
                          
                        }
                      
                  }    
                }

                if(options[j].Option.add_extra == true) {
                  options[j].Option.send_code = 1;
                }else if(options[j].Option.add_extra == false && options[j].Option.is_checked == false ){
                  options[j].Option.send_code = 0;
                }
              }


          }
        }
      }

      /*
      if (this.isDeal) {
        this.totalCost = Number(parseFloat(this.dealItem.price).toFixed(2));
        this.item.originalItemCost = this.totalCost;
        this.item.totalItemCost = this.totalCost;
      } else { */
        let total = this.calculateTotalCost();
        
        this.totalCost = total;
        this.item.originalItemCost = this.totalCost;
  
        if(this.item.Product.qty) {
            total = total*parseFloat(this.item.Product.qty);
        }
  
        this.item.totalItemCost = total;
      //}

  }


  updateSubOption(mainPos, modOpPos, optionId, subOptionId) {
    ////////////console.log(this.item.ProductModifier, mainPos,modOpPos, optionId, subOptionId);
    for(var i=0; i<this.item.ProductModifier.length; i++) {
      if(i == mainPos) {
        let modOpt = this.item.ProductModifier[i].Modifier.ModifierOption;
        for(var j=0; j < modOpt.length; j++) {
          if(j == modOpPos) {
            let subOp = modOpt[j].Option.OptionSuboption;
            for(var k = 0; k < subOp.length; k++) {
              
              if(subOptionId == subOp[k].SubOption.id) {
                this.item.ProductModifier[i].Modifier.ModifierOption[j].Option.OptionSuboption[k].SubOption.is_active = true;

                this.item.ProductModifier[i].Modifier.ModifierOption[j].Option.subop_name = subOp[k].SubOption.name;

              }else{
                this.item.ProductModifier[i].Modifier.ModifierOption[j].Option.OptionSuboption[k].SubOption.is_active = false; 
              }
              if(this.item.ProductModifier[i].Modifier.ModifierOption[j].Option.is_checked == true) {
                this.item.ProductModifier[i].Modifier.ModifierOption[j].Option.send_code = 1;
              }
            }
            break;
          }
        }
        break;
      }
    }
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

  updateQuantity(type) {

    let total = 0;

    //increase
    if(type == 1) {
      this.item.Product.qty += 1;      
    }else{
      
      this.item.Product.qty = this.item.Product.qty - 1;
      if(this.item.Product.qty <= 0) {
        this.item.Product.qty = 1;
      }
    }
    
    total =  parseFloat(this.item.originalItemCost)*this.item.Product.qty;
    total = Number(total.toFixed(2));
    this.item.totalItemCost = total;
    this.totalCost = total;

    let overallCost = 0;
    let allItems = this.dataService.getLocalStorageData('allItems');
    if(allItems != null && allItems != 'null') {
      overallCost = this.utilService.calculateOverAllCost(allItems); 
    }else{
      overallCost = 0;
    }
    
    //this.netCost += overallCost;
   // //////////console.log(type, this.totalCost, this.items.Product.qty);
  }  


  checkout() {  
    let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
    if (allItems != null && allItems != undefined && allItems != 'null') {
      this.router.navigate(['/order-review']);
    } else {
      this.dialogService.addDialog(MessageComponent, { title: 'Alert', message: 'No Items in cart. Please add atleast 1 item in cart to proceed.', buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true }); 
      
    }    
  }


  add_to_cart() {
    
    if (this.isEdit) {

      let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));
      allItems[this.itemPos] = this.item;
      this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems));
      
    } else {

      if (this.isDeal) {
        this.item.Product['dealId'] = this.dealId;
        this.item.Product['comboUniqueId'] = this.comboUniqueId;
        this.item.Product['position'] = this.position;
      }

      if(this.dataService.getLocalStorageData('allItems') != null
          && this.dataService.getLocalStorageData('allItems') != 'null') {
        let allItems = JSON.parse(this.dataService.getLocalStorageData('allItems'));

        allItems.push(this.item);  
        this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
      }else{
        let allItems = [];
        allItems.push(this.item);
        this.dataService.setLocalStorageData('allItems', JSON.stringify(allItems)); 
      } 
    }

    this.dataService.setLocalStorageData('totalCost', this.totalCost);
    let selectedMenuCat = this.dataService.getLocalStorageData('selectedMenuCat');

    if (this.isDeal) {
      this.router.navigate(['/deals', this.dealId, this.comboUniqueId]);
    } else {
      if (selectedMenuCat != null) {
        this.router.navigate(['/menu', selectedMenuCat]);   
      } else {
        this.router.navigate(['/menu']);
      }
    }
        
  }


  addToFav() {
    if(this.is_fav == false) {

      let isLoggedIn = this.dataService.getLocalStorageData('isLoggedIn');
      if(isLoggedIn == undefined || isLoggedIn == 'false') {
        //do login
         this.dialogService.addDialog(LoginComponent, {  }, { closeByClickingOutside:true });
      }else{
        //add fav
        // let userDetails = JSON.parse(this.dataService.getLocalStorageData('user-details'));
        // let userId = userDetails.id;
        // this.dataService.saveFavItem(userId, this.item)
        //   .subscribe(data => {
        //       //////////console.log(data);
        //   });

        this.dialogService.addDialog(FavmodalComponent, { item: this.item, type: 'item'  }, { closeByClickingOutside:true });
      }
    }
  }


  backToDealPage() {
    this.router.navigate(['/deals', this.dealId,this.dealCode]); 
  }



}
