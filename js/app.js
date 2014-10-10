$(document).ready(function(){
    draw_map();    
    draw_table();
    draw_sidetag();
    $("#departamento").select2();

    $('.nav-tabs>li>a').bind('click', function (e) {
      map.invalidateSize();
    });
    setup_modal();
});


function draw_map () {
  L.mapbox.accessToken = 'pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg';

  var mapbox = L.tileLayer(
               'http://api.tiles.mapbox.com/v4/rparra.jmk7g7ep/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg',
                                 {     maxZoom: 18     });
  var osm = L.tileLayer(
               'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                 {     maxZoom: 18     });

  var ggl = new L.Google("HYBRID");

  var map = L.mapbox.map('map').setView([-23.388, -60.189], 7);
  
  var baseMaps = {
    "Calles": osm,
    "Terreno": mapbox,
    "Satélite": ggl
  };

  mapbox.addTo(map);
  L.control.layers(baseMaps).addTo(map);

  var geoJson = L.mapbox.featureLayer(viviendas)

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
}

function draw_table () {
 // Setup - add a text input to each footer cell
  $('#example tfoot th').each( function () {
      var title = $('#example thead th').eq( $(this).index() ).text();
      $(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
  } );

  // DataTable
  var table = $('#example').DataTable();

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

function draw_sidetag(){
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
  var content = draw_popup_table(target.layer.feature.properties, attrs);
  content += draw_popup_album(["/img/tut1.jpg", "/img/tut2.jpg", "/img/tut3.jpg", "/img/tut4.jpg"]);
  var popup = new L.Popup({
    "minWidth": 400
  }).setContent(content);
  target.layer.bindPopup(popup).openPopup();
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
  var a = "<div class=\'container\'><ul class=\'row album\'>";
  for (var i = 0; i < imgs.length; i++) {
    console.log(i);
    a += draw_popup_album_photo(imgs[i]);
  }
  a += "</ul></div>"
  return a;
}

function draw_popup_album_photo(img){
  return sprintf("<li class=\'col-lg-1 col-md-1 col-sm-2 col-xs-3\'><img class=\'img-responsive\' src=\'%s\'/></li>", img);
}

function setup_modal(){
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