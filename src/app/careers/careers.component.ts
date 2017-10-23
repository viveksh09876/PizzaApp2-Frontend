import { Component, OnInit } from '@angular/core';
import { UtilService } from '../util.service';
import { DataService } from '../data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.css']
})
export class CareersComponent implements OnInit {
	
  constructor(private utilService: UtilService, private dataService: DataService) { }

	uploadFile: any;
  hasBaseDropZoneOver: boolean = false;
  domain = environment.cmsApiPath;
  options: Object = {
    url: this.domain + '/webservice/uploadAttachment/'
  };
  sizeLimit = 2000000;
 
  handleUpload(data): void {
    this.showLoading = true;
    if (data && data.response) {
			data = JSON.parse(data.response);
			this.uploadFile = data;
			this.career.attachment = this.uploadFile.originalName;
      this.career.resume = this.uploadFile.generatedName;
      this.showLoading = false;
    }
  }
 
  fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
 
  beforeUpload(uploadingFile): void {
    if (uploadingFile.size > this.sizeLimit) {
      uploadingFile.setAbort();
      alert('File is too large');
    }
	}
	
  career = {
		fname:'',
		lname:'',
		email:'',
		tel:'',
		position:'',
		lkdin:'',
		resume:'',
		attachment:''
  };
  
  showLoading = false;
	error = { show: false, isSuccess:false, message: 'Sorry ! mail not send, please try again.'};
	pageTitle = '';
  pageSubtitle = '';
  pageContent = '';

  ngOnInit() {
    this.dataService.getPageInfo(2).subscribe(data => {
			this.pageTitle = data.Content.page_title;
			this.pageSubtitle = data.Content.page_sub_title;
			this.pageContent = data.Content.page_content;
		});
  }

  Submit(){
    this.showLoading = true;
		let CareerInfo = {
      fname: this.career.fname,
      lname: this.career.lname,
			email:this.career.email,
			tel:this.career.tel,
			position:this.career.position,
			lkdin:this.career.lkdin,
			resume:this.career.resume
		};
	
		this.dataService.sendCareerInfo(CareerInfo).subscribe(data => {
			this.error = data;
			setTimeout(function(){
				window.location.reload();
			}, 3000);
		});
  }

}
