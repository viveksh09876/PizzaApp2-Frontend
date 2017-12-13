
var country = 'UK';
var lat = '25.040657';
var lng = '55.197286';
var map, places = [], cordinates, pos, contentString, coordinates;
var zoom=3;
cmsurl = "https://"+ window.location.hostname+"/uk/dev";
//cmsurl = "https://nkdpizza.com/uk/dev";
//cmsurl = "https://mavin360.com/demo/nkd/dev";
var directionUrl = 'http://maps.google.com/';



    /*Maps*/

var infowindow;
var markers = [];

$(document).ready(function(){

  //initSlider();
    $('#signinModal button.signup, #signupModal button[type="submit"]').click(function(){
        $('body').addClass('modalopen');
    });
    
   
    $("#menuButton,.menu-overlay").click(function(e){
    	e.preventDefault();
    	$("body").toggleClass("menu-open");
    });

    $(".custom-select").change(function(){
    	var targetOption = "#"+$(this).val();
    	var targetId = $($(this).attr("target"));
    	targetId.find("a[href="+targetOption+"]").trigger("click");
    });
    
    
    $('.items_Select .item').click(function(e){
        $(this).toggleClass('active');
    });
    
    /*Size radio*/
    $('.pizza-size .radio').click(function(){
        $(".cta-btn").removeClass("active");
        $(this).find('.cta-btn').addClass('active');
    });

    
    // $('.toppings .checkbox input').click(function(){
        
    //     if($('input[type=checkbox]:checked')){
    //         $(this).parent('.checkbox').addClass("extra").find('.cta-btn').text("Extra Added");
            
    //     }else{
    //          $(this).parent('.checkbox').rempoveClass("extra").find('.cta-btn').text("add extra");
    //     }
        
        
    // });
    
	//$('.scroller').mCustomScrollbar();



});

function temp() {
mapboxgl.accessToken = 'pk.eyJ1IjoicHVzaHBlbmRyYXJhaiIsImEiOiJjajRwYzFtOTYxeWd0MzJwbDdsaGNzOTZiIn0.a9BUA890Vtyeqy21AaLClQ';
$(document).ready(function(){
    
    $.get(cmsurl + '/webservice/getip', function(resp){
        resp = JSON.parse(resp);
        country = resp.geoplugin_countryName;
        if(country=='United States'){
          country = 'usa';
        }
		
		if(country.toLowerCase()=='united kingdom'){
          country = 'UK';
        }
        //country = 'UK';
          
        var mapText = 'coming soon to a location near you';
        var zoomLabel = 5;
        if(country == 'UAE' || country == 'United Arab Emirates') {
            country = 'UAE';
            var zoomLabel = 5;
        }

        // inittialize map
        lat = resp.geoplugin_latitude;
        lng = resp.geoplugin_longitude;

        // directionUrl = directionUrl + '?saddr=' + lat + ',' + lng;
        directionUrl = directionUrl + '?';

        var mapCanvas = new mapboxgl.Map({
            container: 'mapCanvas',
            style: 'mapbox://styles/pushpendraraj/cj4ugee221cri2rpmymcpg3yw',
            center: [lng,lat],
            zoom: zoomLabel
        });
         mapCanvas.scrollZoom.disable();
         mapCanvas.dragRotate.disable();
         mapCanvas.addControl(new mapboxgl.NavigationControl());


        //country = 'UAE'; 
        // if(country == 'UAE' || country == 'United Arab Emirates') {
        //     cordinates = [[25.040657,55.197286],[25.074192,55.139092],[25.184279,55.263638]];
        //     places = ['Location 1','Location 2','Location 3'];
            
            
        //     contentString = [
        //         '<div class="infoWrapper"><a class="close-btn" id="closeBtn"></><a href="#" class="custom-button"><span>order now</span></a><div class="image-container"><img src="assets/images/pickup-delivery/img-1.jpg" class="img-responsive" alt="Map Image"/></div><div class="content-container"><div class="media"><div class="media-body"><h4 class="media-heading">NKD Pizza Motor City</h4><p>Shop 1, Kojak Bldg, Motor City - Dubai</p></div><div class="media-right"><a href="'+ directionUrl + '&daddr=' + cordinates[0][0] + ',' + cordinates[0][1]  +'" target="_blank"><img class="media-object" src="assets/images/direction-btn.jpg" alt="Directions"></a></div></div><ul class="list-inline"><li><a><img src="assets/images/time-icon.jpg"/><span>Open now:  10:30AMâ€“2AM<span/></a></li><li><a><img src="assets/images/phone-icon.jpg"/><span>04 421 3734<span/></a></li></ul></div><div class="tail-wrapper"></div></div>',

        //         '<div class="infoWrapper"><a class="close-btn" id="closeBtn"></><a href="#" class="custom-button"><span>order now</span></a><div class="image-container"><img src="assets/images/pickup-delivery/img-2.jpg" class="img-responsive" alt="Map Image"/></div><div class="content-container"><div class="media"><div class="media-body"><h4 class="media-heading">Dubai Marina</h4><p>G05, West Avenue Bldg, <br>Dubai Marina-Dubai, UAE</p></div><div class="media-right"><a href="'+ directionUrl + '&daddr=' + cordinates[1][0] + ',' + cordinates[1][1]  +'" target="_blank"><img class="media-object" src="assets/images/direction-btn.jpg" alt="Directions"></a></div></div><ul class="list-inline"><li><a><img src="assets/images/time-icon.jpg"/><span>Open now:  10:30AMâ€“2AM<span/></a></li><li><a><img src="assets/images/phone-icon.jpg"/><span>04 421 3734<span/></a></li></ul></div><div class="tail-wrapper"></div></div>',

        //         '<div class="infoWrapper"><a class="close-btn" id="closeBtn"></><a href="#" class="custom-button"><span>order now</span></a><div class="image-container"><img src="assets/images/pickup-delivery/img-3.jpg" class="img-responsive" alt="Map Image"/></div><div class="content-container"><div class="media"><div class="media-body"><h4 class="media-heading">Business Bay</h4><p>G02, Bayswater Bldg, <br>Business Bay-Dubai, UAE</p></div><div class="media-right"><a href="'+ directionUrl + '&daddr=' + cordinates[2][0] + ',' + cordinates[2][1]  +'"  target="_blank"><img class="media-object" src="assets/images/direction-btn.jpg" alt="Directions"></a></div></div><ul class="list-inline"><li><a><img src="assets/images/time-icon.jpg"/><span>Open now:  10:30AMâ€“2AM<span/></a></li><li><a><img src="assets/images/phone-icon.jpg"/><span>04 421 3734<span/></a></li></ul></div><div class="tail-wrapper"></div></div>'
        //     ];
          
        //     for(var u=0; u<cordinates.length; u++) { 
        //       var infoWindowText = contentString[u];
        //       var latitude = cordinates[u][0];
        //       var longitude = cordinates[u][1];
        //       // create a DOM element for the marker
        //       var el = document.createElement('div');
        //       el.className = 'marker';
        //       el.style.backgroundImage = 'url('+ cmsurl+'/img/map-marker.png)';
        //       el.style.width = '40px';
        //       el.style.height = '40px';

        //       // create the popup
        //       var popup = new mapboxgl.Popup({offset: 25})
        //           .setHTML(infoWindowText)

        //       // create DOM element for the marker
        //       var em = document.createElement('div');
        //       em.className = 'popup';

        //       // add marker to map
        //       new mapboxgl.Marker(el, {offset: [-40 / 2, -40 / 2]})
        //           .setLngLat([longitude,latitude])
        //           .setPopup(popup)
        //           .addTo(mapCanvas);

        //     }
        //     if(cordinates.length > 1) {
        //       var locText = ' locations';
        //     }else{
        //       var locText = ' location';
        //     }

        //     mapCanvas.setCenter([longitude, latitude]);
        //     // mapCanvas.setView([longitude, latitude],5);

        //     mapText = 'currently open at <span>'+cordinates.length + locText + '</span> <strong>' + country + '</strong>';

        //     $('#mapText').html(mapText);
        // }else{ 

          $.get(cmsurl + '/webservice/getCountryStores/'+country, function(res){
                  var stData = JSON.parse(res);
                  if(stData.length > 0) {      
                      for(var p=0; p<stData.length; p++) { 
                          var latitude = stData[p].Store.latitude;
                          var longitude = stData[p].Store.longitude;

                          var infoWindowText = '<div class="infoWrapper"><a class="close-btn" id="closeBtn"></><a href="/uk/#/menu" class="custom-button"><span>order now</span></a><div class="image-container"><img src="'+ cmsurl +'/' + stData[p].Store.store_image +'" class="img-responsive" alt="Map Image"/></div><div class="content-container"><div class="media"><div class="media-body"><h4 class="media-heading">'+stData[p].Store.store_name+'</h4><p>'+stData[p].Store.store_address+'</p></div><div class="media-right"><a href="'+ directionUrl + '&daddr=' + latitude + ',' + longitude  +'" target="_blank"><i class="icon icon-directions"></i> Direction</a></div></div><ul class="list-inline"><li><a><i class="icon icon-time"></i><span>Open now:  '+ getStoreTimings()+'<span/></a></li><li><a href="tel:'+stData[p].Store.store_phone+'"><i class="icon icon-phone"></i><span>'+stData[p].Store.store_phone+'<span/></a></li></ul></div><div class="tail-wrapper"></div></div>';

                              // create a DOM element for the marker
                              var el = document.createElement('div');
                              el.className = 'marker';
                              el.style.backgroundImage = 'url('+ cmsurl +'/img/map-marker.png)';
                              el.style.width = '40px';
                              el.style.height = '40px';

                              // create the popup
                              var popup = new mapboxgl.Popup({offset: 25})
                                  .setHTML(infoWindowText)

                              // create DOM element for the marker
                              var em = document.createElement('div');
                              em.className = 'popup';

                              // add marker to map
                              new mapboxgl.Marker(el, {offset: [-40 / 2, -40 / 2]})
                                  .setLngLat([longitude,latitude])
                                  .setPopup(popup)
                                  .addTo(mapCanvas);

                          p++;              
                      }

                      if(stData.length > 1) {
                        var locText = ' locations';
                      }else{
                        var locText = ' location';
                      }
                      mapCanvas.setCenter([longitude, latitude]);
					  
					//   if (country != 'UK') {
						  
					 	  mapText = 'currently open at <span>'+stData.length + locText + '</span> <strong>' + country + '</strong>';
					//   }
                      

                      
                  } 
                    
                  $('#mapText').html(mapText);
          });
      //}
  });
});
}


function getStoreTimings() {
    let n = this.getCurrentDay();
    let storeTime = '12:00pm - 9:45pm'; 
    if (n == 'Friday' || n == 'Saturday') {
      storeTime = '12:00pm - 10:45pm';
    }

    return storeTime;
  }


  function getCurrentDay() {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    
    var n = weekday[d.getDay()];
    return n;
  }



    
    $(window).scroll(function() {
        if ($(window).width() >= 768) {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 250) {
    $('.viewcart_sec').css("margin-top", $("footer").offset().top - $('.viewcart_sec').height() - 230)
       $('.viewcart_sec').removeClass('fixedsticky');
   }
   else{
    $('.viewcart_sec').css("margin-top", 0);
    $('.viewcart_sec').addClass('fixedsticky');
   }
}
});

   

    /*$(document).ready(function(){
        $('.mobileallergens span').click(function(){
            $('body').toggleClass('overly');
            $('.mobileallergens').toggleClass('visi');
            $(this).next().toggleClass('slide');
        });*/
//        
//        
//        
//        $('header .menu-button').click(function(){
//            $(this).toggleClass('reverse');
//            $('.main-navigation').toggleClass('moveslide');
//            $('body').toggleClass('blackoverly');
//        });
//        $('.secondary_menu .dropdown_rightmenu li a').click(function(){
//            $('.secondary_menu .dropdown_rightmenu li a').next().removeClass('shownow');
//            $(this).next().toggleClass('shownow');
//        });
//       
//         $('.secondary_menu .dropdown_rightmenu li a').click(function(){
//              if($(this).next().is(":visible") == true) {
//                $('.secondary_menu .dropdown_rightmenu li ul').hide();
//              }
//              else{
//                $('.secondary_menu .dropdown_rightmenu li ul').hide();
//                $(this).next().toggle();
//              }
//        });
//        
//         $(".menutabs li").click(function(){
//            var xyz = $(this).index();
//            $(".menutabs li").removeClass('active');
//            $(this).addClass('active');
//            $(".menulist-items .tab-content > div").hide();
//            $(".menulist-items .tab-content > div").eq(xyz).show();
//        });
//        
//        $(".menu_innertabs li").click(function(){
//            var xyz = $(this).index();
//            $(".menu_innertabs li").removeClass('active');
//            $(".menu_innertabs li").eq(xyz).addClass('active');
//            $(".menuTabdetails .tab_content").removeClass('active');
//            $(".menuTabdetails .tab_content").eq(xyz).addClass('active');
//        });
//        
//        
 //   });

