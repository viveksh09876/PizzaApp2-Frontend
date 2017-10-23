import { Component, OnInit } from '@angular/core';
import { UtilService } from '../util.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-catering',
  templateUrl: './catering.component.html',
  styleUrls: ['./catering.component.css']
})
export class CateringComponent implements OnInit {
	constructor(private utilService: UtilService, private dataService: DataService) { }
	  
	catering = {
		username:'',
		email:'',
		tel:'',
		location:'',
		date:'',
		noofuser:'',
		social:'',
	};
	
	cateringRes = '';
	showLoading = false;
	startDate = new Date();
	pageTitle = '';
	pageSubtitle = '';
	pageContent = '';

	error = { show: false, isSuccess:false, message: 'Sorry ! mail not send, please try again.'};

  	ngOnInit() {
		this.dataService.getPageInfo(1).subscribe(data => {
			this.pageTitle = data.Content.page_title;
			this.pageSubtitle = data.Content.page_sub_title;
			this.pageContent = data.Content.page_content;
		});
  	}

	CateringApi() {
		this.showLoading = true;
		let CateringInfo = {
			username: this.catering.username,
			email:this.catering.email,
			tel:this.catering.tel,
			location:this.catering.location,
			date:this.catering.date,
			noofuser:this.catering.noofuser,
			social:this.catering.social
		};
	
		this.dataService.sendCateringInfo(CateringInfo).subscribe(data => {
			this.error = data;
			setTimeout(function(){
				window.location.reload();
			}, 5000);
		});
	  }

}
