<?php
App::uses('AppController', 'Controller');
class WebserviceController extends AppController {
    public $uses = array('Country','Category','Question','Content','Language','Slide','SubCategory','Product','ProductModifier','Modifier','Option','SubOption','ModiferOption','ProductIncludedModifier','Store','OptionSuboption','Orderlog','EmailTemplate','Couponlog','Location','LocationStreet', 'Deal','DealItem');
    public $components=array('Core','Email');

    function beforeFilter(){
        parent::beforeFilter();
		// Configure::write('debug', 2);
        $this->Auth->allow(array('get_countries','get_categories','getPageInfo','getip','sendApplyInfo','get_languages','get_slides','get_slides_app','get_sub_categories','get_products','get_modifiers','get_options','get_suboptions','getImagePath','get_all_categories_data', 'get_all_categories_data_app','getItemData','placeOrder','getStoreList','getStoresFromPostalCode', 'getStoresFromLatLong','getStoreDetails','login','getTwitterFeeds','getInstagramPost','getCountryStores','saveFavItem','getCitiesSuggestion','getCitiesSuggestionApp','getFBFeed','getIGFeed','getPrefrences','signUp', 'getFav', 'getFavItemData','applyCoupon','getFavOrderData','getProfile','sendCateringInfo','sendContactInfo','sendCareerInfo','getOrderHistory','updateProfile','getProductNameByPlu','getModifierName','updatePrefrence','addAddress','deleteAddress','editAddress','setAsDefault','getUserPrefreces','getAreaSuggestion','testUrl', 'getStoreDetailsByStoreId','forgot_password','reset_password','getReOrderData','sendAckEmail','uploadAttachment', 'sendPaymentData', 'getDealItemList','getCategoryData'));
    }

	public function get_countries(){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
		$countries = $this->Country->find('all');
        echo json_encode($countries);
    }

    public function get_categories($count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
		
        $this->paginate = array(
            'conditions' => array(
                'Category.status' => 1
            ),
            'limit' => $count
        );
		
        echo json_encode($this->paginate('Category'));
    }

    function getip(){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
          $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if(getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if(getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if(getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if(getenv('HTTP_FORWARDED'))
           $ipaddress = getenv('HTTP_FORWARDED');
        else if(getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'UNKNOWN';
		
		//$ipaddress = '72.229.28.185';  //USA
		//$ipaddress = '5.32.77.202'; //Dubai
		
		$url = "http://www.geoplugin.net/json.gp?ip=".$ipaddress;
		$response = $this->curlGetRequest($url);
		$response = json_decode($response);
        echo json_encode((array) $response);
    }

     public function get_languages($count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
        $this->paginate = array(
            'conditions' => array(
                'status' => 1
            ),
            'limit' => $count
        );
        echo json_encode($this->paginate('Language'));
    }

    public function get_slides($lang_id = 1){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
		
		$slides = $this->Slide->find('all', array('conditions' => array(
								'lang_id' => $lang_id,
								'status' => 'Active'
					)));
		
		// print_r($slides);  die;
		// $slideList = array();
		// foreach ($slides as $key => $value) {
		// 	$data = array();
		// 	foreach ($value['Slide'] as $k => $v) {
		// 		$data['Slide'][$k] = stripcslashes($v);
		// 	}
		// 	$slideList[] =  $data;
		// 	// code...
		// }
		// // print_r($slideList); die;
        echo json_encode($slides); die;
		
    }

    public function get_slides_app($lang_id = 1){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
		$fields = array('id','lang_id','slide_title','slide_link','coupon_applicable','coupon_code','image','text_image','status');
		$slides = $this->Slide->find('all', array('fields'=>$fields,'conditions' => array(
								'lang_id' => $lang_id,
								'status' => 'Active'
					)));
		
		$slideList = array();
		foreach ($slides as $key => $value) {
			$data = array();
			foreach ($value['Slide'] as $k => $v) {
				$data['Slide'][$k] = $v;
			}
			$slideList[] =  $data;
		}
		
        echo json_encode(array('slideList'=>$slideList)); die;
		
    }

    public function get_sub_categories($count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
        $this->paginate = array(
            'conditions' => array(
                'SubCategory.status' => 1
            ),
            'limit' => $count
        );
        echo json_encode($this->paginate('SubCategory'));
    }

    public function get_products($count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
        $this->Product->bindModel(array('hasMany'=>array('ProductModifier')));
        $this->ProductModifier->bindModel(array('belongsTo'=>array('Modifier','Option'=>array('foreignKey' => false,'type'=>'RIGHT','conditions' => array('ProductModifier.default_option_id = Option.id')
                                ))));
        $this->Product->recursive = 2;
        $this->paginate = array(
            'conditions' => array(
                'Product.status' => 1
            ),
            'limit' => $count
        );
        $products = $this->paginate('Product');
        echo json_encode($products);
    }

    public function get_modifiers($id=null,$count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
        
        if(isset($id)){
            $conditions = array(
                'Modifier.status' => 1,
                'Modifier.id' => $id,
            );
        }else{
           $conditions = array(
                'Modifier.status' => 1,
            ); 
        }
        $this->paginate = array(
            'conditions' => $conditions,
            'limit' => $count
        );
        echo json_encode($this->paginate('Modifier'));
    }

    public function get_options($id=null,$count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
        
        if(isset($id)){
            $conditions = array(
                'Option.status' => 1,
                'Option.id' => $id,
            );
        }else{
           $conditions = array(
                'Option.status' => 1,
            ); 
        }
        $this->paginate = array(
            'conditions' => $conditions,
            'limit' => $count
        );
        echo json_encode($this->paginate('Option'));
    }

    public function get_suboptions($id=null,$count=10){
        $this->layout = FALSE;
        $this->autoRender = FALSE;
        
        if(isset($id)){
            $conditions = array(
                'SubOption.status' => 1,
                'SubOption.id' => $id,
            );
        }else{
           $conditions = array(
                'SubOption.status' => 1,
            ); 
        }
        $this->paginate = array(
            'conditions' => $conditions,
            'limit' => $count
        );
        echo json_encode($this->paginate('SubOption'));
    }
	
	
	public function get_all_categories_data($storeId = 1, $menuCountry = 'UK'){
		
		//Configure::write('debug', 2);
        $this->layout = FALSE;
        $this->autoRender = FALSE;
		$this->Category->recursive = 2;
		
		$this->Category->bindModel(array('hasMany'=>array(
								'Product' => array(
										'conditions' => array('Product.status' => 1, 'Product.lang_id !=' => 0),
										'fields' => array(
														'Product.id', 'Product.lang_id','Product.category_id',
														'Product.sub_category_id', 'Product.short_description', 'Product.plu_code',
														'Product.title', 'Product.price_title', 'Product.slug','Product.price','Product.image',
														'Product.thumb_image','Product.sort_order','groupv','grouph','groupvh'
														
												),
										'order' => array('Product.sort_order' => 'asc')		
								)
						)));
						
		$this->Product->bindModel(array(
									'belongsTo' => array(
										'SubCategory' => array(
											'ClassName' => 'SubCategory',
											'foreignKey' => 'sub_category_id',
											'conditions' => array('SubCategory.status' => 1),
											'fields' => array(
													'SubCategory.id','SubCategory.lang_id','SubCategory.store_id','SubCategory.cat_id','SubCategory.name','SubCategory.slug','SubCategory.short_description','SubCategory.sort_order','SubCategory.image','SubCategory.status'
												),
											'order' => array('SubCategory.sort_order' => 'asc')	
										)
									),
									'hasMany' => array(
										'ProductModifier' => array(
											'className' => 'ProductModifier',
											'foreignKey' => 'product_id',
											'fields' => array('ProductModifier.id')
										)
									)
								));
        
		
									
		$data = $this->Category->find('all', array('conditions' => array(
														'Category.status' => 1,
														'Category.lang_id' => $storeId)
												));
		
		//echo '<pre>'; print_r($data); die;
		//$plu_json = $this->curlGetRequest('https://nkdpizza.com/beta/pos/index.php/menu/'.$menuCountry);
		
		$plu_json = $this->curlGetRequest(APIURL.'/index.php/menu/UK');
		$plu_json = json_decode($plu_json, true);
		//echo '<pre>'; print_r($plu_json); die;
		$plu_json = $plu_json['item'];
		$resp = array();
		$all_categories = $cats = $subCats = array();
		
		if(!empty($data)){
			$i = 0;
			foreach($data as $dat) {
				
				if ($dat['Category']['slug'] != 'meal-deals') {
					if(!in_array($dat['Category']['name'], $all_categories)) {
						$cats[$i]['id'] = $dat['Category']['id'];
						$cats[$i]['type'] = 'category';
						$cats[$i]['name'] = $dat['Category']['name'];
						$cats[$i]['subCats'] = array();
						$cats[$i]['products'] = array();
						$cats[$i]['subCatsName'] = array();
						$all_categories[] = $dat['Category']['name'];
					}
					
					
					if(!empty($dat['Product'])) {
						$j = 0; $count = array();
						foreach($dat['Product'] as $prod) {
							
							$prod['is_price_mapped'] = 0;
							$prod['mod_count'] = count($prod['ProductModifier']);
							unset($prod['ProductModifier']);
							
							//map price of product using plu code
							if(!empty($plu_json)) {
								foreach($plu_json as $pluData) {
									//echo '<pre>'; print_r($pluData); die;
									foreach($pluData as $pdat) {
										//echo '<pre>'; print_r($pdat); 
										if($dat['Category']['id'] == '1' || $dat['Category']['id'] == '8') {
											
											if($prod['plu_code'] == 999999) {
												$prod['is_price_mapped'] = 1;
												$prod['price'] = $prod['price_title'];	
											}else{
												
												if(is_array($pdat)) {
													foreach($pdat as $pz) {
														if(isset($pz['PLU'])) {
															if($prod['plu_code'] == $pz['PLU']) {
																$prod['is_price_mapped'] = 1;

																if ($prod['plu_code'] == '289' || $prod['plu_code'] == '290') {
																	$prod['price'] = '£'.$pz['PriceSm'];
																} else {
																	$prod['price'] = array(
																		'small' => $pz['PriceSm'],
																		'medium' => $pz['PriceMed'],
																		'large' => $pz['PriceLg']
																	);
																}
																
															}	
														}
													}
												}
												
											}
											
											
										}else{
											if(isset($pdat['PLU'])) {
												
												if($prod['plu_code'] == $pdat['PLU']) {
													
													$prod['is_price_mapped'] = 1;
													$prod['price'] = '£'.$pdat['Price'];
												}	
											}
										}									
									}								
								}
							}
							
							//echo '<pre>'; print_r($prod); die;
							if(!empty($prod['sub_category_id'])){
								
								if(!in_array($prod['SubCategory']['name'], $cats[$i]['subCatsName'])) {
									$cats[$i]['subCatsName'][] = $prod['SubCategory']['name'];
									$cats[$i]['subCatsPrice'][] = $prod['SubCategory']['short_description'];
								}
								
								
								if(!isset($count[$prod['SubCategory']['name']])) {
									$count[$prod['SubCategory']['name']] = 0;
								}
								
								$sName = $prod['SubCategory'];
								unset($prod['SubCategory']);
								unset($prod['created']);
								unset($prod['modified']);
								
								$cats[$i]['subCats'][$sName['name']][$count[$sName['name']]]['name'] = $sName['name'];
								$cats[$i]['subCats'][$sName['name']][$count[$sName['name']]]['products'][] = $prod;
								
								$count[$sName['name']] +=1;
							}else{
								$cats[$i]['products'][] = $prod;
							}
							
							$j++;
						}
					}

				} else {
					//meal deals

					// $this->Deal->bindModel(array(
					// 	'hasMany' => array(
					// 		'DealItem' => array(
					// 			'className' => 'DealItem',
					// 			'foreignKey' => 'deal_id'
					// 		)
					// 	)
					// ));


					$alldeals = $this->Deal->find('all', array('conditions' => array(
											'Deal.status' => 1,
											'Deal.store_id' => $storeId
										)));
					
					$cats[$i]['id'] = $dat['Category']['id'];
					$cats[$i]['type'] = 'deal';
					$cats[$i]['name'] = $dat['Category']['name'];
					$cats[$i]['products'] = $alldeals; 
					$cats[$i]['subCats'] = array();
					$cats[$i]['subCatsName'] = array();
					$all_categories[] = $dat['Category']['name'];
					//echo '<pre>'; print_r($alldeals); die;
				}
				
				
				$i++;			
			}
		}
			
		
		//die;
		//echo '<pre>'; print_r($cats); die;
        echo json_encode($cats); die;
    }
	

	public function get_all_categories_data_app($storeId = 1, $menuCountry = 'UK'){
		
		//Configure::write('debug', 2);
        $this->layout = FALSE;
        $this->autoRender = FALSE;
		$this->Category->recursive = 2;
		
		$this->Category->bindModel(array('hasMany'=>array(
								'Product' => array(
										'conditions' => array('Product.status' => 1, 'Product.lang_id !=' => 0),
										'fields' => array(
														'Product.id', 'Product.lang_id','Product.category_id',
														'Product.sub_category_id', 'Product.short_description', 'Product.plu_code',
														'Product.title', 'Product.price_title', 'Product.slug','Product.price','Product.image',
														'Product.thumb_image','Product.sort_order','groupv','grouph','groupvh'
														
												),
										'order' => array('Product.sort_order' => 'asc')		
								)
						)));
						
		$this->Product->bindModel(array(
									'belongsTo' => array(
										'SubCategory' => array(
											'ClassName' => 'SubCategory',
											'foreignKey' => 'sub_category_id',
											'conditions' => array('SubCategory.status' => 1),
											'fields' => array(
													'SubCategory.id','SubCategory.lang_id','SubCategory.store_id','SubCategory.cat_id','SubCategory.name','SubCategory.slug','SubCategory.short_description','SubCategory.sort_order','SubCategory.image','SubCategory.status'
												),
											'order' => array('SubCategory.sort_order' => 'asc')	
										)
									),
									'hasMany' => array(
										'ProductModifier' => array(
											'className' => 'ProductModifier',
											'foreignKey' => 'product_id',
											'fields' => array('ProductModifier.id')
										)
									)
								));
        
		
									
		$data = $this->Category->find('all', array('conditions' => array(
														'Category.status' => 1,
														'Category.lang_id' => $storeId)
												));
		
		//echo '<pre>'; print_r($data); die;
		//$plu_json = $this->curlGetRequest('https://nkdpizza.com/beta/pos/index.php/menu/'.$menuCountry);
		
		$plu_json = $this->curlGetRequest(APIURL.'/index.php/menu/UK');
		$plu_json = json_decode($plu_json, true);
		//echo '<pre>'; print_r($plu_json); die;
		$plu_json = $plu_json['item'];
		$resp = array();
		$all_categories = $cats = $subCats = array();
		
		if(!empty($data)){
			$i = 0;
			foreach($data as $dat) {
				
				if ($dat['Category']['slug'] != 'meal-deals') {
					if(!in_array($dat['Category']['name'], $all_categories)) {
						$cats[$i]['id'] = $dat['Category']['id'];
						$cats[$i]['type'] = 'category';
						$cats[$i]['name'] = $dat['Category']['name'];
						$cats[$i]['subCats'] = null;
						$cats[$i]['products'] = array();
						$cats[$i]['subCatsName'] = array();
						$all_categories[] = $dat['Category']['name'];
					}
					
					
					if(!empty($dat['Product'])) {
						$j = 0; $count = array();
						$subIndexArr = array();
						$totSubIndex = 0;
						foreach($dat['Product'] as $prod) {
							
							$prod['is_price_mapped'] = 0;
							$prod['mod_count'] = count($prod['ProductModifier']);
							unset($prod['ProductModifier']);
							
							//map price of product using plu code
							if(!empty($plu_json)) {
								foreach($plu_json as $pluData) {
									//echo '<pre>'; print_r($pluData); die;
									foreach($pluData as $pdat) {
										//echo '<pre>'; print_r($pdat); 
										if($dat['Category']['id'] == '1' || $dat['Category']['id'] == '8') {
											
											if($prod['plu_code'] == 999999) {
												$prod['is_price_mapped'] = 1;
												$prod['price'] = $prod['price_title'];	
											}else{
												
												if(is_array($pdat)) {
													foreach($pdat as $pz) {
														if(isset($pz['PLU'])) {
															if($prod['plu_code'] == $pz['PLU']) {
																$prod['is_price_mapped'] = 1;

																if ($prod['plu_code'] == '289' || $prod['plu_code'] == '290') {
																	$prod['price'] = '£'.$pz['PriceSm'];
																} else {
																	$prod['price'] = array(
																		'small' => $pz['PriceSm'],
																		'medium' => $pz['PriceMed'],
																		'large' => $pz['PriceLg']
																	);
																}
																
															}	
														}
													}
												}
												
											}
											
											
										}else{
											if(isset($pdat['PLU'])) {
												
												if($prod['plu_code'] == $pdat['PLU']) {
													
													$prod['is_price_mapped'] = 1;
													$prod['price'] = '£'.$pdat['Price'];
												}	
											}
										}									
									}								
								}
							}
							
							//echo '<pre>'; print_r($prod); die;
							if(!empty($prod['sub_category_id'])){
								
								if(!in_array($prod['SubCategory']['name'], $cats[$i]['subCatsName'])) {
									$cats[$i]['subCatsName'][] = $prod['SubCategory']['name'];
									$cats[$i]['subCatsPrice'][] = $prod['SubCategory']['short_description'];
								} 
								
								
								$subIndex = array_search($prod['SubCategory']['name'], $cats[$i]['subCatsName']);
								$tname = 'subCat_'.$subIndex;
								
								
								
								if(!isset($count[$prod['SubCategory']['name']])) {
									$count[$prod['SubCategory']['name']] = 0;
								}
								
								$sName = $prod['SubCategory'];
								unset($prod['SubCategory']);
								unset($prod['created']);
								unset($prod['modified']);
								
								//$tName = preg_replace("![^a-z0-9]+!i", "-", $sName['name']);
								
								$cats[$i]['subCats'][$tname][$count[$sName['name']]]['name'] = $sName['name'];
								$cats[$i]['subCats'][$tname][$count[$sName['name']]]['products'][] = $prod;
								
								$count[$sName['name']] +=1;
							}else{
								$cats[$i]['products'][] = $prod;
							}
							
							$j++;
						}
					}

				} else {
					//meal deals

					// $this->Deal->bindModel(array(
					// 	'hasMany' => array(
					// 		'DealItem' => array(
					// 			'className' => 'DealItem',
					// 			'foreignKey' => 'deal_id'
					// 		)
					// 	)
					// ));

					$tempData = array();
					$alldeals = $this->Deal->find('all', array('conditions' => array(
											'Deal.status' => 1,
											'Deal.store_id' => $storeId
										)));

					$p=0;					
					foreach ($alldeals as $key => $value) {
						$value['Deal']['image'] = 'img/admin/products/deals/'.$value['Deal']['image'];
						$value['Deal']['thumbnail'] = 'img/admin/products/deals/'.$value['Deal']['thumbnail'];
						$tempData[] = $value['Deal'];
						$p++;
					}
					$alldeals = $tempData;

					$cats[$i]['id'] = $dat['Category']['id'];
					$cats[$i]['type'] = 'deal';
					$cats[$i]['name'] = $dat['Category']['name'];
					$cats[$i]['products'] = $alldeals; 
					$cats[$i]['subCats'] = null;
					$cats[$i]['subCatsName'] = array();
					$all_categories[] = $dat['Category']['name'];
					//echo '<pre>'; print_r($alldeals); die;
				}
				
				
				$i++;			
			}
		}
			
		
		//die;
		// echo '<pre>'; print_r($cats); die;
        echo json_encode(array('itemList'=>$cats)); die;
    }
	

	
	public function getItemData($slug = '', $menuCountry = 'UK') {
		//Configure::write('debug', 2);
		if($slug != '') {
			
			$item = $this->getFormattedItemData($slug, $menuCountry);
			//echo '<pre>'; print_r($item); die;
			echo json_encode($item); die;
		}
	}
    
	
	public function getFormattedItemData($slug, $menuCountry = 'UK') {
		$this->Product->recursive = 6;
			
			$this->OptionSuboption->bindModel(array(
								'belongsTo' => array(
									'SubOption' => array(
										'className' => 'SubOption',
										'foreignKey' => 'suboption_id'
									)
								)
							));
			
			$this->ModiferOption->bindModel(array(
								'belongsTo' => array(
									'Option' => array(
										'className' => 'Option',
										'foreignKey' => 'option_id',
										'conditions' => array('Option.status' => 1),
										'fields' => array(
												'Option.id','Option.lang_id','Option.store_id','Option.name','Option.plu_code','Option.image','Option.sort_order','Option.dependent_modifier_id','Option.dependent_modifier_option_id','Option.dependent_modifier_count'
											
										),
										'order' => array('Option.sort_order' => 'asc', 'Option.no_modifier' => 'asc')
									)
								)
							));
			
			$this->Modifier->bindModel(array(
								'hasMany' => array(
									'ModifierOption' => array(
										'className' => 'ModifierOption',
										'foreignKey' => 'modifier_id',
										'fields' => array(
												'ModifierOption.id', 'ModifierOption.modifier_id', 'ModifierOption.option_id'
										)
									)
								)
							));
			
			$this->ProductModifier->bindModel(array(
								'belongsTo' => array(
										'Modifier' => array(
											'className' => 'Modifier',
											'foreignKey' => 'modifier_id',
											'conditions' => array('Modifier.status' => 1),
											'fields' => array(
													'Modifier.id','Modifier.lang_id','Modifier.store_id','Modifier.title','Modifier.image','Modifier.short_description','Modifier.sort_order','Modifier.status'											
											 ),
											 'order' => array('Modifier.sort_order' => 'asc')
										)
								)
							));
			
			$this->ProductIncludedModifier->bindModel(array(
								'belongsTo' => array(
									'ModifierOption' => array(
										'className' => 'ModifierOption',
										'foreignKey' => 'modifier_option_id'
									)
								)							
							));
			
			$this->Product->bindModel(array(
								'hasMany' => array(
											'ProductModifier' => array(
												'className' => 'ProductModifier',
												'foreignKey' => 'product_id',
												'fields' => array(
														'ProductModifier.id','ProductModifier.product_id','ProductModifier.modifier_id','ProductModifier.default_option_id','ProductModifier.store_id','ProductModifier.lang_id','ProductModifier.is_required','ProductModifier.choice','ProductModifier.min_choice','ProductModifier.max_choice','ProductModifier.max_choice',
														'ProductModifier.free'
													),
												'order' => 'ProductModifier.sort_order ASC'	
											),
											'ProductIncludedModifier' => array(
												'className' => 'ProductIncludedModifier',
												'foreignKey' => 'product_id'
											)
										)
							));
			$item = $this->Product->find('first', array(
											'conditions' => array('Product.slug' => $slug),
											'fields' => array(
												'Product.id', 'Product.lang_id','Product.category_id',
												'Product.sub_category_id', 'Product.short_description', 'Product.plu_code', 'Product.title', 'Product.price_title', 'Product.slug','Product.price','Product.image',
												'Product.thumb_image','Product.sort_order'
											)
										));
			
			//$plu_json = $this->curlGetRequest('https://nkdpizza.com/beta/pos/index.php/menu/'.$menuCountry);
			$plu_json = $this->curlGetRequest(APIURL.'/index.php/menu/UK');
			$plu_json = json_decode($plu_json, true);
			
			
			if(!empty($item)) {
				
				$item['Product']['price'] = 0;
				
				//map price of product
				foreach($plu_json['item'] as $plu_item) {	
					foreach($plu_item as $pt) {	
						//echo '<pre>'; print_r($pt); die;						
						if($item['Product']['category_id'] == 1 || $item['Product']['category_id'] == 8) {		
							

							foreach($pt as $pti) {
								if(isset($pti['PLU']) && ($pti['PLU'] == $item['Product']['plu_code'])) {
									if(isset($pti['Price'])) {
										$item['Product']['price'] = $pti['Price'];
									}else if(isset($pti['PriceSm'])) {

										if ($pti['PLU'] == 289 || $pti['PLU'] == 290) {
											$item['Product']['price'] = $pti['PriceSm'];
										} else {
											$item['Product']['price'] = array(
												'small' => $pti['PriceSm'],
												'medium' => $pti['PriceMed'],
												'large' => $pti['PriceLg']	
											);
										}

										
									}	
								}
							}								
							
						}else{
							if(isset($pt['PLU']) && ($pt['PLU'] == $item['Product']['plu_code'])) {
									$item['Product']['price'] = $pt['Price'];
							}
						}					
					}								
				}  
				
				
				
				$item['Product']['qty'] = 1;	
				
				
				if(!empty($item['ProductIncludedModifier'])) {					
					$i = 0;
					$includedArr = array();					
					foreach($item['ProductIncludedModifier'] as $pim) {						
						if(!empty($pim['ModifierOption'])) {
							$includedArr[$pim['ModifierOption']['modifier_id']]['title'] = $pim['ModifierOption']['Modifier']['title'];
							$includedArr[$pim['ModifierOption']['modifier_id']]['option'][] = $pim['ModifierOption']['Option'];	
							$i++;	
						}						
					}
					
					//map prices of included modifier using plu
					if(!empty($includedArr)) {
						foreach($includedArr as $key => $ia) {
							$i = 0;
							foreach($ia['option'] as $opt) {
								foreach($plu_json['modifier'] as $plu_mod) {
									foreach($plu_mod as $pl_m) {
										if($pl_m['PLU'] == $opt['plu_code']) {
											if(isset($pl_m['Price'])) {
												$price = $pl_m['Price'];
											}else if(isset($pl_m['PriceSm'])){
												$price = array(
													'small' => $pl_m['PriceSm'],
													'medium' => $pl_m['PriceMed'],
													'large' => $pl_m['PriceLg']
												);
											}	
											$includedArr[$key]['option'][$i]['price'] = $price;
											$includedArr[$key]['option'][$i]['send_code'] = '';
											$includedArr[$key]['option'][$i]['add_extra'] = false;
											$includedArr[$key]['option'][$i]['default_checked'] = true;
											$includedArr[$key]['option'][$i]['is_checked'] = true;
											$i++;
										}
									}
								}								
							}						
						}						
					}
					
					$iArr = array();
					if(!empty($includedArr)) {
						$i = 0;
						foreach($includedArr as $arr) {
							$iArr[$i] = $arr;
							$i++;
						}
					}
					
					$item['ProductIncludedModifier'] = $iArr;
				}
				
				//map modifier price				
				if(!empty($item['ProductModifier'])) {	
					$i = 0;
					foreach($item['ProductModifier'] as $pm) {
						$j = 0;
						foreach($pm['Modifier']['ModifierOption'] as $mo) {
							
							unset($mo['Modifier']['ModifierOption']);
							unset($item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Modifier']['ModifierOption']);
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_checked'] = false;
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['default_checked'] = false;
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['send_code'] = '';
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['add_extra'] = false;
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['quantity'] = 1;
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_included_mod'] = false;
							
							$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['send_code_permanent'] = false;
							
							if($item['Product']['category_id'] == 1) {
								$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['subop_name'] = 'Full';
							}
							
							//add param if it is included modifier
							if(!empty($item['ProductIncludedModifier'])) {
								foreach($item['ProductIncludedModifier'] as $includedPm) {
									foreach($includedPm['option'] as $ipmOP) {
									
										if($ipmOP['plu_code'] == $mo['Option']['plu_code']) {
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_checked'] = true;								
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['default_checked'] = true;								
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_included_mod'] = true;
										}
									}
								}
							}
							
							if(!empty($mo['Option']['OptionSuboption'])) {
								$n = 0;
								foreach($mo['Option']['OptionSuboption'] as $sop) {
									if($item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['OptionSuboption'][$n]['SubOption']['name'] == 'Full') {
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['OptionSuboption'][$n]['SubOption']['is_active'] = true;	
									}else{
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['OptionSuboption'][$n]['SubOption']['is_active'] = false;
									}									
									$n++;
								}
							}
							
							if($item['Product']['category_id'] == 1) {
								
								$loopArr = $plu_json['modifier'];
								if($item['Product']['plu_code'] == 999999) {
									$loopArr = $plu_json['item'];	
								}
								
								
								foreach($loopArr as $plu_mod) {
									foreach($plu_mod as $pl_m) {
										if($item['Product']['plu_code'] == 999999) {
											foreach($pl_m as $cyo) {
												if(isset($cyo['PLU'])) {
													if($cyo['PLU'] == $mo['Option']['plu_code']) {
																							
														if(isset($cyo['Price'])) {
															$price = $cyo['Price'];
															$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = $price;
														}else if(isset($cyo['PriceSm'])){
															$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = array(
																'small' => $cyo['PriceSm'],
																'medium' => $cyo['PriceMed'],
																'large' => $cyo['PriceLg']
															);
														}												
													}
												}
												
											}
											
											//echo '<pre>'; print_r(); die;
											
										}else{	
																											
											if($pl_m['PLU'] == $mo['Option']['plu_code']) {
																							
												if(isset($pl_m['Price'])) {
													$price = $pl_m['Price'];
													$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = $price;
												}else if(isset($pl_m['PriceSm'])){
													$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = array(
														'small' => $pl_m['PriceSm'],
														'medium' => $pl_m['PriceMed'],
														'large' => $pl_m['PriceLg']
													);
												}	
												
												//$mo['price'] = $pl_m['Price'];
											}
										}
									}
								}	
								
								
								//loop to get values of crust for pizza other than cyo
								foreach($plu_json['item'] as $plu_mod) {
									foreach($plu_mod as $pl_m) {
																								
										foreach($pl_m as $cyo) {											
											if(isset($cyo['PLU'])) {
												if($cyo['PLU'] == $mo['Option']['plu_code']) {
												
													if(isset($cyo['Price'])) {
														$price = $cyo['Price'];
														$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = $price;
													}else if(isset($cyo['PriceSm'])){
														$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = array(
															'small' => $cyo['PriceSm'],
															'medium' => $cyo['PriceMed'],
															'large' => $cyo['PriceLg']
														);
													}												
												}	
											}	
											
										}
										
									}
								}
							}
										
							
							foreach($plu_json['modifier'] as $plu_mod) {
								foreach($plu_mod as $pl_m) {
																			
										if($pl_m['PLU'] == $mo['Option']['plu_code']) {
										
											if(isset($pl_m['Price'])) {
												$price = $pl_m['Price'];
											}else if(isset($pl_m['PriceSm'])){
												$price = array(
													'small' => $pl_m['PriceSm'],
													'medium' => $pl_m['PriceMed'],
													'large' => $pl_m['PriceLg']
												);
											}	
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['price'] = $price;
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_topping'] = true;
											//$mo['price'] = $pl_m['Price'];
										}	
								}
							}
							$j++;			
						}
						$i++;	
					}
				}				
			}
			
			$item['ProductIncludedModifier'] = array();
			//unset($item['ProductIncludedModifier']);
			return $item;
	}
	
	
	public function placeOrder() {
		
		$data = $this->request->input ( 'json_decode', true) ;
		if(!empty($data)) {
			
			$arr = array();
			
			if(!empty($data['order_details'])) {
				$data['order_details'] = $this->formatPlaceOrderData($data);
			}			
			
			$latlong = '';
			if(isset($data['latlong']) && !empty($data['latlong'])) {
				$latlong = $data['latlong'];
			}
			
			unset($data['latlong']);
			
			$this->Orderlog->create();
			$this->Orderlog->save(array('latlong' => $latlong,'data' => json_encode($data)));
			
			$url = APIURL.'/index.php/placeOrder';
			$result     = $this->curlPostRequest($url, $data);
			$response = array( 'response' =>  $result, 'message' => 'success');
			echo json_encode($response); die;
			
		}
		
		die;
	}
	
	
	public function formatPlaceOrderData($data) {
		
		if(!empty($data['order_details'])) {
			
			$i = 0;
			$pArr = array();
						
			foreach($data['order_details'] as $ord) {
				
				if($ord['category_id'] == 1) {						
					
					$pizzaArr = array(
						'modifier' => array()
					);		

					if (isset($ord['dealId'])) {
						$pizzaArr['dealId'] = $ord['dealId'];
					}
					
					if (isset($ord['comboUniqueId'])) {
						$pizzaArr['comboUniqueId'] = $ord['comboUniqueId'];
					}
					
					if(isset($ord['modifier']) && !empty($ord['modifier'])) {
						foreach($ord['modifier'] as $mod) {
							if($mod['plu'] == 'I100' || $mod['plu'] == 'I101' || $mod['plu'] == '217') {
								$pizzaArr['plu'] = $mod['plu'];	
								$pizzaArr['quantity'] = $ord['quantity'];	
							}else{
								unset($mod['send_code']);
								unset($mod['quantity']);
								unset($mod['is_checked']);
								$pizzaArr['modifier'][] = $mod;
							}
						}
					}
					
					
					$prod = array(
						'add_extra' => false,
						'choice' => "Full",
						'modifier_type' => 'modifier',
						'plu' => $ord['plu'],
						'type' => '1'
					);
					
					
					
					$pizzaArr['modifier'][] = $prod;
					
					$data['order_details'][$i] = $pizzaArr;
					
				}else{
					
					$otherArr = $ord;
					$m=0;
					if(isset($ord['modifier']) && !empty($ord['modifier'])) {
						foreach($ord['modifier'] as $modOther) {							
							unset($modOther['send_code']);
							unset($modOther['quantity']);
							unset($modOther['is_checked']);
							$otherArr['modifier'][$m] = $modOther;
							$m++;
						}
					}	
					
					$data['order_details'][$i] = $otherArr;
				}	
				unset($data['order_details'][$i]['category_id']);
				
				$arr = array();
				if(isset($data['order_details'][$i]['modifier']) && !empty($data['order_details'][$i]['modifier'])) {
					$j = 0;
					
					foreach($data['order_details'][$i]['modifier'] as $mod) {
						$arr[$i][$mod['choice']][$j] = $mod;
						$j++;
					}
					
					$data['order_details'][$i]['modifier'] = $arr[$i];
				}
				
				$i++;					
			}
			
		}
		//echo '<pre>'; print_r($data['order_details']); die;
		return $data['order_details'];
		
	}

	
	public function getStoreList($city) {
		//Configure::write('debug', 2);
		if(!empty($city)) {
			
			$city = explode(',', $city);
			$city = $city[0];
			
			$stores = $this->Store->find('all', array(							
								'conditions' => array(
									'OR' => array(
										'LOWER(Store.city) LIKE' => '%'.$city.'%',
										'LOWER(Store.state) LIKE' => '%'.$city.'%'
									),
									'Store.status' => 1	
								),
								'fields' => array(
									'Store.id', 'Store.store_id', 'Store.store_name', 'Store.store_address', 'Store.store_ip_address', 'Store.store_image', 'Store.store_phone', 'Store.store_email', 'Store.city', 'Store.state', 'Store.country', 'Store.zip', 'Store.latitude', 'Store.longitude', 'Store.delivery_radius'
								),
								'order' => array('Store.store_name' => 'asc')
							));
			
			$already = array();	
			$allStores = array();
			
			if(!empty($stores)) {
				foreach($stores as $st) {
					if(!in_array($st['Store']['store_name'], $already)) {
						$allStores[] = $st;
						$already[] = $st['Store']['store_name'];
					}
				}
			}				
			
				
			echo json_encode($allStores); die;
			
		}	
		
	}
	
	
	public function getStoresFromPostalCode($code) {
		
		if($code != '') {
			
			$url = 'http://maps.googleapis.com/maps/api/geocode/json?address='.$code;			
			$result     = $this->curlGetRequest($url);
			$response   = json_decode($result, true);
			$stores = array();
			$allStores = array();
			
			if($response['status'] == 'OK') {
				
				for ($i=0; $i < count($response['results'][0]['address_components']); $i++) {
					$var = $response['results'][0]['address_components'][$i];
					if (in_array('postal_town', $var['types'])) {
						$city = strtolower($var['long_name']);
					}
				}


				//$city = strtolower($response['results'][0]['address_components'][1]['long_name']);
				
				$stores = $this->Store->find('all', array(							
								'conditions' => array(
									'OR' => array(
										'LOWER(Store.city)' => $city,
										'LOWER(Store.state)' => $city
									),
									'Store.status' => 1	
								),
								'fields' => array(
									'Store.id', 'Store.store_id', 'Store.store_name', 'Store.store_address', 'Store.store_ip_address', 'Store.store_image', 'Store.store_phone', 'Store.store_email', 'Store.city', 'Store.state', 'Store.country', 'Store.zip', 'Store.latitude', 'Store.longitude', 'Store.delivery_radius'
								),
								'order' => array('Store.store_name' => 'asc')
							));
			
				$already = array();	
				
				
				if(!empty($stores)) {
					foreach($stores as $st) {
						if(!in_array($st['Store']['store_name'], $already)) {
							$allStores[] = $st;
							$already[] = $st['Store']['store_name'];
						}
					}
				}
							
				
			}
			echo json_encode($allStores); die;
			//echo '<pre>'; print_r($response); die;
		}
		
	}
	
	
	public function getStoresFromLatLong($lat, $long) {
		
		if($lat != '' && $long != '') {
			
			$url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='.$lat.','.$long.'&sensor=true';
			
			$result     = $this->curlGetRequest($url);
			$response   = json_decode($result, true);
			$postalCode = '';
			$city = '';
			
			$return = array(
						'cityVal' => '',
						'postalCode' => '',
						'stores' => array()	
					);
			
			if($response['status'] == 'OK') {
				
				foreach($response['results'] as $res) {
					foreach($res['address_components'] as $comp) {
						if(isset($comp['types'])){						
							foreach($comp['types'] as $typ) {
								if($typ == 'locality') {
									$city = $comp['long_name'];									
								}else if($typ == 'postal_code') {
									$postalCode = $comp['long_name'];
								}
							}						
						}
					}					
				}
				//$city = 'Delhi';
				$stores = $this->Store->find('all', array(							
								'conditions' => array(
									'OR' => array(
										'LOWER(Store.city)' => $city,
										'LOWER(Store.state)' => $city
									),
									'Store.status' => 1	
								),
								'fields' => array(
									'Store.id', 'Store.store_id', 'Store.store_name', 'Store.store_address', 'Store.store_ip_address', 'Store.store_image', 'Store.store_phone', 'Store.store_email', 'Store.city', 'Store.state', 'Store.country', 'Store.zip', 'Store.latitude', 'Store.longitude', 'Store.delivery_radius'
								),
								'order' => array('Store.store_name' => 'asc')
							));
			
				$already = array();	
				$allStores = array();
				
				if(!empty($stores)) {
					foreach($stores as $st) {
						if(!in_array($st['Store']['store_name'], $already)) {
							$allStores[] = $st;
							$already[] = $st['Store']['store_name'];
						}
					}
				}
							
				
				$return = array(
								'cityVal' => $city,
								'postalCode' => $postalCode,
								'stores' => $allStores	
						);
				
			}
			echo json_encode($return); die;
			
			
		}
		
	}
	
	
	public function getStoreDetails($storeId) {
		
		$store = $this->Store->findById($storeId);
		echo json_encode($store); die;
	}
	
	public function getStoreDetailsByStoreId($storeId) {
		
		$store = $this->Store->find('first', array(
										'conditions' => array(
											'store_id' => $storeId,
											'status' => 1
										)
									));
		echo json_encode($store); die;
	}
	
	
	public function login() {
		$data = $this->request->input ( 'json_decode', true) ;
		
		if(!empty($data)) {
			
			$url = APIURL.'/index.php/Login';
			
			$result     = $this->curlPostRequest($url, $data);
			$response   = json_decode($result, true);
			
			if($response['Status'] == 'OK') {
				$resp = array(
			
						'id' => $response['Id'],
						'FirstName' => $response['FirstName'],
						'LastName' => $response['LastName'],
						'Status' => $response['Status']
					);	
			}else{
				$resp = array('Status' => $response['Status']);	
			}
			
			echo json_encode($resp); die;
			
			
		}
		
		die;
	}
	
	
	public function getTwitterFeeds($name) {
		
		$token = '2513266519-YuLXSe7MykmRA5eoNgSfBb4dDRTQpBIlpjrxsgm';
		$token_secret = 'aca8AD9fpIF0yEvaltPzlEoeTwmT1WHvKfDlbxf3QyNUe';
		$consumer_key = '7HN4TNXa4jykiu8oDzM78OkYP';
		$consumer_secret = 'FhcuBzYCFO2IoIZl9i7xxHCCYyvEXvH6nZyJZtcJfDRI7LXHmV';

		$host = 'api.twitter.com';
		$method = 'GET';
		$path = '/1.1/statuses/user_timeline.json'; // api call path

		$query = array( // query parameters
			'screen_name' => $name,
			'count' => '5'
		);

		$oauth = array(
			'oauth_consumer_key' => $consumer_key,
			'oauth_token' => $token,
			'oauth_nonce' => (string)mt_rand(), // a stronger nonce is recommended
			'oauth_timestamp' => time(),
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_version' => '1.0'
		);

		$oauth = array_map("rawurlencode", $oauth); // must be encoded before sorting
		$query = array_map("rawurlencode", $query);

		$arr = array_merge($oauth, $query); // combine the values THEN sort

		asort($arr); // secondary sort (value)
		ksort($arr); // primary sort (key)

		// http_build_query automatically encodes, but our parameters
		// are already encoded, and must be by this point, so we undo
		// the encoding step
		$querystring = urldecode(http_build_query($arr, '', '&'));

		$url = "https://$host$path";

		// mash everything together for the text to hash
		$base_string = $method."&".rawurlencode($url)."&".rawurlencode($querystring);

		// same with the key
		$key = rawurlencode($consumer_secret)."&".rawurlencode($token_secret);

		// generate the hash
		$signature = rawurlencode(base64_encode(hash_hmac('sha1', $base_string, $key, true)));

		// this time we're using a normal GET query, and we're only encoding the query params
		// (without the oauth params)
		$url .= "?".http_build_query($query);
		$url=str_replace("&amp;","&",$url); //Patch by @Frewuill

		$oauth['oauth_signature'] = $signature; // don't want to abandon all that work!
		ksort($oauth); // probably not necessary, but twitter's demo does it

		// also not necessary, but twitter's demo does this too
		function add_quotes($str) { return '"'.$str.'"'; }
		$oauth = array_map("add_quotes", $oauth);

		// this is the full value of the Authorization line
		$auth = "OAuth " . urldecode(http_build_query($oauth, '', ', '));

		// if you're doing post, you need to skip the GET building above
		// and instead supply query parameters to CURLOPT_POSTFIELDS
		$options = array( CURLOPT_HTTPHEADER => array("Authorization: $auth"),
						  //CURLOPT_POSTFIELDS => $postfields,
						  CURLOPT_HEADER => false,
						  CURLOPT_URL => $url,
						  CURLOPT_RETURNTRANSFER => true,
						  CURLOPT_SSL_VERIFYPEER => false);

		// do our business
		$feed = curl_init();
		curl_setopt_array($feed, $options);
		$json = curl_exec($feed);
		curl_close($feed);

		$twitter_data = json_decode($json, true);
		
		$alltweets = array();
		$i = 0;
		
		if(!empty($twitter_data)) {
			foreach($twitter_data as $tw) {
				$alltweets[$i] = $tw['text'];
				$i++;
			}
		}
		
		echo json_encode($alltweets); die;
		//echo '<pre>'; print_r($twitter_data); die;
		
	}
	
	public function getInstagramPost() {
		
		 $url = "https://api.instagram.com/v1/users/4840586777/media/recent/?access_token=4840586777.ca0f88f.7727fb8e3cab4780ac3ac391240e636f";	
			
		  $ch = curl_init();
		  curl_setopt($ch, CURLOPT_URL, $url);
		  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		  curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		  $result = curl_exec($ch);
		  curl_close($ch); 
		  //return $result;
		  

		 
		  //$result = json_decode($result);
		  
		  echo '<pre>'; print_r($result); die;
		  //foreach ($result->data as $post) {
			// Do something with this data.
		  //}
		
	}
	
	
	public function getCountryStores($country) {		
		if(!empty($country)) {
			$country = strtolower($country);
			$stores = $this->Store->find('all', array(
				'conditions' => array(
					'LOWER(Store.country)' => $country,
					'Store.status' => 1
				)
			));	
			echo json_encode($stores);
			die;				
		}		
	}
	
	
	public function saveFavItem() {
		$data = $this->request->input ( 'json_decode', true) ;
		if(!empty($data)) {
			//echo '<pre>'; print_r(json_encode($data)); die;
			$url = APIURL.'/index.php/addFav';
			 
			$result     = $this->curlPostRequest($url, $data);
			$response   = json_decode($result);
			echo json_encode($response); die;
			
		}
		
		die;
	}
	
	
	public function getCitiesSuggestion($searchKey, $countryCode = null) {
		
		$result = array();
		
		if(!empty($searchKey)) {
			$url = "http://gd.geobytes.com/AutoCompleteCity?filter=".$countryCode."&q=".$searchKey;
			$result = $this->curlGetRequest($url);
		}
			
		echo $result; die;
		
	}

	public function getCitiesSuggestionApp($searchKey, $countryCode = null) {
		$this->autoRender = false;
		$searchCity =  array('Motor City','Dubai Marina', 'Business Bay');
		$result = array();
		if(!empty($searchKey)) {
			$url = "http://gd.geobytes.com/AutoCompleteCity?filter=".$countryCode."&q=".$searchKey;
			$result = $this->curlGetRequest($url);
		}

		if($result == '[""]'){
			foreach ($searchCity as $key => $value) {
				if(stristr(strtolower($value),$searchKey)) {
					$result = '["'.$value.', DU, United Arab Emirates"]';
				}
			}
		}
		echo $result; 
	}
	
	function getFBFeed ($page='nkdpizza'){
	    $result = array();

	    $graph_url = 'https://graph.facebook.com/'. $page .'/feed?access_token=1413958752014988|u7WaXrdFfFiFO9mX09mxdqC1NcU';
		
		$fb_feed = $this->curlGetRequest($graph_url);
		$fb_feed = json_decode($fb_feed, true);
	   // $fb_feed = json_decode(file_get_contents($graph_url), true);


	    foreach($fb_feed["data"] as $f)
	    {
		    $id_arr = explode("_", $f["id"]);
			$m = '';
			if (isset($f["message"])) {
				$m = $f["message"];
			}
		    $feed = array(
			                "message" => $m,
			                "image" => 'https://graph.facebook.com/' . $id_arr[1] . '/picture'
	                    );

		    array_push($result, $feed);
	    }

	    echo json_encode($result);
	    die;
	}
	
	function getIGFeed($page='nkdpizza'){
	    $result = array();

	    $graph_url = 'https://www.instagram.com/' . $page . '/media/';
		$ig_feed = $this->curlGetRequest($graph_url);
		$ig_feed = json_decode($ig_feed, true);
	    //$ig_feed = json_decode(file_get_contents($graph_url), true);

	    foreach($ig_feed["items"] as $i)
	    {
		    $feed = array(
			                "message" => $i["caption"]["text"],
			                "image" => $i["images"]["standard_resolution"]["url"]
			            );

		    array_push($result, $feed);
	    }

	    echo json_encode($result);
	    die;
	}

	/* Send catering info to email */

 function sendCateringInfo(){
  $data = $this->request->input ( 'json_decode', true);
  if(!empty($data)) {
   $username = $data['username'];
   $email = $data['email'];
   $tel = $data['tel'];
   $location = $data['location'];
   $date = $data['date'];
   $noofuser = $data['noofuser'];
   $social = $data['social'];

   /*-template asssignment if any*/
    $template = $this->EmailTemplate->find('first',array(
            'conditions' => array(
                'template_key'=> 'catering_notification',
                'template_status' =>'Active'
            )
        )
    );

    if($template){  
        $arrFind=array('{name}','{email}','{phone}','{location}','{event_date}','{no_of_person}','{special_instruction}');
        $arrReplace=array($username,$email,$tel,$location,$date,$noofuser,$social);
        
        $from=$template['EmailTemplate']['from_email'];
        $subject=$template['EmailTemplate']['email_subject'];
        $content=str_replace($arrFind, $arrReplace,$template['EmailTemplate']['email_body']);
    }

    if($this->sendPhpEmail(CATERING_EMAIL,$from,$subject,$content)){
    	$this->sendAckEmail($email,$username);
		echo json_encode(array('show'=>true, 'isSuccess'=>true, 'message'=>'Thank you for your enquiry about your event - we’ll be in touch really soon to talk about how we can help!'));
	}else{
		echo json_encode(array('show'=>true, 'isSuccess'=>false, 'message'=>'Sorry ! mail not send, please try again.'));
	}
    /*-[end]template asssignment*/ 
  }
  die;
 }

	function sendContactInfo(){
  $data = $this->request->input ( 'json_decode', true);
  if(!empty($data)) {

   	$fname = $data['fname'];
	$lname = $data['lname'];
   	$email = $data['email'];
   	$tel = $data['tel'];
   	$location = $data['location'];
  	$question = $data['question'];
   	$feedback = $data['feedback'];

	$name = $fname.' '.$lname;
   /*-template asssignment if any*/
    $template = $this->EmailTemplate->find('first',array(
            'conditions' => array(
                'template_key'=> 'contact_notification',
                'template_status' =>'Active'
            )
        )
    );

    if($template){  
        $arrFind=array('{name}','{email}','{phone}','{location}','{question}','{feedback}');
        $arrReplace=array($name,$email,$tel,$location,$question,$feedback);
        
        $from=$template['EmailTemplate']['from_email'];
        $subject=$template['EmailTemplate']['email_subject'];
        $content=str_replace($arrFind, $arrReplace,$template['EmailTemplate']['email_body']);
    }
  
    if($this->sendPhpEmail(CONTACT_EMAIL,$from,$subject,$content)){
    	$this->sendAckEmail($email,$name);
		echo json_encode(array('show'=>true, 'isSuccess'=>true, 'message'=>'Thank You ! information has been sent successfully will contact you soon.'));
	}else{
		echo json_encode(array('show'=>true, 'isSuccess'=>false, 'message'=>'Sorry ! mail not send, please try again.'));
	}
    /*-[end]template asssignment*/ 
  }
  die;
 }

 function sendApplyInfo(){
  $data = $this->request->input ( 'json_decode', true);
  if(!empty($data)) {

   	$fname = $data['fname'];
   	$lname = $data['lname'];
   	$tel = $data['tel'];
   	$email = $data['email'];
   	$country = $data['country'];
   	$city = $data['city'];
   	$feedback = $data['feedback'];
	$name = $fname.' '.$lname;
   /*-template asssignment if any*/
    $template = $this->EmailTemplate->find('first',array(
            'conditions' => array(
                'template_key'=> 'enquiry_notification',
                'template_status' =>'Active'
            )
        )
    );

    if($template){  
        $arrFind=array('{name}','{email}','{phone}','{country}','{city}','{feedback}');
        $arrReplace=array($name,$email,$tel,$country,$city,$feedback);
        
        $from=$template['EmailTemplate']['from_email'];
        $subject=$template['EmailTemplate']['email_subject'];
        $content=str_replace($arrFind, $arrReplace,$template['EmailTemplate']['email_body']);
    }
    if($this->sendPhpEmail(ENQUIRY_EMAIL,$from,$subject,$content)){
    	$this->sendAckEmail($email,$name);
			echo json_encode(array('show'=>true, 'isSuccess'=>true, 'message'=>'Thank You ! you information has been sent successfully will contact you soon.'));
		}else{
    	echo json_encode(array('show'=>true, 'isSuccess'=>false, 'message'=>'Sorry ! mail not send, please try again.'));
		}
    /*-[end]template asssignment*/ 
  }
  die;
 }

function sendCareerInfo(){
  $data = $this->request->input ( 'json_decode', true);
  if(!empty($data)) {

   	$fname = $data['fname'];
	$lname = $data['lname'];
   	$email = $data['email'];
   	$tel = $data['tel'];
   	$position = $data['position'];
  	$lkdin = $data['lkdin'];
   	$resume = $data['resume'];

	$name = $fname.' '.$lname;
   /*-template asssignment if any*/
    $template = $this->EmailTemplate->find('first',array(
            'conditions' => array(
                'template_key'=> 'career_notification',
                'template_status' =>'Active'
            )
        )
    );

    if($template){  
        $arrFind=array('{name}','{email}','{phone}','{position}','{lkdin}','{resume}');
        $arrReplace=array($name,$email,$tel,$position,$lkdin,$resume);
        
        $from=$template['EmailTemplate']['from_email'];
        $subject=$template['EmailTemplate']['email_subject'];
        $content=str_replace($arrFind, $arrReplace,$template['EmailTemplate']['email_body']);
    }

    if($this->sendPhpEmail(CAREER_EMAIL,$from,$subject,$content)){
    	$this->sendAckEmail($email,$name);
			echo json_encode(array('show'=>true, 'isSuccess'=>true, 'message'=>'Thank You ! information has been sent successfully, will contact you soon.'));
		}else{
    	echo json_encode(array('show'=>true, 'isSuccess'=>false, 'message'=>'Sorry ! mail not send, please try again.'));
		}
    /*-[end]template asssignment*/ 
  }
  die;
 }


	function getPrefrences(){
		$this->Question->bindModel(array('hasMany'=>array('QuestionOption')));
		$questions = $this->Question->find('all',array(
			'conditions'=>array(
				'Question.status'=>1
			),
			'order'=>'Question.sort_order'
		));
		echo json_encode($questions); 
		die;
	}

	function getUserPrefreces($userId){
		$this->autoRender = false;
		$this->layout = 'false';
		$this->Question->bindModel(array('hasMany'=>array('QuestionOption')));
		$questions = $this->Question->find('all',array(
			'conditions'=>array(
				'Question.status'=>1
			),
			'order'=>'Question.sort_order'
		));
		
		$resp = $this->curlGetRequest(APIURL.'/index.php/getProfile/'.$userId);
		$result = json_decode($resp, true);
		$userPrefreces = json_decode($result['Pref']);

		foreach($questions as $key=>$value):
			$questionId = $value['Question']['id'];
			foreach($value['QuestionOption'] as $k=>$v):
				$optionId = $v['id'];
				$arr = $userPrefreces->$questionId;
				if(in_array($optionId, $arr)){
					$questions[$key]['QuestionOption'][$k]['checked'] = 1;
				}else{
					$questions[$key]['QuestionOption'][$k]['checked'] = 0;
				}
			endforeach;
		endforeach;
		echo json_encode($questions);
		die;
	}

	function signUp(){
		$data = $this->request->input ( 'json_decode', true);
		$qData = array();
		foreach($data[2]['question'] as $val):	
			$qId = $val['Question']['id'];
			$valNew = $val['QuestionOption'];
			foreach($valNew as $key=>$v):
				if(isset($v['checked']) && $v['checked']){
					$qData[$qId][] = $v['id'];
				}
			endforeach;
		endforeach;

		// $date = new DateTime($data[0]['dob']);
		if(!empty($data)) {
			$userData = array(
				'firstname'=>$data[0]['fname'],
				'lastname'=>$data[0]['lname'],
				'email'=>$data[0]['email'],
				'dob'=>$data[0]['dob'],
				'postal'=>$data[0]['zip'],
				'favloc'=>$data[0]['location'],
				'phone'=>$data[0]['phone'],
				'address1'=>'',
				'address2'=>'',
				'address3'=>'',
				'username'=>$data[1]['username'],
				'password'=>$data[1]['password'],
				'subscribe'=>($data[2]['enrolling'])?1:0,
				'pref'=>$qData,
			);

			// $url = 'https://nkdpizza.com/beta/pos/index.php/Signup';
			$url = APIURL."/index.php/Signup";
			$result     = $this->curlPostRequest($url, $userData);
			$response   = json_decode($result);
			if($response->Status == 'OK') {
				
				/*-template asssignment if any*/
				$template = $this->EmailTemplate->find('first',array(
						'conditions' => array(
							'template_key'=> 'registraion_notification',
							'template_status' =>'Active'
						)
					)
				);

				if($template){  
					$arrFind=array('{fname}','{lname}','{email}','{password}');
					$arrReplace=array($data[0]['fname'],$data[0]['lname'],$data[0]['email'],$data[1]['password']);
					
					$from=$template['EmailTemplate']['from_email'];
					$subject=$template['EmailTemplate']['email_subject'];
					$content=str_replace($arrFind, $arrReplace,$template['EmailTemplate']['email_body']);
				}

				if($this->sendPhpEmail($data[0]['email'],$from,$subject,$content)){
					echo json_encode(array('isSuccess'=>true, 'show'=>true, 'id'=>$response->Id, 'message'=>'Thank You ! you have successfully registered with us, login details has been sent to registered email.'));
				}else{
					echo json_encode(array('isSuccess'=>true, 'show'=>true, 'id'=>$response->Id,  'message'=>'Thank You ! you have successfully registered with us.'));
				}
				/*-[end]template asssignment*/
			}else{
				echo json_encode(array('isSuccess'=>false, 'show'=>true, 'message'=>$response->Message));
			}
		}
		die;
	}

	
	public function curlGetRequest($url) {
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER,
				array("Content-type: application/json"));
		
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); //curl error SSL certificate problem, verify that the CA cert is OK
		$result     = curl_exec($curl);
		return $result;
	}
	
	public function curlPostRequest($url, $data) {
		$content = json_encode($data);
		$curl = curl_init($url); 
		curl_setopt($curl, CURLOPT_HEADER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER,
				array("Content-type: application/json"));
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $content);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); //curl error SSL certificate problem, verify that the CA cert is OK
		 
		$result     = curl_exec($curl);
		return $result;
	}
	
	
	public function getFav($type = '', $userId = '') {
		
		if($type != '' && $userId != '') {
			$method = 'getFavItem';
			if($type == 'order') {
				$method = 'getFavOrder';
			}
			$url = APIURL."/index.php/".$method."/".$userId;
			
			$result     = $this->curlGetRequest($url);
			$favItems   = json_decode($result, true);
			echo json_encode($favItems); die;
		}
			
		die;
	}
	
	public function getFavItemData() {
		
		$data = $this->request->input ( 'json_decode', true) ;
		
		$menuCountry = $data['menuCountry'];
		$favData = json_decode($data['favData']);
		$favData = json_decode($favData, true);
		if(!empty($favData)) {
			$item = $this->prepareFavResponse($favData['FDetail']['data'], $favData['FDetail']['data']['itemSlug'], $menuCountry);
			echo json_encode($item); die;
		}		
		die;
	}
	
	
	public function applyCoupon() {
		$orderData = $this->request->input ( 'json_decode', true) ;
		
		if(!empty($orderData)) {
			$url = APIURL.'/index.php/checkDiscount';
			$orderData['order_details'] = $this->formatPlaceOrderData($orderData);
			$this->Couponlog->create();
			$this->Couponlog->save(array('data' => json_encode($orderData), 'created' => date('Y-m-d H:i:s')));	

			$resp = $this->curlPostRequest($url, $orderData);
			$res = json_decode($resp, true);
			echo json_encode($res); die;
		}
		
		die;
	}
	
	
	public function prepareFavResponse($favData, $itemSlug, $menuCountry = 'UK') {
		//if(!empty($favData)) {
			$favDataObj = $favData;
			$favData = $favData['modifiers'];
			$item = $this->getFormattedItemData($itemSlug, $menuCountry);
			
			if (isset($favDataObj['qty'])) {
				$item['Product']['qty'] = $favDataObj['qty'];
			}	
			
			//echo '<pre>'; print_r($favDataObj); die;
			if(!empty($item) && !empty($item['ProductModifier']) && !empty($favData)) {
				
				$i = 0;
				foreach($item['ProductModifier'] as $pm) {
					$j = 0; 
					foreach($pm['Modifier']['ModifierOption'] as $mo) {
						
						foreach($favData as $fpm) {
							
							if($fpm['modifier_id'] == $item['ProductModifier'][$i]['Modifier']['id']) {
								
								foreach($fpm['option'] as $fop) {
									
									if($fop['plu_code'] == $mo['Option']['plu_code']) {
																				
										if ($mo['Option']['plu_code'] == 'I101' || $mo['Option']['plu_code'] == 'I100' || $mo['Option']['plu_code'] == '217') {
											//echo $fop['plu_code'].'<>';
											if ($fop['send_code'] == 1 && $fop['is_checked'] == true) {
												$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_checked'] = true;
											} else {
												$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_checked'] = false;
											}
										} else {
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_checked'] = $fop['is_checked'];
										}
										
																				
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['default_checked'] = $fop['default_checked'];
										
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['send_code'] = $fop['send_code'];
										
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['add_extra'] = $fop['add_extra'];
										
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['quantity'] = $fop['quantity'];
										
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_included_mod'] = $fop['is_included_mod'];
										
										$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['send_code_permanent'] = $fop['send_code_permanent'];
										
										
										if(!empty($fop['subOption'])) {
											
											if(!empty($mo['Option']['OptionSuboption'])) {
												$n = 0;
												foreach($mo['Option']['OptionSuboption'] as $sop) {
													
													if(in_array($item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['OptionSuboption'][$n]['SubOption']['id'], $fop['subOption'])) {
													
														$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['OptionSuboption'][$n]['SubOption']['is_active'] = true;	
													}	
													$n++;
												}
											}
											
										}
									
									} else {
										
										if($mo['Option']['plu_code'] == 'I101' || $mo['Option']['plu_code'] == 'I100' || $mo['Option']['plu_code'] == '217') {
											$item['ProductModifier'][$i]['Modifier']['ModifierOption'][$j]['Option']['is_checked'] = false;
										}
										
									}
									
								}	
									
							}
							
						}
						
						$j++;
					}
					
					$i++;
				}
				
			}
	//die;
			return $item;
			
		//}
		
	}
	
	
	public function getFavOrderData() {
		
		$data = $this->request->input( 'json_decode', true) ;
		$menuCountry = $data['menuCountry'];
		$favOrderData = $data['orderData'];
		
		if(!empty($favOrderData)) {
			$allItems = array();
			if(!empty($favOrderData['FDetail'])) {				
				foreach($favOrderData['FDetail'] as $fd) {					
					$item = $this->prepareFavResponse($fd['data'], $fd['data']['itemSlug'], $menuCountry);
					//echo '<pre>'; print_r($item); die;
					$item['totalItemCost'] = $fd['data']['totalItemCost'];
					$allItems[] = $item;					
				}				
			}	 //die;		
			echo json_encode($allItems); die;
		}		
		die;
	}
	
	
	public function getReOrderData() {
		
		$data = $this->request->input( 'json_decode', true) ;
		$menuCountry = $data['menuCountry'];
		$favOrderData = $data['orderData'];
				
		if(!empty($favOrderData)) {
			$allItems = array();
			if(!empty($favOrderData)) {				
				foreach($favOrderData as $fd) {					
					$item = $this->prepareFavResponse($fd['data'], $fd['data']['itemSlug'], $menuCountry);
					//echo '<pre>'; print_r($item); die;
					$item['totalItemCost'] = $fd['data']['totalItemCost'];
					$allItems[] = $item;					
				}				
			}	 //die;		
			echo json_encode($allItems); die;
		}		
		die;
	}
	
	
	public function getProfile($userId){
		$this->layout = 'false';
		$this->autoRender = false;

		$result = array();
		$resp = $this->curlGetRequest(APIURL.'/index.php/getProfile/'.$userId);
		$result = json_decode($resp, true);
		echo json_encode($result);
	    die;
	}
	
	
	public function getOrderHistory($userId) {
		if(!empty($userId)) {
			$url = APIURL.'/index.php/orderHistory/'.$userId;
			$orders = $this->curlGetRequest($url);	
			$orders = json_decode($orders, true);	
			if(!empty($orders)) {
				$i = 0;
				foreach($orders as $ord) {
					
					$j = 0;
					$orders[$i]['OrderDetail'] = json_decode($orders[$i]['OrderDetail'], true);
					
					$store = $this->Store->find('first', array(
											'conditions' => array(
												'Store.store_id' => $orders[$i]['OrderDetail']['storeId']
											),
											'fields' => array(
												'Store.store_id',
												'Store.store_name',
												'Store.store_address',
												'Store.store_phone'
											)	
									));
					
					if (isset($store['Store'])) {
						$orders[$i]['OrderDetail']['store'] = $store['Store'];	
					}
					
					foreach($orders[$i]['OrderDetail']['order_details'] as $ordv){
						
						$pluCode = $ordv['plu'];
						$orders[$i]['OrderDetail']['order_details'][$j]['product_name'] = $this->getProductNameByPlu($pluCode);
												
						if(!empty($ordv['modifier'])) {
							foreach($orders[$i]['OrderDetail']['order_details'][$j]['modifier'] as $key => $modType){
								$k = 0;
								$orders[$i]['OrderDetail']['order_details'][$j]['modifier'] = array();
								foreach($modType as $mod) {
									
									$orders[$i]['OrderDetail']['order_details'][$j]['modifier'][$k]	= $mod;
									$orders[$i]['OrderDetail']['order_details'][$j]['modifier'][$k]['modType'] = $key;
									$orders[$i]['OrderDetail']['order_details'][$j]['modifier'][$k]['modifier_name'] = $this->getModifierName($mod['plu']);
									$k++;	
								}
							}	
						}
						$j++;
					}
					$i++;
				}
			}
			echo json_encode($orders);
			die;
		}		
		die;
	}

	public function getProductNameByPlu($pluCode){
		$this->layout = 'false';
		$this->autoRender = false;
		return $this->Product->field('title', array('plu_code' => $pluCode));
	}

	public function getModifierName($modifierCode){
		$this->layout = 'false';
		$this->autoRender = false;
		return $this->Option->field('name', array('plu_code' => $modifierCode));
	}


	public function updateProfile(){
		$this->layout = 'false';
		$this->autoRender = false;

		$userData = $this->request->input ( 'json_decode', true) ;	
		if(!empty($userData)) {
			$url = APIURL.'/index.php/updateProfile/'.$userData['id'];
			$result     = $this->curlPostRequest($url, $userData);
			$response   = json_decode($result); 
			if($response->Status=='OK'){
				echo json_encode(array('show'=>true,'isSuccess'=>true, 'message'=>$response->Message));
			}else{
				$responseArr = array(
					'show'=>true, 
                    'isSuccess'=>false, 
          			'message'=>$response->Message
				);
				echo json_encode($responseArr);
			}			
		}
		die;
	}

	public function updatePrefrence(){
		$this->layout = 'false';
		$this->autoRender = false;

		$data = $this->request->input ( 'json_decode', true) ;
		$qData = array();
		foreach($data['question'] as $val):	
			$qId = $val['Question']['id'];
			$valNew = $val['QuestionOption'];
			foreach($valNew as $key=>$v):
				if($v['checked']){
					$qData[$qId][] = $v['id'];
				}
			endforeach;
		endforeach;
		if(!empty($data)) {
			$userData = array(
				'form'=>$data['form'],
				'subscribe'=>($data['subscribe'])?1:0,
				'pref'=>$qData,
			);
		}

		if(!empty($userData)) {
			$url = APIURL.'/index.php/updateProfile/'.$data['id'];
			$result     = $this->curlPostRequest($url, $userData);
			$response   = json_decode($result); 
			if($response->Status=='OK'){
				echo json_encode(array('show'=>true,'isSuccess'=>true, 'message'=>$response->Message));
			}else{
				$responseArr = array(
					'show'=>true, 
                    'isSuccess'=>false, 
          			'message'=>$response->Message
				);
				echo json_encode($responseArr);
			}			
		}
		die;
	}

	public function addAddress(){
		$this->layout = 'false';
		$this->autoRender = false;
		// Configure::write('debug', 2);
		$addressNo = '';
		$userData = $this->request->input ( 'json_decode', true) ;	

		$getAddrs = array();
		$resp = $this->curlGetRequest(APIURL.'/index.php/getProfile/'.$userData['id']);
		$profileData = json_decode($resp, true);
		
		if($profileData['Address1']=='null' || $profileData['Address1']=='""' || empty($profileData['Address1'])){
			$addressNo = 'address1';
		}else if($profileData['Address2']=='null' || $profileData['Address2']=='""' || empty($profileData['Address2'])){
			$addressNo = 'address2';
		}else if($profileData['Address3']=='null' || $profileData['Address3']=='""' || empty($profileData['Address3'])){
			$addressNo = 'address3';
		}

		$upatedData = array(
			'form'=>4,
			$addressNo=>$userData
		);	
		
		if(!empty($upatedData)) {
			$url = APIURL.'/index.php/updateProfile/'.$userData['id'];
			$result     = $this->curlPostRequest($url, $upatedData);
			$response   = json_decode($result); 
			if($response->Status=='OK'){
				echo json_encode(array('show'=>true,'isSuccess'=>true, 'message'=>$response->Message));
			}else{
				$responseArr = array(
					'show'=>true, 
                    'isSuccess'=>false, 
          			'message'=>$response->Message
				);
				echo json_encode($responseArr);
			}			
		}
		die;
	}

	public function editAddress(){
		$this->layout = 'false';
		$this->autoRender = false;
		$addressNo = '';
		$userData = $this->request->input ( 'json_decode', true) ;	

		if($userData['addressNo'] == 'Address1'){
			$addressNo = 'address1';
		}else if($userData['addressNo'] == 'Address2'){
			$addressNo = 'address2';
		}else{
			$addressNo = 'address3';
		}

		$upatedData = array(
			'form'=>4,
			$addressNo=>$userData
		);
		
		if(!empty($upatedData)) {
			$url = APIURL.'/index.php/updateProfile/'.$userData['id'];
			$result     = $this->curlPostRequest($url, $upatedData);
			$response   = json_decode($result); 
			if($response->Status=='OK'){
				echo json_encode(array('show'=>true,'isSuccess'=>true, 'message'=>$response->Message));
			}else{
				$responseArr = array(
					'show'=>true, 
                    'isSuccess'=>false, 
          			'message'=>$response->Message
				);
				echo json_encode($responseArr);
			}			
		}
		die;
	}

	public function deleteAddress(){
		$this->layout = 'false';
		$this->autoRender = false;
		$addressNo = '';
		$userData = $this->request->input ( 'json_decode', true) ;	

		if($userData['addressNo'] == 'Address1'){
			$addressNo = 'address1';
		}else if($userData['addressNo'] == 'Address2'){
			$addressNo = 'address2';
		}else{
			$addressNo = 'address3';
		}

		$upatedData = array(
			'form'=>4,
			$addressNo=>""
		);
		
		if(!empty($upatedData)) {
			$url = APIURL.'/index.php/updateProfile/'.$userData['id'];
			$result     = $this->curlPostRequest($url, $upatedData);
			$response   = json_decode($result); 
			if($response->Status=='OK'){
				echo json_encode(array('show'=>true,'isSuccess'=>true, 'message'=>'Address deleted successfully'));
			}else{
				$responseArr = array(
					'show'=>true, 
                    'isSuccess'=>false, 
          			'message'=>'Not deleted'
				);
				echo json_encode($responseArr);
			}			
		}
		die;
	}

	public function setAsDefault(){
		$this->layout = 'false';
		$this->autoRender = false;
		$userData = $this->request->input ( 'json_decode', true) ;	

		$resp = $this->curlGetRequest(APIURL.'/index.php/getProfile/'.$userData['id']);
		$profileData = json_decode($resp, true);
		if($userData['addressNo'] == 'Address1'){
			$address1 = json_decode($profileData['Address1'], true);
			if(!empty($address1))
			$address1['is_default'] = 1;

			$address2 = json_decode($profileData['Address2'], true);
			if(!empty($address2))
			$address2['is_default'] = 0;

			$address3 = json_decode($profileData['Address3'], true);
			if(!empty($address3))
			$address3['is_default'] = 0;

			$upatedData = array(
				'form'=>4,
				'address1'=>$address1,
				'address2'=>$address2,
				'address3'=>$address3
			);

		}else if($userData['addressNo'] == 'Address2'){
			$address1 = json_decode($profileData['Address1'], true);
			if(!empty($address1))
			$address1['is_default'] = 0;

			$address2 = json_decode($profileData['Address2'], true);
			if(!empty($address2))
			$address2['is_default'] = 1;

			$address3 = json_decode($profileData['Address3'], true);
			if(!empty($address3))
			$address3['is_default'] = 0;

			$upatedData = array(
				'form'=>4,
				'address1'=>$address1,
				'address2'=>$address2,
				'address3'=>$address3
			);

		}else {
			$address1 = json_decode($profileData['Address1'], true);
			if(!empty($address1))
			$address1['is_default'] = 0;

			$address2 = json_decode($profileData['Address2'], true);
			if(!empty($address2))
			$address2['is_default'] = 0;

			$address3 = json_decode($profileData['Address3'], true);
			if(!empty($address3))
			$address3['is_default'] = 1;

			$upatedData = array(
				'form'=>4,
				'address1'=>$address1,
				'address2'=>$address2,
				'address3'=>$address3
			);
		}
		
		if(!empty($upatedData)) {
			$url = APIURL.'/index.php/updateProfile/'.$userData['id'];
			$result     = $this->curlPostRequest($url, $upatedData);
			$response   = json_decode($result); 
			if($response->Status=='OK'){
				echo json_encode(array('show'=>true,'isSuccess'=>true, 'message'=>$response->Message));
			}else{
				$responseArr = array(
					'show'=>true, 
                    'isSuccess'=>false, 
          			'message'=>'Not deleted'
				);
				echo json_encode($responseArr);
			}			
		}
		die;
	}

	function getPageInfo($pageId){
		$this->autoRender = false;
		$this->layout = 'false';
		$data = $this->Content->find('first',array('conditions'=>array('page_id'=>$pageId,'status'=>'Publish')));
		echo json_encode($data);
		die;
	}
	
	
	
	
	public function getAreaSuggestion($country = null, $searchKey) {
		
		$result = array(
				'areas' => array(),
				'streets' => array(),
				'stores' => array()
			);
		$alreadyStreet = array();
		$alreadyStores = array();
		$alreadyArea = array();
		$allStreetArr = array();
		$allStoresArr = array();
		$allAreaArr = array();
		
		if(!empty($searchKey)) {
			
			$this->Location->recursive = 2;
			
			$this->LocationStreet->bindModel(array(
									'belongsTo' => array(
										'Store' => array(
												'className' => 'Store',
												'foreignKey' => 'store_id',
												'conditions' => array(
													'Store.status' => 1
												),
												'fields' => array(
													'Store.id', 'Store.store_id', 'Store.store_name', 'Store.store_address', 'Store.store_ip_address', 'Store.store_image', 'Store.store_phone', 'Store.store_email', 'Store.city', 'Store.state', 'Store.country', 'Store.zip', 'Store.latitude', 'Store.longitude', 'Store.delivery_radius'
												),
												'order' => array('Store.store_name' => 'asc')
										)
									)
							));
			
			$this->Location->bindModel(array(
									'hasMany' => array(
											'LocationStreet' => array(
													'className' => 'LocationStreet',
													'foreignKey' => 'location_id'
											)
									)
							));
			
			$areas = $this->Location->find('all', array('conditions' => array(
													'LOWER(Location.city) LIKE' => '%'.strtolower($searchKey).'%'
										)));	
			
			
			if(!empty($areas)) {
				$i = 0;
				foreach($areas as $area) {
					
					//add area name to street array
					if(!in_array($area['Location']['id'], $alreadyArea)) {
						
						$allAreaArr[] = $area['Location'];
						$alreadyArea[] = $area['Location']['id'];
						
					}
					
					foreach($areas[$i]['LocationStreet'] as $street) {
						
						//add street name to street array
						if(!in_array($street['id'], $alreadyStreet)) {
							
							$streetData = $street;
							$streetData['area_name'] = $area['Location']['city'];
							//unset($streetData['Store']);
							$allStreetArr[] = $streetData;
							$alreadyStreet[] = $street['id'];
							
						}	

								
					}
					
					$i++;
				}
				
			}	

			
			$result = array(
				'areas' => $allAreaArr,
				'streets' => $allStreetArr
			);
		}
			
		echo json_encode($result); die;
		
	}	
	
	
	public function testUrl() {
		echo APIURL; die;
		echo 'http://'.$_SERVER['HTTP_HOST'].$this->base; die;
		echo 'https://'.$_SERVER['SERVER_NAME'].'/beta'; die;
	}

	public function forgot_password(){
		$this->layout = FALSE;
		$this->autoRender = FALSE;
	
		$userData = $this->request->input ( 'json_decode', true);
		$postData['emailid'] = $userData['useremail'];
		$url = APIURL."/index.php/resetPasswordReq";
		$result = $this->curlPostRequest($url, $postData);
		echo $result;
	}

	public function reset_password(){
		$this->layout = FALSE;
		$this->autoRender = FALSE;
		$userData = $this->request->input ( 'json_decode', true);
		$postData['newpwd'] = $userData['password'];
		$postData['emailid'] = urldecode($userData['email']);
		$postData['resetid'] = $userData['key'];
		$url = APIURL."/index.php/resetPassword";
		$result = $this->curlPostRequest($url, $postData);
		echo $result;
	}
	
	function sendAckEmail($emailId,$username){
		$ackTemplate = $this->EmailTemplate->find('first',array(
	            'conditions' => array(
	                'template_key'=> 'user_acknowledgement',
	                'template_status' =>'Active'
	            )
	        )
	    );
	    if($ackTemplate){ 
	    	$arrFind=array('{name}');
	    	$arrReplace=array($username);
	    	$from=$ackTemplate['EmailTemplate']['from_email'];
	        $subject=$ackTemplate['EmailTemplate']['email_subject'];
	        $content=str_replace($arrFind, $arrReplace,$ackTemplate['EmailTemplate']['email_body']);
	        $this->sendPhpEmail($emailId,$from,$subject,$content);
	    }
	}

	function uploadAttachment(){
		$this->layout = FALSE;
		$this->autoRender = FALSE;
		header("Access-Control-Allow-Origin: *");
		 
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		  echo json_encode(array('status' => false));
		  exit;
		}
		 
		$path = 'attachments/';
		 
		if (isset($_FILES['file'])) {
		  $originalName = $_FILES['file']['name'];
		  $ext = '.'.pathinfo($originalName, PATHINFO_EXTENSION);
		  $generatedName = md5($_FILES['file']['tmp_name']).$ext;
		  $filePath = $path.$generatedName;
		 
		  if (!is_writable($path)) {
		    echo json_encode(array(
		      'status' => false,
		      'msg'    => 'Destination directory not writable.'
		    ));
		    exit;
		  }
		 
		  if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
		    echo json_encode(array(
		      'status'        => true,
		      'originalName'  => $originalName,
		      'generatedName' => $generatedName
		    ));
		  }
		}
		else {
		  echo json_encode(
		    array('status' => false, 'msg' => 'No file uploaded.')
		  );
		  exit;
		}
	}
	
	
	public function sendPaymentData() {
		$card = $this->request->input ( 'json_decode', true);
		
		if (!empty($card)) {
			
			$details = array(
				'name' => $card['name'],
				'customer-id' =>  $card['customerId'],
				'customer-email' =>  $card['customerEmail'],
				'postal-code' =>  $card['postalCode'],
				'amount' =>  $card['amount'],
				'expiration-month' => $card['expirationMonth'],
				'expiration-year' => $card['expirationYear'],
				'card' => $card['card'],
				'cvc' => $card['cvc'],
				'3ds' => $card['type']
			);	
			
			//$details = json_encode($details);
			//echo $details; die;
			//$url = APIURL.'/index.php/Pay';
			$url = 'http://35.185.240.172/nkd/index.php/Pay';
			 
			$result     = $this->curlPostRequest($url, $details);
			$response   = json_decode($result);
			$response = json_encode((array) $response);
			echo $response; die;
		}
		
		die;
	}	



	public function getDealData($dealId = '') {
		if (!empty($dealId)) {
			$this->Deal->recursive = 3;
			$this->DealItem->bindModel(array(
				'belongsTo' => array(
					'Category' => array(
						'className' => 'Category',
						'foreignKey' => 'cat_id',
						'fields' => array('name', 'slug')
					)
				)
			));

			$this->Deal->bindModel(array(
					'hasMany' => array(
						'DealCombination' => array(
							'className' => 'DealCombination',
							'foreignKey' => 'deal_id'
						),
						'DealGroup' => array(
							'className' => 'DealGroup',
							'foreignKey' => 'deal_id'
						),
						'DealItem' => array(
							'className' => 'DealItem',
							'foreignKey' => 'deal_id'
						)
					)
			));

			$deal = $this->Deal->find('first', array(
								'conditions' => array(
									'Deal.id' => $dealId
								)
					));

			$categories = array();
			$dealProducts = array();

			//echo '<pre>'; print_r($deal); die;
			

			if (!empty($deal['DealCombination'])) {
				
				foreach($deal['DealCombination'] as $dc) {
					//find groups
					if (!empty($dc['group1'])) {
						foreach($deal['DealGroup'] as $dg) {
							
							if ($dg['id'] == $dc['group1']) {

								//find item from group
								if (!empty($dg['item1'])) {
									foreach($deal['DealItem'] as $di) {
										if ($di['id'] == $dg['item1']) {

											for ($i=0; $i<$di['quantity']; $i++) {
												
												$qtyText = '';
												if (count($di['quantity']) > 1) {
													if ($i==0) {
														$qtyText = 'first';
													} else if ($i==1) {
														$qtyText = 'second';
													}
												}

												$catData = array(
													'id' => $di['cat_id'],
													'qty' => $di['quantity'],
													'isEnable' => true,
													'name' => $di['Category']['name'],
													'slug' => $di['Category']['slug'],
													'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
												);

												$categories[] = $catData;
											
											} 
																			
											$dealProducts[] = $di;											
										}
									}
								}

								if (!empty($dg['item2'])) {
									foreach($deal['DealItem'] as $di) {
										if ($di['id'] == $dg['item2']) {
											for ($i=0; $i<$di['quantity']; $i++) {
												
												$qtyText = '';
												if (count($di['quantity']) > 1) {
													if ($i==0) {
														$qtyText = 'first';
													} else if ($i==1) {
														$qtyText = 'second';
													}
												}

												$catData = array(
													'id' => $di['cat_id'],
													'qty' => $di['quantity'],
													'isEnable' => true,
													'name' => $di['Category']['name'],
													'slug' => $di['Category']['slug'],
													'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
												);

												$categories[] = $catData;
											
											}											
											$dealProducts[] = $di;
											
										}
									}
								}

							}

						}
					}

					if (!empty($dc['group2'])) {
						foreach($deal['DealGroup'] as $dg) {
							
							if ($dg['id'] == $dc['group2']) {

								//find item from group
								if (!empty($dg['item1'])) {
									foreach($deal['DealItem'] as $di) {
										if ($di['id'] == $dg['item1']) {
											for ($i=0; $i<$di['quantity']; $i++) {
												
												$qtyText = '';
												if (count($di['quantity']) > 1) {
													if ($i==0) {
														$qtyText = 'first';
													} else if ($i==1) {
														$qtyText = 'second';
													}
												}

												$catData = array(
													'id' => $di['cat_id'],
													'qty' => $di['quantity'],
													'isEnable' => true,
													'name' => $di['Category']['name'],
													'slug' => $di['Category']['slug'],
													'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
												);

												$categories[] = $catData;
											
											}											
											$dealProducts[] = $di;
											
										}
									}
								}

								if (!empty($dg['item2'])) {
									foreach($deal['DealItem'] as $di) {
										if ($di['id'] == $dg['item2']) {
											for ($i=0; $i<$di['quantity']; $i++) {
												
												$qtyText = '';
												if (count($di['quantity']) > 1) {
													if ($i==0) {
														$qtyText = 'first';
													} else if ($i==1) {
														$qtyText = 'second';
													}
												}

												$catData = array(
													'id' => $di['cat_id'],
													'qty' => $di['quantity'],
													'isEnable' => true,
													'name' => $di['Category']['name'],
													'slug' => $di['Category']['slug'],
													'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
												);

												$categories[] = $catData;
											
											}											
											$dealProducts[] = $di;
											
										}
									}
								}

							}

						}
					}

					
					if (!empty($dc['item1'])) {
						foreach($deal['DealItem'] as $di) {
							if ($di['id'] == $dc['item1']) {
								for ($i=0; $i<$di['quantity']; $i++) {
									
									$qtyText = '';
									if (count($di['quantity']) > 1) {
										if ($i==0) {
											$qtyText = 'first';
										} else if ($i==1) {
											$qtyText = 'second';
										}
									}

									$catData = array(
										'id' => $di['cat_id'],
										'qty' => $di['quantity'],
										'isEnable' => true,
										'name' => $di['Category']['name'],
										'slug' => $di['Category']['slug'],
										'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
									);

									$categories[] = $catData;
								
								}								
								$dealProducts[] = $di;
								
							}
						}
					}

					if (!empty($dc['item2'])) {
						foreach($deal['DealItem'] as $di) {
							if ($di['id'] == $dc['item2']) {
								for ($i=0; $i<$di['quantity']; $i++) {
									
									$qtyText = '';
									if (count($di['quantity']) > 1) {
										if ($i==0) {
											$qtyText = 'first';
										} else if ($i==1) {
											$qtyText = 'second';
										}
									}									

									$catData = array(
										'id' => $di['cat_id'],
										'qty' => $di['quantity'],
										'isEnable' => true,
										'name' => $di['Category']['name'],
										'slug' => $di['Category']['slug'],
										'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
									);

									$categories[] = $catData;
								
								}								
								$dealProducts[] = $di;								
							}
						}
					}

					
				}
			} else if (!empty($deal['DealGroup'])) {
				
				foreach($deal['DealGroup'] as $dg) {
					//find item 
					if (!empty($dg['item1'])) {
						foreach($deal['DealItem'] as $di) {
							if ($di['id'] == $dg['item1']) {

								for ($i=0; $i<$di['quantity']; $i++) {
									
									$qtyText = '';
									if (count($di['quantity']) > 1) {
										if ($i==0) {
											$qtyText = 'first';
										} else if ($i==1) {
											$qtyText = 'second';
										}
									}

									$catData = array(
										'id' => $di['cat_id'],
										'qty' => $di['quantity'],
										'isEnable' => true,
										'name' => $di['Category']['name'],
										'slug' => $di['Category']['slug'],
										'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
									);

									$categories[] = $catData;
								
								} 
																
								$dealProducts[] = $di;											
							}
						}
					}

					if (!empty($dg['item2'])) {
						foreach($deal['DealItem'] as $di) {
							if ($di['id'] == $dg['item2']) {
								for ($i=0; $i<$di['quantity']; $i++) {
									
									$qtyText = '';
									if (count($di['quantity']) > 1) {
										if ($i==0) {
											$qtyText = 'first';
										} else if ($i==1) {
											$qtyText = 'second';
										}
									}

									$catData = array(
										'id' => $di['cat_id'],
										'qty' => $di['quantity'],
										'isEnable' => true,
										'name' => $di['Category']['name'],
										'slug' => $di['Category']['slug'],
										'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
									);

									$categories[] = $catData;
								
								}											
								$dealProducts[] = $di;
								
							}
						}
					}
			
				}
			} else {
				if (!empty($deal['DealItem']['item1'])) {
					
						if ($di['id'] == $deal['DealItem']['item1']) {

							for ($i=0; $i<$di['quantity']; $i++) {
								
								$qtyText = '';
								if (count($di['quantity']) > 1) {
									if ($i==0) {
										$qtyText = 'first';
									} else if ($i==1) {
										$qtyText = 'second';
									}
								}

								$catData = array(
									'id' => $di['cat_id'],
									'qty' => $di['quantity'],
									'isEnable' => true,
									'name' => $di['Category']['name'],
									'slug' => $di['Category']['slug'],
									'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
								);

								$categories[] = $catData;
							
							} 
															
							$dealProducts[] = $di;											
						}
				
				}

				if (!empty($deal['DealItem']['item2'])) {
					
						if ($di['id'] == $deal['DealItem']['item2']) {
							for ($i=0; $i<$di['quantity']; $i++) {
								
								$qtyText = '';
								if (count($di['quantity']) > 1) {
									if ($i==0) {
										$qtyText = 'first';
									} else if ($i==1) {
										$qtyText = 'second';
									}
								}

								$catData = array(
									'id' => $di['cat_id'],
									'qty' => $di['quantity'],
									'isEnable' => true,
									'name' => $di['Category']['name'],
									'slug' => $di['Category']['slug'],
									'catText' => 'Select '.$qtyText.' '.substr($di['Category']['name'],0,-1)
								);

								$categories[] = $catData;
							
							}											
							$dealProducts[] = $di;
							
						}
					
				}
			}
			
			$dealData = array(
				'categories' => $categories,
				'products' => $dealProducts,
				'deal' => $deal
			);

			//echo '<pre>'; print_r($dealData); die;

			echo json_encode($dealData); die;
		}
	} 

	function getDealItemList(){
        $this->autoRender = false;
        $dealArr = array();
        $this->Deal->bindModel(array('hasMany'=>array('DealItem')));
        $deals = $this->Deal->find('all',array('conditions'=>array('Deal.status'=>1)));
        foreach ($deals as $key => $value) {
            $itemArr = array();
            $dealArr['id'] = $value['Deal']['id'];
            $dealArr['title'] = $value['Deal']['title'];
            $dealArr['imageText'] = $value['Deal']['image_text'];
            $dealArr['description'] = $value['Deal']['description'];
            $dealArr['code'] = $value['Deal']['code'];
            $dealArr['overallPrice'] = $value['Deal']['price'];
            $dealArr['listImage'] = $value['Deal']['thumbnail'];
            $dealArr['detailImage'] = $value['Deal']['image'];

            foreach ($value['DealItem'] as $k => $item) {
                $itemArr[$k]['id'] = $item['cat_id'];
                $itemArr[$k]['qty'] = $item['item_count'];
                $itemArr[$k]['isEnable'] = ($item['status'])?'true':'false';
                $itemArr[$k]['name'] = $this->getCategoryData($item['cat_id'],'name');
                $itemArr[$k]['slug'] = $this->getCategoryData($item['cat_id'],'slug');
                $itemArr[$k]['catText'] = $item['cat_text'];
                $itemArr[$k]['products'] = (!empty($item['products'])?json_encode(explode(',', $item['products'])):null);
                $itemArr[$k]['modifiers'] = ($item['modifiers']=="[]")?null:$item['modifiers'];
                $itemArr[$k]['itemCount'] = $item['item_count'];
                $itemArr[$k]['itemCondition'] = (!empty($item['item_condition'])?$item['item_condition']:null);
                $itemArr[$k]['pos'] = $item['pos'];
            }    
            $dealArr['categories']  = $itemArr;
        }
        echo json_encode($dealArr);
    }

    function getCategoryData($catId,$field){
        $this->autoRender = false;
        return $this->Category->field($field,array('Category.id'=>$catId));
    }

	
}
