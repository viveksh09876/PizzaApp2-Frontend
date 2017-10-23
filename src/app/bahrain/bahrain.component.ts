import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bahrain',
  templateUrl: './bahrain.component.html',
  styleUrls: ['./bahrain.component.css']
})
export class BahrainComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  this.redirect();
  }

//loadScript();

     loadScript() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD1AfGsJjddCUaaUZ1z8a6V5-wzdKZcju8&' +
          'callback=initialize';
      document.body.appendChild(script);
    }

    

     redirect() {
      var key = "814f9c9990fcac0b164c090bd492960a";
        var device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
        var client_height = window.top.document.documentElement.clientHeight;
      if(device == true){
        window.open("https://online.sapaad.com/users/new_order?key="+key, "_top");
      }else{

        var html = '<iframe src="https://online.sapaad.com/users/new_order?key='+key+'&ref='+location.href+'" style="width: 100%; height: '+client_height+'px; border: 0px; margin-bottom: 0px;">Your browser does not support inline frames.</iframe>'
          document.write(html);
      }
    }


}
