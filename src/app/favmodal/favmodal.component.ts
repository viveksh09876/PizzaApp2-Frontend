import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { DataService } from '../data.service';
import { UtilService } from '../util.service';
import { MessageComponent } from '../message/message.component';

declare var jQuery: any;

@Component({
  selector: 'app-favmodal',
  templateUrl: './favmodal.component.html',
  styleUrls: ['./favmodal.component.css']
})
export class FavmodalComponent extends DialogComponent<FavModal, null> {
  
  constructor(dialogService: DialogService, private dataService: DataService, private utilService: UtilService) {
    super(dialogService);
   }

   item = this.item;
   favTitle = '';
   showSaving = false;
   type = this.type;
   alertMsg = '';
  
  saveFav() {

      if(this.favTitle.trim() != '') {
        this.alertMsg = '';
        this.showSaving = true;
        let userDetails = JSON.parse(this.dataService.getLocalStorageData('user-details'));
        let userId = userDetails.id;
        let favData = null;

        if(this.type == 'item') {
          let favObj = this.utilService.formatFavData(this.item);
          let favDataObj = {
            userId: userDetails.id,
            data: favObj
          } 
          favData = favDataObj;
        }    
        
        this.dataService.saveFavItem(userId, this.favTitle, favData, this.type)
          .subscribe(data => {
              this.showSaving = true;
              this.openMessageModal('Your favourite item has been saved successfully!');
              //console.log('fav resp', data);
          });

      } else {
          
          this.alertMsg = 'Enter valid title';  
      }
  }


  openMessageModal(messageText) {
     let self = this;
     self.close();
     self.dialogService.addDialog(MessageComponent, { title: 'Success', message: messageText, buttonText: 'Continue', doReload: false }, { closeByClickingOutside:true });   
  }

 
}

export interface FavModal {
  item: object;
  type: '';
}
