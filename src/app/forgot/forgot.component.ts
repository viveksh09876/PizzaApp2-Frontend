import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { DataService } from '../data.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent extends DialogComponent<ForgotModal, null>  {

  constructor(dialogService: DialogService, private dataService: DataService) { super(dialogService); }

  user = {useremail:''};
  showLoading = false;
  error = { show: false, message: '', isSuccess:false};

  ngOnInit() {  }

  forgotPassword(){
    this.showLoading = true;
    this.dataService.forgotPassword(this.user)
    .subscribe(data => {
      if(data.Status == 'Error') {
        this.error.show = true;
        this.error.isSuccess = false;
        this.error.message = data.Message;
      }else if(data.Status == 'OK') {
        this.error.show = true;
        this.error.isSuccess = true;
        this.error.message = data.Message;
      }
      this.showLoading = false;
    });
  }

}

export interface ForgotModal {
  callback: string;
  //message: string;
}