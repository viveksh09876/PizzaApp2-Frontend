import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { DataService } from '../data.service';

@Component({
  selector: 'app-applynow',
  templateUrl: './applynow.component.html',
  styleUrls: ['./applynow.component.css']
})
export class ApplynowComponent extends DialogComponent<ApplyNowModel, null> implements OnInit {

  constructor(dialogService: DialogService, private dataService: DataService) { super(dialogService); }

  showLoading = false;
  apply = {
		fname:'',
		lname:'',
		tel:'',
		email:'',
		country:'',
		city:'',
		feedback: ''
	};

  error = { show:false, isSuccess:false, message: ''};
	countryList = null;
  ngOnInit() {
		this.dataService.getCountries().subscribe(data => {
			this.countryList = data;
		});
  }

  submit(){
    this.showLoading = true;
		let ApplyInfo = {
			fname: this.apply.fname,
			lname: this.apply.lname,
			tel:this.apply.tel,
			email:this.apply.email,
			country:this.apply.country,
			city:this.apply.city,
			feedback:this.apply.feedback
		};
	
		this.dataService.sendApplyInfo(ApplyInfo).subscribe(data => {
			this.error = data;
			setTimeout(function(){
				window.location.reload();
			}, 5000);
    });
  }
}

export interface ApplyNowModel {
  //title: string;
  //message: string;
}