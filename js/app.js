$(document).ready(function(){
  var map = draw_map();    
  draw_table();
  draw_sidetag(map);
  $("#departamento").select2();
  $("#distrito").select2();
  $("#localidad").select2();

  $('.nav-tabs>li>a').bind('click', function (e) {
    map.invalidateSize();
  });
});


function draw_map () {
  startLoading();

  L.mapbox.accessToken = 'pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg';

  var mapbox = L.tileLayer(
               'http://api.tiles.mapbox.com/v4/rparra.jmk7g7ep/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg',
                                 {     maxZoom: 18     }).on('load', finishedLoading);
  var osm = L.tileLayer(
               'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                 {     maxZoom: 18     }).on('load', finishedLoading);

  var ggl = new L.Google("HYBRID").on("MapObjectInitialized", setup_gmaps);


  var map = L.mapbox.map('map').setView([-23.388, -60.189], 7).on('baselayerchange', startLoading);
  
  var baseMaps = {
    "Calles": osm,
    "Terreno": mapbox,
    "Satélite": ggl
  };

  map.addLayer(ggl);
  L.control.layers(baseMaps).addTo(map);

  var geoJson = L.mapbox.featureLayer();
  //var geoJson = L.mapbox.featureLayer(viviendas)

  geoJson.on('layeradd', function(e) {
    var marker = e.layer,
    feature = marker.feature;

    var icon_color = mapToColor[feature.properties.departamento];
    var icon = L.mapbox.marker.icon();

    if(icon_color){
      icon = L.mapbox.marker.icon({'marker-color': icon_color});
      console.log('otro color');
    }
    marker.setIcon(icon);
  });

  geoJson.setGeoJSON(viviendas);

  var markers = new L.MarkerClusterGroup();
  markers.addLayer(geoJson);
  markers.on('click', draw_popup);


  /*geoJson.setFilter(function(f) {
            console.log(f);
            return f.properties['distrito'] === 'PASO YOBAI';
        });

  markers.clearLayers();
  markers.addLayer(geoJson);*/
  map.addLayer(markers);
  return map;
}

function draw_table () {
 // Setup - add a text input to each footer cell
  $('#lista tfoot th').each( function () {
      var title = $('#lista thead th').eq( $(this).index() ).text();
      $(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
  } );



  // DataTable
  var table = $('#lista').DataTable();

  // Apply the search
  table.columns().eq( 0 ).each( function ( colIdx ) {
      $( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {
          table
              .column( colIdx )
              .search( this.value )
              .draw();
      } );
  } );
}

function draw_sidetag(map){
  $('#opener').on('click', function() {   
    var panel = $('#slide-panel');
    if (panel.hasClass("visible")) {
       panel.removeClass('visible').css({'margin-left':'-300px'});
       $('.main-container').css({'padding-left':'0px'});
    } else {panel.addClass('visible').css({'margin-left':'0px'});
       $('.main-container').css({'padding-left':'300px'});
    }
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-down");
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-up");
    map.invalidateSize();
    return false; 
  });
}


function draw_popup(target){
  var attrs = ["grupo", "departamento", "distrito", "locacion", "proceso", "producto", "cantidad"];
  var content = "<p class=\'popup-title\'>Datos de la Vivienda</p>"
  content += draw_popup_table(target.layer.feature.properties, attrs);
  content += draw_popup_album(["/img/casa1.jpg", "/img/plano1.png", "/img/casa2.jpg", "/img/plano2.png"]);
  var popup = new L.Popup({
    "minWidth": 400
  }).setContent(content);
  target.layer.bindPopup(popup).openPopup();
  setup_modal();
}

function draw_popup_table (properties, attrs){
  var t = "<table class=\'table table-striped popup-table\'><tbody>";
  for (var i = 0; i < attrs.length; i++) {
    var key = attrs[i];
    if (properties.hasOwnProperty(key)) {
      t += draw_popup_table_row(key, properties[key]);
    }
  }
  t += "</tbody></table>";
  return t;
}

function draw_popup_table_row(key, value){
  return sprintf("<tr><td class=\'attr-title\'>%s</td><td>%s</td></tr>", key, value);
}

function draw_popup_album(imgs){
  var a = "<div id=\'album-container\' class=\'container\'><ul class=\'row album\'>";
  for (var i = 0; i < imgs.length; i++) {
    a += draw_popup_album_photo(imgs[i]);
  }
  a += "</ul></div>"
  return a;
}

function draw_popup_album_photo(img){
  return sprintf("<li class=\'col-lg-6 col-md-6 col-sm-6 col-xs-12\'><img class=\'img-responsive\' src=\'%s\'/></li>", img);
}

function setup_modal(){
  $("#headerPreview").modal('show').css(
    {
        'margin-top': function () {
            return -($(this).height() / 2);
        },
        'margin-left': function () {
            return -($(this).width() / 2);
        }
    })

  $('li img').on('click',function(){
    var src = $(this).attr('src');
    var img = '<img src="' + src + '" class="img-responsive"/>';
    $('#photo-modal').modal();
    $('#photo-modal').on('shown.bs.modal', function(){
      $('#photo-modal .modal-body').html(img);
    });
    $('#photo-modal').on('hidden.bs.modal', function(){
      $('#photo-modal .modal-body').html('');
    });
  });  
}

function startLoading() {
  var spinner = new Spinner({
    color: "#5bc0de",
    radius: 30,
    width: 15,
    length: 20
  }).spin();
  $("#loader").removeClass().append(spinner.el);
}

function finishedLoading() {
  // first, toggle the class 'done', which makes the loading screen
  // fade out
  var loader = $("#loader");
  loader.addClass('done');
  setTimeout(function() {
      // then, after a half-second, add the class 'hide', which hides
      // it completely and ensures that the user can interact with the
      // map again.
      loader.addClass('hide');
      loader.empty();
  }, 200);
}

function setup_gmaps(){
  google.maps.event.addListenerOnce(this._google, 'tilesloaded', finishedLoading);
}