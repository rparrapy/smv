var SMV = SMV || {};


$(document).ready(function(){
  var map = draw_map();    
  draw_table();
  draw_sidetag(map);
  $("#departamento").select2();
  $("#distrito").select2();
  $("#localidad").select2();
  add_filter_listeners(map);


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
  SMV.markerLayer = markers;
  SMV.geoJsonLayer = geoJson;
  return map;
}

function draw_table_details ( d ) {
  console.log('dibujando detalles');
  var table = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
  for(var i = max_columns; i < table_columns.length; i++){
    row = sprintf('<tr><td>%s:</td><td>%s</td></tr>', attr_to_label[table_columns[i]], d[table_columns[i]])
    table += row;
  }
  table += '</table>';
  return table;
}

function draw_table () {

  /*var dataset = viviendas.features.map(function(f){
                  return table_columns.map(function(c){
                    return f.properties[c];
                  });
                });*/
  var dataset = viviendas.features.map(function(f){
    return f.properties;
  })

  var columns = table_columns.map(function(c, i){
    var visible = (i < max_columns);
    return { 
        "title": attr_to_label[c],
        "data": c,
        "visible": visible
      };
  });

  columns.unshift({
                "class":          'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            });


  // DataTable
  var table = $('#lista').DataTable({
    "language": {
      "sProcessing":     "Procesando...",
      "sLengthMenu":     "Mostrar _MENU_ registros",
      "sZeroRecords":    "No se encontraron resultados",
      "sEmptyTable":     "Ningún dato disponible en esta tabla",
      "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
      "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
      "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
      "sInfoPostFix":    "",
      "sSearch":         "Buscar:",
      "sUrl":            "",
      "sInfoThousands":  ",",
      "sLoadingRecords": "Cargando...",
      "oPaginate": {
          "sFirst":    "Primero",
          "sLast":     "Último",
          "sNext":     "Siguiente",
          "sPrevious": "Anterior"
      },
      "oAria": {
          "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
          "sSortDescending": ": Activar para ordenar la columna de manera descendente"
      }
    },
    "data": dataset,
    "columns": columns.splice(0, max_columns + 1),
    "order": [[ 1, "asc" ]]
  });

  // Add event listener for opening and closing details
  $('#lista tbody').on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr');
      var row = table.row( tr );

      if ( row.child.isShown() ) {
          // This row is already open - close it
          row.child.hide();
          tr.removeClass('shown');
      }
      else {
          // Open this row
          row.child( draw_table_details(row.data()) ).show();
          tr.addClass('shown');
      }
  } );

  // Setup - add a text input to each footer cell
  $('#lista tfoot th:not(:first)').each( function () {
      var title = $('#lista thead th').eq( $(this).index() ).text();
      $(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
  } );

  // Apply the search
  table.columns().eq( 0 ).each( function ( colIdx ) {
      $( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {
          table
              .column( colIdx )
              .search( this.value )
              .draw();
      } );
  } );
  $('tfoot').insertAfter('thead');
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
  var attrs = ["proyecto", "estado", "contrato", "empresa", "razon_social", "ruc", "monto",
              "codigo_licitacion", "fecha_inicio", "fecha_fin", "departamento", "distrito", "localidad",
              "terreno", "construido", "cantidad_viviendas"];
  var content = "<p class=\'popup-title\'>Datos de la Vivienda</p>"
  content += draw_popup_table(target.layer.feature.properties, attrs);
  content += draw_popup_album(["img/casa1.jpg", "img/plano1.png", "img/casa2.jpg", "img/plano2.png"]);
  var popup = new L.Popup({
    "minWidth": 400
  }).setContent(content);
  target.layer.bindPopup(popup).openPopup();
  setup_modal();
  console.log(popup);
}

function draw_popup_table (properties, attrs){
  var t = "<table class=\'table table-striped popup-table table-condensed\'><tbody>";
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
  return sprintf("<tr><td class=\'attr-title\'>%s</td><td>%s</td></tr>", attr_to_label[key], value);
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

function add_filter_listeners(map){
  $("#proyecto li input[value='Todos']").change(function(){
    var checked = $(this).prop('checked');
    $("#proyecto li input").prop('checked', this.checked);
  });

  $('#proyecto li input, #departamento, #distrito, #localidad').change(function(){
    update_filters(map);
  });

}

// This function is called whenever someone clicks on a checkbox and changes
// the selection of markers to be displayed.
function update_filters(map) {
  var proyectos = get_selected_checkbox('#proyecto li input');
  var departamentos = get_selected_combo('#departamento');
  console.log(map.featureLayer);

  SMV.geoJsonLayer.setFilter(function(feature) {
    // If this symbol is in the list, return true. if not, return false.
    // The 'in' operator in javascript does exactly that: given a string
    // or number, it says if that is in a object.
    // 2 in { 2: true } // true
    // 2 in { } // false
    var proyectoFilter =  feature.properties['proyecto'] in proyectos;
    var departamentoFilter = $.isEmptyObject(departamentos) || feature.properties['departamento'] in departamentos;

    var showMarker = departamentoFilter;
 
    return (showMarker);
  });

  SMV.markerLayer.clearLayers();
  SMV.markerLayer.addLayer(SMV.geoJsonLayer);
}

function get_selected_checkbox(selector){
  var checkboxes = $(selector);
  var enabled = {};
  // Run through each checkbox and record whether it is checked. If it is,
  // add it to the object of types to display, otherwise do not.
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) enabled[checkboxes[i].value] = true;
  }
  return enabled;
}

function get_selected_combo(selector){
  var value = $(selector).select2('val');
  var enabled = {};
  // Run through each checkbox and record whether it is checked. If it is,
  // add it to the object of types to display, otherwise do not.
  for (var i = 0; i < value.length; i++) {
    enabled[value[i]] = true;
  }
  return enabled;
}
