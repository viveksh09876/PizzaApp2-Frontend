import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { DataService } from '../data.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent extends DialogComponent<ContactUsModel, null> implements OnInit{

  constructor(dialogService: DialogService, private dataService: DataService) { super(dialogService); }

  showLoading = false;
  contact = {
		fname:'',
		lname: '',
		email:'',
		tel:'',
		feedback: '',
		location: '',
		question: ''
	};

  error = { show:false, isSuccess:false, message: ''};
  storeList = [];
	userCountryName = '';
  userCountryCode = '';
  
  ngOnInit() {
    this.getUserIp();
  }

  getUserIp() {
    this.dataService.getIp()
          .subscribe(data => {
              this.userCountryName = data.geoplugin_countryName;
              this.userCountryCode = data.geoplugin_countryCode;
              if(this.userCountryCode=='AE'){
                this.userCountryName = 'UAE';
              }
							this.getStores(this.userCountryName);
          });
  }
  
	getStores(CountryName) {
    if(CountryName.length > 0) {
      this.dataService.getCountryStore(CountryName)
            .subscribe(data => {
                this.storeList = data;
            });
    }
  }

  submit(){
    this.showLoading = true;
		let ContactInfo = {
			fname: this.contact.fname,
			lname:this.contact.lname,
			email:this.contact.email,
			tel:this.contact.tel,
			feedback:this.contact.feedback,
			location:this.contact.location,
			question:this.contact.question
		};
	
		this.dataService.sendContactInfo(ContactInfo).subscribe(data => {
			this.error = data;
			setTimeout(function(){
				window.location.reload();
			}, 5000);
    });
  }

}
export interface ContactUsModel {
  //title: string;
  //message: string;
}
