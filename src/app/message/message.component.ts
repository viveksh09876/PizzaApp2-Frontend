import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { DataService } from '../data.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent extends DialogComponent<MessageModal, null> {
  
  constructor(dialogService: DialogService, private dataService: DataService) {
    super(dialogService);
   }

  message = this.message;
  buttonText = this.buttonText;
  doReload = this.doReload;
  title = this.title;

  ngOnInit() {

    setTimeout(function() {
      this.close();
    }, 3000);

  }

  closeModal() {
    this.close();
    if(this.doReload) {
      location.reload();
    }

  }
 
}

export interface MessageModal {
  title: string;
  message: string;
  buttonText: string;
  doReload: boolean;
}
