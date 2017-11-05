import { Component, ElementRef, OnInit, AfterContentInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { RegisterComponent } from '../register/register.component';
import { LoginComponent } from '../login/login.component';
import { OrdernowmodalComponent } from '../ordernowmodal/ordernowmodal.component';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import { environment } from '../../environments/environment';


//import * as $ from 'jquery';
declare var jQuery: any;
declare var google: any;
declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit {

  slideArr = [];
  domain = environment.cmsApiPath;
  latestTweet = '';
  latestFbFeeds = '';
  latestIgFeeds = '';
  countryName = '';
  storeList = [];
  store = null;
  showLogin = true;
  twitterScreenName = '';

  constructor(private dataService: DataService,private utilService: UtilService, private dialogService: DialogService) {
    this.dataService.getIp()
    .subscribe(data => {
        this.countryName = data.geoplugin_countryName;
        this.getFeeds();
    });
  }

  openModal(type) {

     this.dialogService.addDialog(RegisterComponent, {  }, { closeByClickingOutside:true });   
  }

  ngOnInit() {
    this.getSlideImages();
    
    this.setStore();
    
    //check if user logged In
    let user = this.dataService.getLocalStorageData('isLoggedIn');
    this.dataService.setLocalStorageData('order-now', null);
    if(user != undefined && user == 'true') {
      this.showLogin = false;
    } 

    window.temp();

    this.dataService.setLocalStorageData('favItemFetched', null);
    this.dataService.setLocalStorageData('favOrdersFetched', null); 
    this.dataService.setLocalStorageData('confirmationItems', null); 
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);
    
    this.dataService.setLocalStorageData('confirmationItems', null);
    this.dataService.setLocalStorageData('confirmationFinalOrder', null);    
    
    //loadScript();

    function loadScript() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD1AfGsJjddCUaaUZ1z8a6V5-wzdKZcju8&' +
          'callback=initialize';
      document.body.appendChild(script);
    }

    

  }

  ngAfterContentInit() {
    
  }

  goToOrderNow() {
    let isLoggedIn = this.dataService.getLocalStorageData('isLoggedIn');
      if(isLoggedIn == undefined || isLoggedIn == 'false') {
         this.dialogService.addDialog(LoginComponent, { }, { closeByClickingOutside:true });
      }else{
        this.dialogService.addDialog(OrdernowmodalComponent, { }, { closeByClickingOutside:true }); 
      }

  }

  getFeeds(){
    let countryName = this.countryName;
    if(countryName.toLocaleLowerCase() == 'bahrain'){
      this.getFbFeeds('nkdpizzabh');
      this.getIgFeeds('nkdpizzabh');
      this.getTwitterFeeds('NKDPizzabh');
      this.twitterScreenName = 'NKDPizzabh';
    } else if (countryName.toLowerCase() == 'united kingdom') {
      this.getFbFeeds('NKDPizzaScotland');
      this.getIgFeeds('nkdpizzascotland');
      this.getTwitterFeeds('nkdscotland');
      this.twitterScreenName = 'nkdscotland';
    } else{
      this.getFbFeeds('nkdpizza');
      this.getIgFeeds('nkdpizzauae');
      this.getTwitterFeeds('NKDPizzaUSA');
      this.twitterScreenName = 'NKDPizzaUSA';
    }
  }
  setStore() {
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { 
          this.dataService.getStoresFromLatLong(position.coords.latitude, position.coords.longitude)
              .subscribe(data => {      
                    this.storeList = data.stores; 
                    if(this.storeList.length > 0) {
                      this.dataService.setLocalStorageData('menuCountry', this.countryName);
                      this.store = this.utilService.findNearbyStore(this.storeList, position.coords.latitude, position.coords.longitude);
                      
                      this.dataService.setLocalStorageData('latlong', 'from geolocation: ' + position.coords.latitude + ',' + position.coords.longitude);
                      this.dataService.setLocalStorageData('nearByStore', this.store.Store.id);
                    }else{
                      this.dataService.setLocalStorageData('menuCountry', 'UAE');
                    }                 
                }); 
        });

    } else {
        console.log("Geolocation is not supported by this browser.");
        this.dataService.getIp()
            .subscribe(data => {
                let countryName = data.geoplugin_countryName;                 
               
                this.dataService.getCountryStore(countryName)
                    .subscribe(data => {
                        this.storeList = data;
                        if(this.storeList.length > 0) {
                          this.dataService.setLocalStorageData('menuCountry', this.countryName);
                          this.store = this.utilService.findNearbyStore(this.storeList, data.geoplugin_latitude, data.geoplugin_longitude);
                          this.dataService.setLocalStorageData('latlong', 'from ip: ' + data.geoplugin_latitude + ',' + data.geoplugin_longitude);
                          this.dataService.setLocalStorageData('nearByStore', this.store.Store.id); 
                        } else{
                          this.dataService.setLocalStorageData('menuCountry', 'UAE');
                        }                        
                    });
                
            });
    }
  }


  getTwitterFeeds(name) {
     this.dataService.getTwitterFeeds(name)
        .subscribe(data => {
            this.latestTweet = data[0];
        })
  }

  getFbFeeds(name) {
     this.dataService.getFbFeeds(name)
        .subscribe(data => {
          let fbfeeds = data;
            if(fbfeeds.length > 0) {
              for(var i=0; i<fbfeeds.length; i++) {
                fbfeeds[i].message = fbfeeds[i].message;
                let tempImage =  fbfeeds[i].image;
                let tempArr = tempImage.split("/");
                if(tempArr[5]==undefined){
                  fbfeeds[i].image = 'assets/images/social-default.jpg';
                }else{
                  fbfeeds[i].image = fbfeeds[i].image;
                }
              }
            }
            this.latestFbFeeds = fbfeeds;
        });
  }

  getIgFeeds(name) {
     this.dataService.getIgFeeds(name)
        .subscribe(data => {
          let IgFeeds = data;
          //console.log(data);
            if(IgFeeds.length > 0) {
              for(var i=0; i<IgFeeds.length; i++) {
                IgFeeds[i].message = IgFeeds[i].message;
                let tempImage =  IgFeeds[i].image;
                let tempArr = tempImage.split("/");
                if(tempArr[5]==undefined){
                  IgFeeds[i].image = 'assets/images/social-default.jpg';
                }else{
                  IgFeeds[i].image = IgFeeds[i].image;
                }
              }
            }
          this.latestIgFeeds = IgFeeds;
        });
  }

  getSlideImages() {
       this.dataService.getSlides(1)
          .subscribe(data => {
            
              let slides = data;

              if(slides.length > 0) {
                for(var i=0; i<slides.length; i++) {
                  slides[i].Slide.image = this.domain + '/img/admin/slides/' + slides[i].Slide.image;
                  if(slides[i].Slide.text_image==''){
                    slides[i].Slide.textImage = '';
                  }else{
                    slides[i].Slide.textImage = this.domain + '/img/admin/slides/' + slides[i].Slide.text_image;
                  }
                }
              }

              this.slideArr = slides; 
               
              setTimeout(function(){
                  jQuery("#home-slider").slick({
                    infinite: true,
                    autoplay:true,
                    dots: true,
                    prevArrow: false,
                    nextArrow: false
                  });
                  setTimeout(function(){
                    if(jQuery(window).width() > 767){
                      jQuery(".slider-wrapper").css({'height':(jQuery('.img-responsive.desk-banner').height()+'px')});
                    }
                    if(jQuery(window).width() < 767){
                      jQuery(".slider-wrapper").css({'height':(jQuery('.img-responsive.mobile-banner').height()+'px')});
                    }
                },500);
              }, 1000);
               
          });
  }


  


}
