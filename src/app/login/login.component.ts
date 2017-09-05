import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { RegisterComponent } from '../register/register.component';
import { ForgotComponent } from '../forgot/forgot.component';
import { MessageComponent } from '../message/message.component';
import { OrdernowmodalComponent } from '../ordernowmodal/ordernowmodal.component';
import { DataService } from '../data.service';

declare var jQuery: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends DialogComponent<LoginModal, null> {
  
  constructor(dialogService: DialogService, 
                private dataService: DataService,
                private route: ActivatedRoute, 
                    private router: Router) {
    super(dialogService);
   }

  username = '';
  password = ''; 
  showLoading = false;
  error = { show: false, message: 'Invalid username or password!'};

  openModal(type) {
     let self = this;
     self.close();

     if(type == 'register') {
      self.dialogService.addDialog(RegisterComponent, { callback: ''  }, { closeByClickingOutside:true }); 
     }else if(type == 'ordernow') {
      self.dialogService.addDialog(OrdernowmodalComponent, { }, { closeByClickingOutside:true });   
     }else if(type == 'forgot'){
      self.dialogService.addDialog(ForgotComponent, { callback: '' }, { closeByClickingOutside:true }); 
     }
       
  }

  openMessageModal(messageText) {
     let self = this;
     self.close();
     self.dialogService.addDialog(MessageComponent, { title: 'Welcome', message: messageText, buttonText: 'Start Ordering', doReload: true }, { closeByClickingOutside:true });   
  }


  loginApi() {

    this.showLoading = true;
    this.dataService.login(this.username,this.password)
         .subscribe(data => {
              if(data.Status == 'Error') {
                this.error.show = true;
              }else if(data.Status == 'OK') {
                this.dataService.getProfile(data.id).subscribe(pdata => {
                  let user = {
                    id: pdata.Id,
                    firstName : pdata.FirstName,
                    lastName: pdata.LastName,
                    email: pdata.Email,
                    phone: pdata.Phone,
                    dob: pdata.DOB,
                    zip: pdata.PostalCode,
                    favloc: pdata.FavLocation,
                    defaultAddress: null
                  }
                  
                  if (pdata.Address1 != '' && pdata.Address1 != null && pdata.Address1 != "null") {
                    let address = JSON.parse(pdata.Address1);
                    if (address.is_default == 1) {
                      user.defaultAddress = address;
                    }
                  }

                  if (pdata.Address2 != '' && pdata.Address2 != null && pdata.Address2 != "null") {
                    let address = JSON.parse(pdata.Address2);
                    if (address.is_default == 1) {
                      user.defaultAddress = address;
                    }
                  }

                  if (pdata.Address3 != '' && pdata.Address3 != null && pdata.Address3 != "null") {
                    let address = JSON.parse(pdata.Address3);
                    if (address.is_default == 1) {
                      user.defaultAddress = address;
                    }
                  }

                  

                  this.dataService.setLocalStorageData('user-details', JSON.stringify(user));
                  this.dataService.setLocalStorageData('isLoggedIn', true);
                  window.location.reload(); 
                  //this.router.navigate(['/account']);           
                  //this.openMessageModal('Welcome '+user.firstName + '!');
                }); 
              }        
             
          });
  }

 
}

export interface LoginModal {
  //title: string;
  //message: string;
}
