import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {

  constructor(private dataService: DataService) { }

  termsTitle = '';
  termsContent = '';

  ngOnInit() {
  this.dataService.getPageInfo(8).subscribe(data => {
			this.termsTitle = data.Content.page_title;
			this.termsContent = data.Content.page_content;
    });
  }

}
