import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { ApplynowComponent } from '../applynow/applynow.component';
import { DataService } from '../data.service';


declare var jQuery: any;

@Component({
  selector: 'app-franchising',
  templateUrl: './franchising.component.html',
  styleUrls: ['./franchising.component.css']
})
export class FranchisingComponent implements OnInit {

   constructor(private dialogService: DialogService, private dataService: DataService) {
   
   }

  whyNkdPizzaTitle = '';
  whyNkdPizzaContent = '';
  whyNkdTitle = '';
  whyNkdContent = '';
  ourModelTitle = '';
  ourModelContent = '';
  applyNowTitle = '';
  applyNowContent = '';
  pageTitle = '';
  pageSubtitle = '';
  
  ngOnInit() {
    this.dataService.getPageInfo(3).subscribe(data => {
			this.whyNkdPizzaTitle = data.Content.page_title;
			this.whyNkdPizzaContent = data.Content.page_content;
    });
    this.dataService.getPageInfo(4).subscribe(data => {
			this.whyNkdTitle = data.Content.page_title;
      this.whyNkdContent = data.Content.page_content;
    });
    this.dataService.getPageInfo(5).subscribe(data => {
			this.ourModelTitle = data.Content.page_title;
			this.ourModelContent = data.Content.page_content;
    });
    this.dataService.getPageInfo(6).subscribe(data => {
			this.applyNowTitle = data.Content.page_title;
			this.applyNowContent = data.Content.page_content;
    });
    this.dataService.getPageInfo(7).subscribe(data => {
			this.pageTitle = data.Content.page_title;
			this.pageSubtitle = data.Content.page_sub_title;
		});
  }

   openModal(type) {
      if(type=='applynow'){
      this.dialogService.addDialog(ApplynowComponent, {  }, { closeByClickingOutside:true });
     }else{
      this.dialogService.addDialog(ContactUsComponent, {  }, { closeByClickingOutside:true });
     }
  }

  changTab(val) {
      let targetOption = "#"+val;
      let targetId = jQuery('#tabSwitch');
      targetId.find("a[href=\""+targetOption+"\"]").trigger("click");    
    }
}
