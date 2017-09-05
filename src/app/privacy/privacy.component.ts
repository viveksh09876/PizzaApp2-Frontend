import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {

  constructor(private dataService: DataService) { }

  privacyTitle = '';
  privacyContent = '';

  ngOnInit() {
  this.dataService.getPageInfo(9).subscribe(data => {
			this.privacyTitle = data.Content.page_title;
			this.privacyContent = data.Content.page_content;
    });
  }

}
