import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OrdernowmodalComponent } from './ordernowmodal/ordernowmodal.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ResetComponent } from './reset/reset.component';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DataService } from './data.service';
import { UtilService } from './util.service';

declare var jQuery: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showFooter = true;
  showLocationTab = true;

  constructor(private dialogService:DialogService,
                private route: ActivatedRoute,
                private router: Router,
                private dataService: DataService,
                private utilService: UtilService){

        this.router.events.subscribe((e) => {
          if (e instanceof NavigationEnd) {
            let urlArr = e.url.split('/');
            if(urlArr.indexOf('item') > -1) {
              this.showFooter = false;
            }else{
              this.showFooter = true;
            } 

            if(urlArr.indexOf('reset-password')> -1 ){
              let loggedIn = this.dataService.getLocalStorageData('isLoggedIn');
              if(!loggedIn){
                urlArr[2] = urlArr[2].replace('%40','@'); 
                this.dataService.setLocalStorageData('reset-email', urlArr[2]);
                this.dataService.setLocalStorageData('reset-key', urlArr[3]);
                this.openModal('reset');
              }
            }

            if(urlArr[1] == ''){
              this.showLocationTab = true;
            }else{
              this.showLocationTab = false;
            }
          }
        });         

  }

  
  showLogin = true;
  orderUrl = '';
  hideForUK = false;
  followUsLinks = {
    fb: 'https://www.facebook.com/nkdpizza/',
    twitter: 'https://twitter.com/NKDPizza',
    instagram: 'https://www.instagram.com/nkdpizza/'
  }

  openModal(type) {
    if(type == 'login') {
      this.dialogService.addDialog(LoginComponent, {  }, { closeByClickingOutside:true });
    }else if(type == 'ordernow') {
      this.dialogService.addDialog(OrdernowmodalComponent, {  }, { closeByClickingOutside:true });
    }else if(type=='contact'){
      this.dialogService.addDialog(ContactUsComponent, {  }, { closeByClickingOutside:true });
    }else if(type=='reset'){
      this.dialogService.addDialog(ResetComponent, {  }, { closeByClickingOutside:true });
    }
    
  }

  ngOnInit() {      

      this.router.events.subscribe((evt) => {
        if(evt instanceof NavigationEnd) {
          window.scrollTo(0, 0);
          //jQuery("body").animate({ scrollTop: 0 }, 500);
        }
          // if (!(evt instanceof NavigationEnd)) {
          //     return;
          // }
          //window.scrollTo(0, 0)
          
      });
    

      //check if user logged In
      let user = this.dataService.getLocalStorageData('isLoggedIn');
      if(user != undefined && user == 'true') {
        this.showLogin = false;
      }  


      this.dataService.getIp()
        .subscribe(data => {
            let countryName = data.geoplugin_countryName;
            let userCountryCode = data.geoplugin_countryCode;
			      countryName = 'united kingdom';
            if(countryName.toLowerCase() == 'bahrain'){
              this.orderUrl = 'http://www.nkdpizza.com/order-bh.html';
              this.followUsLinks = {
                fb: 'https://www.facebook.com/nkdpizzabh/',
                twitter: 'https://twitter.com/NKDPizzabh',
                instagram: 'https://www.instagram.com/nkdpizzabh/'
              }
            } else if (countryName.toLowerCase() == 'united kingdom') {
              this.followUsLinks = {
                fb: 'https://www.facebook.com/NKDPizzaScotland/',
                twitter: 'https://twitter.com/nkdscotland',
                instagram: 'https://www.instagram.com/nkdpizzascotland/'
              }
              this.orderUrl = '';
              this.hideForUK = true;
            }else{
              this.orderUrl = '';
            }

            countryName = this.utilService.formatCountryName(countryName);
            this.dataService.setLocalStorageData('userCountry', countryName);
            this.dataService.setLocalStorageData('userCountryCode', userCountryCode);
        });

      // jQuery("header.navigation ul.links li a").on('click', function(event) {
      //  if (this.hash !== "") {
      //         event.preventDefault();
      //         var hash = this.hash;
      //       jQuery('html, body').animate({
      //         scrollTop: jQuery(hash).offset().top-80
      //         }, 800, function(){
      //       window.location.hash = hash;
      //     });
      //   }
      // });
  }

  navigateMenu(page) {
    let pageLink = '/'+page;
    jQuery("body").toggleClass("menu-open");
    this.router.navigate([pageLink]);
  }

  logout(){
    this.dataService.clearLocalStorageData();
    window.location.href = '/uk';
    // window.location.reload();
  }


  goToFav() {
    let isLoggedIn = this.dataService.getLocalStorageData('isLoggedIn');
      if(isLoggedIn == undefined || isLoggedIn == 'false') {
         this.dialogService.addDialog(LoginComponent, {  }, { closeByClickingOutside:true });
      }else{
        this.router.navigate(['/account']); 
      }
  }

  goToOrderNow() {
    let isLoggedIn = this.dataService.getLocalStorageData('isLoggedIn');
      if(isLoggedIn == undefined || isLoggedIn == 'false') {
         this.dialogService.addDialog(LoginComponent, { }, { closeByClickingOutside:true });
      }else{
        this.dialogService.addDialog(OrdernowmodalComponent, { }, { closeByClickingOutside:true }); 
      }

  }

}
