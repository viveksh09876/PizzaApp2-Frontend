import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { DataService } from '../data.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent extends DialogComponent<ResetModel, null> implements OnInit{

  constructor(dialogService: DialogService, private dataService: DataService) { super(dialogService); }

  user = {password:'', cpassword:'', email:'', key:''};
  showLoading = false;
  error = { show: false, message: '', isSuccess:false};

  ngOnInit() {  }

  resetPassword(){
    this.showLoading = true;
    this.user.email = this.dataService.getLocalStorageData('reset-email');
    this.user.key = this.dataService.getLocalStorageData('reset-key');
    if(this.user.password==this.user.cpassword){
      this.dataService.resetPassword(this.user)
      .subscribe(data => {
        if(data.Status == 'OK') {
          this.error.show = true;
          this.error.isSuccess = true;
          this.error.message = data.Message;
          setTimeout(()=>{ 
            let self = this;
            self.close();
            this.openModal('login');
        },3000);
        }else if(data.Status == 'Error') {
          this.error.show = true;
          this.error.isSuccess = false;
          this.error.message = data.Message;
        }
        this.dataService.setLocalStorageData('reset-email', '');
        this.dataService.setLocalStorageData('reset-key', '');
      });
    }else{
      this.error.show = false;
      this.error.isSuccess = false;
      this.error.message = '';
      alert('Password not matched!');
    }
    this.showLoading = false;
  }

  openModal(type) {
    if(type == 'login') {
      this.dialogService.addDialog(LoginComponent, {  }, { closeByClickingOutside:true });
    }
    
  }

}
export interface ResetModel {
  //title: string;
  //message: string;
}