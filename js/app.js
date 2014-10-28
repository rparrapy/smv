/*
 * @author  Rodrigo Parra 
 * @copyright 2014 Governance and Democracy Program USAID-CEAMSO
 * @license   http://www.gnu.org/licenses/gpl-2.0.html
 * 
 * USAID-CEAMSO
 * Copyright (C) 2014 Governance and Democracy Program
 * http://ceamso.org.py/es/proyectos/20-programa-de-democracia-y-gobernabilidad
 * 
----------------------------------------------------------------------------
 * This file is part of the Governance and Democracy Program USAID-CEAMSO,
 * is distributed as free software in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
 * FOR A PARTICULAR PURPOSE. You can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License version 2 as published by the 
 * Free Software Foundation, accessible from <http://www.gnu.org/licenses/> or write 
 * to Free Software Foundation (FSF) Inc., 51 Franklin St, Fifth Floor, Boston, 
 * MA 02111-1301, USA.
 ---------------------------------------------------------------------------
 * Este archivo es parte del Programa de Democracia y Gobernabilidad USAID-CEAMSO,
 * es distribuido como software libre con la esperanza que sea de utilidad,
 * pero sin NINGUNA GARANTÍA; sin garantía alguna implícita de ADECUACION a cualquier
 * MERCADO o APLICACION EN PARTICULAR. Usted puede redistribuirlo y/o modificarlo 
 * bajo los términos de la GNU Lesser General Public Licence versión 2 de la Free 
 * Software Foundation, accesible en <http://www.gnu.org/licenses/> o escriba a la 
 * Free Software Foundation (FSF) Inc., 51 Franklin St, Fifth Floor, Boston, 
 * MA 02111-1301, USA.
 */

$(document).ready(function(){
  var mapTabActive = check_url();
  draw_table();
  draw_sidetag(map, !mapTabActive);
  draw_or_defer_map(mapTabActive);
  setup_filters();
  add_filter_listeners(map);
  setup_modal_navigation();
  setup_download_buttons();
  setup_intro();
});

function check_url(){
  // Javascript to enable link to tab
  var url = document.location.toString();
  var hash = url.split('#')[1] || 'mapa';
  if (url.match('#')) {
      $('.navbar-nav a[href=#'+hash+']').tab('show') ;
  } 

  // Change hash for page-reload
  $('.navbar-nav a').on('click', function (e) {
      window.location.hash = e.target.hash;
  })
  return !_(['listado', 'acerca-de']).contains(hash);
}

function draw_or_defer_map(mapTabActive){
  if(mapTabActive){
    SMV.map = draw_map();
  }else{
    finishedLoading();
    $('.navbar-nav a').on('click', function (e) {
      if(e.target.hash === '#mapa' && !!! SMV.map){
        SMV.map = draw_map();
      }
    });
  }
}

function draw_map() {
  startLoading();

  L.mapbox.accessToken = 'pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg';
  var layers =  SMV.LAYERS();
  var mapbox = layers.MAPBOX.on('load', finishedLoading);
  var osm = layers.OPEN_STREET_MAPS.on('load', finishedLoading);

  var gglHybrid = layers.GOOGLE_HYBRID.on("MapObjectInitialized", setup_gmaps);
  var gglRoadmap = layers.GOOGLE_ROADMAP.on("MapObjectInitialized", setup_gmaps);


  var map = L.map('map', {maxZoom: 18, minZoom: 3, worldCopyJump: true, attributionControl: false})
    .setView([-23.388, -60.189], 7)
    .on('baselayerchange', startLoading);
  
  var baseMaps = {
    "Calles OpenStreetMap": osm,
    "Terreno": mapbox,
    "Satélite": gglHybrid,
    "Calles Google Maps": gglRoadmap
  };

  map.addLayer(gglRoadmap);
  
  var geoJson = L.mapbox.featureLayer();
  //var geoJson = L.mapbox.featureLayer(viviendas)

  geoJson.on('layeradd', function(e) {
    var marker = e.layer,
    feature = marker.feature;

    var img = SMV.ESTADO_TO_ICON[feature.properties['Estado de Obra']];
    if(img){
      marker.setIcon(L.icon({
        iconUrl: img,
        iconSize: [32, 32]
      }));
    }
  });

  geoJson.setGeoJSON(viviendas);

  var markers = new L.MarkerClusterGroup({minZoom: 6});
  markers.addLayer(geoJson);
  markers.on('click', draw_popup);


  /*
  markers.clearLayers();
  markers.addLayer(geoJson);*/
  map.addLayer(markers);
  SMV.markerLayer = markers;
  SMV.geoJsonLayer = geoJson;

  SMV.infoBox = draw_info_box();
  SMV.infoBox.addTo(map);
  L.control.layers(baseMaps).addTo(map);

  map.on('popupclose', function(e){
    SMV.infoBox.update();
  });

  markers.on('clustermouseover', function(e){
    var features = _.pluck(e.layer.getAllChildMarkers(), 'feature');
    SMV.infoBox.update(features);
  });

  markers.on('clustermouseout', function(e){
    SMV.infoBox.update();
  });

  $('#opener').click();

  return map;
}

function draw_info_box(){
  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info-box'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (f) {
    var msg = this._div.innerHTML;
    if(f instanceof Array){
      msg = get_summary_message(f);
    }else if(f){
      msg = sprintf('Mostrando un asentamiento del proyecto %s con %s viviendas',
      f.properties['Proyecto'], f.properties['Cantidad de Viviendas']);
    }else{
        var features = _(SMV.geoJsonLayer.getLayers()).map(function(l){ return l.feature; });
        msg = get_summary_message(features);
    }

    this._div.innerHTML = msg;
  };

  return info;
}

function get_summary_message(features){
  var cantidadDepartamentos = _(features).chain()
    .map(function(f){ return f.properties['Departamento'] })
    .filter(function(e){ return !(e === "ASUNCION")})
    .unique().value().length;

  if(cantidadDepartamentos === 0){
    cantidadDepartamentos += 1;
  }

  var cantidadProyectos = features.length;
  var cantidadViviendas = _(features)
    .reduce(function(cont, f){ return cont + parseInt(f.properties['Cantidad de Viviendas']) }, 0);

  var departamentoLabel = cantidadDepartamentos > 1 ? 'departamentos' : 'departamento';
  var equivalenteLabel = cantidadProyectos > 1 ? 'equivalentes' : 'equivalente';
  var proyectoLabel = cantidadProyectos > 1 ? 'obras' : 'obra';
  var viviendaLabel = cantidadViviendas > 1 ? 'viviendas' : 'vivienda';
  return sprintf('%s %s de %s %s, %s a %s %s.',
  cantidadProyectos, proyectoLabel, cantidadDepartamentos, departamentoLabel, equivalenteLabel, cantidadViviendas, viviendaLabel);
}

function setup_filters(){
  $("#departamento").select2();
  setup_combo_values('Distrito', '#distrito');
  /*setup_combo_values('Localidad', '#localidad');*/
  $("#distrito").select2();
  /*$("#localidad").select2();*/
  setup_checkbox_values('Programa', '#programa');
  setup_checkbox_values('Estado de Obra', '#estado');
  
  /*Convertimos el grupo de checboxes en algo similar a un grupo de radio buttons*/    
  $('#estado label.btn').click(function(){
      var self = $(this);
      $(this).children('input:checkbox').each(function(){
          if(!this.checked){
              self.siblings('label.btn').each(function(){
                  $(this).children('input:checkbox').each(function(){
                      $(this).attr('checked', false);
                      $(this).parent().removeClass('active');
                  });
              });
          }
      });
  });
}

function setup_combo_values(name, selector){
  var values = get_unique_values(name);

  _.each(values, function(d){
    var option = sprintf('<option value="%s">%s</option>', d, d);
    $(selector).append(option);
  });
}

function setup_checkbox_values(name, selector){
  var values = get_unique_values(name);

  _.each(values, function(d){
    var icon = SMV.ESTADO_TO_ICON_CSS[d] || '';
    var label = sprintf('<label class="btn btn-sm btn-primary %s"><input type="checkbox">%s</label>', icon, d);
    $(selector).append(label);
  });
}

function get_unique_values(prop){
  return _.chain(viviendas.features)
    .map(function(f){ return f.properties[prop]; })
    .unique()
    .sortBy(function(d){ return d; })
    .value();
}

function draw_table_details (d) {
  var table = '<table id="row-details" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
  for(var i = SMV.DATA_COLUMNS; i < SMV.TABLE_COLUMNS.length; i++){
    var value = d[SMV.TABLE_COLUMNS[i]] || '-';
    row = sprintf('<tr><td>%s:</td><td>%s</td></tr>', SMV.ATTR_TO_LABEL[SMV.TABLE_COLUMNS[i]], value);
    table += row;
  }
  table += '</table>';
  return table;
}

function draw_table () {

  /*var dataset = viviendas.features.map(function(f){
                  return SMV.TABLE_COLUMNS.map(function(c){
                    return f.properties[c];
                  });
                });*/
  var dataset = viviendas.features.map(function(f){
    var result = f.properties;
    result.coordinates = f.geometry.coordinates;
    return result;
  });

  for(var i=0; i<SMV.TABLE_COLUMNS.length + SMV.BUTTON_COLUMNS; i++){
    $('#lista tfoot tr').append('<th></th>');
  }

  var columns = SMV.TABLE_COLUMNS.map(function(c, i){
    return { 
        "title": SMV.ATTR_TO_LABEL[c],
        "data": c,
        "visible": (i < SMV.DATA_COLUMNS),
        "defaultContent": ""
      };
  });

  columns.unshift({
                "class":          'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
            {
                "class":          'map-control',
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
    "columns": columns,
    "order": [[ 2, "asc" ]],
  });

  // Add event listener for opening and closing details
  $('#lista tbody').on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr');
      var row = table.row(tr);
      var content = draw_table_details(row.data());
      draw_table_row_child(table, tr, content, 'row-details');
  } );

  $('#lista tbody').on('click', 'td.map-control', function () {
    var tr = $(this).closest('tr');
    draw_table_map(table, tr);
    //go_to_feature(row.data().coordinates);
  });

  // Setup - add a text input to each footer cell
  $('#lista tfoot th:not(:first, :nth-of-type(2))').each( function () {
      var title = $('#lista thead th').eq( $(this).index() ).text();
      $(this).html( '<input class="column-filter form-control input-sm" type="text" placeholder="Buscar '+title+'" />' );
  } );

  // Apply the search
  table.columns().eq(0).each( function (colIdx) {
      $( 'input', table.column(colIdx).footer()).on( 'keyup change', function(){
          table
            .column(colIdx)
            .search(this.value)
            .draw();
      } );
  } );

  $('tfoot').insertAfter('thead');
  $('#download-footer').insertAfter('.row:last');
  SMV.table = table;
}

function draw_table_map(table, tr){
  var row = table.row(tr);
  var target = row.data().coordinates;
  var id = 'row-map-' + row.index().toString();
  var content = sprintf("<div id='%s' class='row-map'></div>", id);
  draw_table_row_child(table, tr, content, id);
  var rowMap = L.map(id, {maxZoom: 18, minZoom: 3, worldCopyJump: true, attributionControl: false});

  var layers = SMV.LAYERS();
  var baseMaps = {
    "Calles OpenStreetMap": layers.OPEN_STREET_MAPS,
    "Terreno": layers.MAPBOX,
    "Satélite": layers.GOOGLE_HYBRID,
    "Calles Google Maps": layers.GOOGLE_ROADMAP
  };

  rowMap.addLayer(layers.GOOGLE_HYBRID);
  rowMap.setView(L.latLng(target[1], target[0]), 18);

  var target = row.data().coordinates;
  var markerLayer = get_filtered_layer(target);
  rowMap.addLayer(markerLayer);
  L.control.layers(baseMaps).addTo(rowMap);
}

function get_filtered_layer(target){
  var geoJson = L.mapbox.featureLayer();
  var filteredJSON = $.extend({}, viviendas);
  filteredJSON.features = _(viviendas.features).filter(function(f){
    var point = f.geometry.coordinates;
    return (point[0] === target[0] && point[1] === target[1]);
  });
  geoJson.setGeoJSON(filteredJSON);
  return geoJson;
}

function draw_table_row_child(table, tr, content, childID){
  var row = table.row(tr);
  
  if(row.child.isShown()){
    var detailsID = row.child()[0].firstChild.firstChild.id;
    if(detailsID === childID){
      row.child.hide();
    }else{
      // Open this row
      row.child(content).show();
    }   
  }else{
    // Open this row
    row.child(content).show();
  }
}

function go_to_feature(target){
  SMV.markerLayer.eachLayer(function(marker) {
        var t = L.latLng(target[1], target[0]);
        if(t.equals(marker.getLatLng())){
          $('#mapa').on('transitionend', function(){
            SMV.map.setView(t, 18);
            marker.fireEvent('click', {layer: marker});
            $(this).off('transitionend');
          });

          $(".navbar-nav>li>a[href=#mapa]").click();
          
        }
    });

}

function setup_download_buttons(){
  $('#filtered-csv').click(function(){
    var dataObject = SMV.table.rows({ filter: 'applied' }).data().toArray();
    var dataArray = _(dataObject).map(function(o){
      var result = _(SMV.TABLE_COLUMNS).map(function(c){
        return o[c] || '';
      });
      result = [o.coordinates[1], o.coordinates[0]].concat(result);
      return result;
    });
    var csv = Papa.unparse({
      fields: ["Latitud", "Longitud"].concat(SMV.TABLE_COLUMNS),
      data: dataArray
    });
    download(csv, "viviendas.csv", "text/csv");
    $(this).toggleClass("active");
  });

  $('#filtered-json').click(function(){
    var dataObject = SMV.table.rows({ filter: 'applied' }).data().toArray();
    var filteredJSON = $.extend({}, viviendas);
    var targetList = _(dataObject).pluck('coordinates');
    filteredJSON.features = _(viviendas.features).filter(function(f){
      return !!_(targetList).find(function(t){
        return _(t).isEqual(f.geometry.coordinates);
      });
    });
    download(JSON.stringify(filteredJSON, null, 4), "viviendas.json", "application/json");
    $(this).toggleClass("active");
  });

}

function draw_sidetag(map, hide){
  $('#opener').on('click', function() {   
    var panel = $('#slide-panel');
    if (panel.hasClass("visible")) {
       panel.removeClass('visible').animate({'margin-left':'-300px'});
       $('#slide-tag').animate({'margin-left':'-300px'});
    } else {
      panel.addClass('visible').animate({'margin-left':'0px'});
      $('#slide-tag').animate({'margin-left':'0px'});
    }
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-down");
    $('#opener-icon').toggleClass("glyphicon glyphicon-chevron-up");
    return false; 
  });

  $('.navbar-nav>li>a').bind('click', function (e) {
    if($(this).attr('href') === '#mapa'){
      $('#opener').show();
      $('body').css('overflow', 'hidden');
      $('#opener').click();
    }
    if($(this).attr('href') === '#listado' || $(this).attr('href') === '#acerca-de'){
      $('body').css('overflow', 'auto');
      if ($('#slide-panel').hasClass("visible")) {
        $('#opener').click();
      }
      $('#opener').hide();
    }
  });

  if(hide){
    $('#opener').hide();
  }
}

function draw_popup(target){
  if(!!!target.layer.getPopup()){
    var content = draw_popup_tabs(SMV.POPUP_ROWS);

    content += draw_popup_tables(target.layer.feature.properties, SMV.POPUP_ROWS);
    //content += draw_popup_album(["img/casa1.jpg", "img/plano1.png", "img/casa2.jpg", "img/plano2.png"]);
    var popup = new L.Popup({
      minWidth: 400,
      className: "marker-popup"
    }).setContent(content);
      target.layer.bindPopup(popup);
  }
  target.layer.openPopup();
  setup_modal();
  SMV.infoBox.update(target.layer.feature);
  $('.flexslider').flexslider({
    animation: "slide"
  });

}

function draw_popup_tables(properties, attrs_by_tab){
  var d = '<div class="tab-content">';
  var c = 0;
  for (key in attrs_by_tab) {
    if (attrs_by_tab.hasOwnProperty(key)) {
      var id = removeAccents(key.toLowerCase().split(" ").join("-"));
      if(c == 0){
        d += sprintf('<div class="tab-pane active" id="%s">', id);
        //d += draw_popup_album(["img/casa1.jpg", "img/plano1.png", "img/casa2.jpg", "img/plano2.png"]);
        d += draw_popup_album(["img/casa1.jpg", "img/casa2.jpg"]);
      }else{
        d += sprintf('<div class="tab-pane" id="%s">', id);
      }
      
      d += draw_popup_table(properties, attrs_by_tab[key]) + "</div>";
      c++;
    }
  }
  d += "</div>";
  return d;
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

function draw_popup_tabs(tabs){
  var r = '<ul class="nav nav-tabs" role="tablist">'
  var c = 0
  for (k in tabs) {
    if(tabs.hasOwnProperty(k)){
      var href = removeAccents(k.toLowerCase().split(" ").join("-"));
      if(c == 0){
        r += sprintf('<li class="active"><a href="#%s" role="tab" data-toggle="tab">%s</a></li>', href, k);
      }else{
        r += sprintf('<li><a href="#%s" role="tab" data-toggle="tab">%s</a></li>', href, k);
      }
      c++;
    }
  }
  r += '</ul>'
  return r;
}

function draw_popup_table_row(key, value){
  return sprintf("<tr><td class=\'attr-title\'>%s</td><td>%s</td></tr>", SMV.ATTR_TO_LABEL[key], value);
}

function draw_popup_album(imgs){
  var a = "<div id=\'album-container\' class=\'flexslider\'><ul class=\'slides row\'>";
  for (var i = 0; i < imgs.length; i++) {
    a += draw_popup_album_photo(imgs[i]);
  }
  a += "</ul></div>"
  return a;
}

function draw_popup_album_photo(img){
  return sprintf("<li><img class=\'img-responsive\' src=\'%s\'/></li>", img);
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

    var index = $(this).parent('li').index();

    var html = '';
    html += img;                
    html += '<div style="height:25px;clear:both;display:block;">';
    html += '<a class="controls next" href="' + (index + 2) + '">siguiente &raquo;</a>';
    html += '<a class="controls previous" href="' + (index) + '">&laquo; anterior</a>';
    html += '</div>';

    $('#photo-modal').modal();
    $('#photo-modal').on('shown.bs.modal', function(){
      $('#photo-modal .modal-body').html(html);
      //this will hide or show the right links:
      $('a.controls').trigger('click');
    });
    $('#photo-modal').on('hidden.bs.modal', function(){
      $('#photo-modal .modal-body').html('');
    });
  });  
}

function setup_modal_navigation() {
  $(document).on('click', 'a.controls', function(e){
    var index = $(this).attr('href');
    var src = $('ul.row li:nth-child('+ (index) +') img').attr('src');
    $('.modal-body img').attr('src', src);

    var newPrevIndex = parseInt(index) - 1; 
    var newNextIndex = parseInt(newPrevIndex) + 2; 
 
    if($(this).hasClass('previous')){               
        $(this).attr('href', newPrevIndex); 
        $('a.next').attr('href', newNextIndex);
    }else{
        $(this).attr('href', newNextIndex); 
        $('a.previous').attr('href', newPrevIndex);
    }

    var total = ($('ul.row li').length);

    //hide next button
    if(total === newNextIndex){
        $('a.next').hide();
    }else{
        $('a.next').show()
    }            
    //hide previous button
    if(newPrevIndex === 1){
        $('a.previous').hide();
    }else{
        $('a.previous').show()
    }

    return false;
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
  if(SMV.map){
    SMV.map.invalidateSize();
  }
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
  $("#programa label input[value='Todos']").change(function(){
    var checked = $(this).prop('checked');
    $("#programa label input").prop('checked', this.checked);
  });

  $('#este-gobierno label input, #estado label input, #programa label input, #nivel label input, #departamento, #distrito, #localidad')
    .change(function(){
      update_filters(map);
    });

}

// This function is called whenever someone clicks on a checkbox and changes
// the selection of markers to be displayed.
function update_filters() {
  var programas = get_selected_checkbox('#programa label');
  var estados = get_selected_checkbox('#estado label');
  var departamentos = get_selected_combo('#departamento');
  var distritos = get_selected_combo('#distrito');
  var localidades = get_selected_combo('#localidad');

  show_nivel_fonavis(programas);
  var niveles = get_selected_checkbox('#nivel label');

  SMV.geoJsonLayer.setFilter(function(feature) {
    // If this symbol is in the list, return true. if not, return false.
    // The 'in' operator in javascript does exactly that: given a string
    // or number, it says if that is in a object.
    // 2 in { 2: true } // true
    // 2 in { } // false
    var esteGobiernoFilter = !!!$("#este-gobierno input:checked").length || este_gobierno(feature.properties['Fecha de inicio de obra']);
    var programaFilter = !!!$("#programa input:checked").length || programas[feature.properties['Programa']];
    var estadoFilter = !!!$("#estado input:checked").length || estados[feature.properties['Estado de Obra']];
    var departamentoFilter = $.isEmptyObject(departamentos) || feature.properties['Departamento'].toLowerCase() in departamentos;
    var distritoFilter = $.isEmptyObject(distritos) || feature.properties['Distrito'].toLowerCase() in distritos;
    var localidadFilter = $.isEmptyObject(localidades) || (feature.properties['Localidad'] && feature.properties['Localidad'].toLowerCase() in localidades);
    var nivelFilter = !!!$("#nivel input:checked").length || (feature.properties['Nivel'] && niveles[feature.properties['Nivel']]);

    var showMarker = departamentoFilter && distritoFilter && localidadFilter && programaFilter
      && estadoFilter && esteGobiernoFilter && nivelFilter;

    return showMarker;
  });

  SMV.markerLayer.clearLayers();
  SMV.markerLayer.addLayer(SMV.geoJsonLayer);
  if(SMV.geoJsonLayer.getLayers().length > 0){
    SMV.map.fitBounds(SMV.geoJsonLayer.getBounds());
  }else{
    SMV.map.setView([-23.388, -60.189], 7);
  }
  SMV.infoBox.update();
}

function show_nivel_fonavis(programas){
  var p = [];
  _(programas).each(function(value, key){
    if(value){
      p.push(key);
    }
  });

  if(p.length === 1 && p[0] === 'FONAVIS'){
    $('.nivel-fonavis').css('display', 'block');
  }else{
    var labels = $('#nivel label');
    $('.nivel-fonavis').css('display', 'none');
    labels.removeClass('active');
    _.each(labels, function(l){
      l.children[0].checked = false;
    });
  }
}

function este_gobierno(fecha){
  var inicioGobierno = moment('15/08/13', 'DD/MM/YY');
  return fecha && moment(fecha, 'DD/MM/YY') >= inicioGobierno;
}

function get_selected_checkbox(selector){
  var labels = $(selector);
  var enabled = {};

  _.each(labels, function(l){ enabled[l.innerText] = l.children[0].checked; });

  return enabled;
}

function get_selected_combo(selector){
  var value = $(selector).select2('val');
  var enabled = {};

  // Run through each checkbox and record whether it is checked. If it is,
  // add it to the object of types to display, otherwise do not.
  _.each(value, function(v){
    enabled[v.toLowerCase()] = true;
  });

  return enabled;
}

function setup_intro(){
  var stepsMapa = [
    { 
      intro: "Bienvenido a esta visualización interactiva =)"
    },
    {
      element: '#tab-mapa',
      intro: "En esta sección, puedes ver las viviendas de acuerdo a su ubicación geográfica.",
      position: "right"
    },
    {
      element: '#slide-panel',
      intro: "Filtra las viviendas en el mapa utilizando estas herramientas.",
      position: 'right'
    },
    {
      element: '.info-box',
      intro: "Aquí puedes ver un resumen de las viviendas visibles en el mapa.",
      position: "left"
    },
    {
      element: '.leaflet-control-layers',
      intro: "Cambia el mapa base con este componente. ¿Te gustaría ver una imagen satelital? Es posible!",
      position: "left"
    },
    {
      element: '#tab-descargas',
      intro: "Haciendo click aquí puedes descargar los datos en formato Excel, CSV y JSON.",
      position: "right"
    },
    {
      element: '#tab-listado',
      intro: "En la sección de listado, puedes ver datos de las viviendas de forma tabular. Visítala!",
      position: "right"
    }
  ];

  var stepsListado = [
    { 
      intro: "Bienvenido a esta visualización interactiva =)"
    },
    {
      element: '#tab-listado',
      intro: "En esta sección, puedes ver datos de las viviendas de forma tabular.",
      position: "right"
    },
    {
      element: document.querySelector('#lista_length label'),
      intro: "Selecciona la cantidad de filas por página de la tabla.",
      position: 'right'
    },
    {
      element: document.querySelector('#lista_filter label'),
      intro: "Filtra los resultados de acuerdo a los valores de cualquier campo.",
      position: "left"
    },
    {
      element: document.querySelectorAll('.column-filter')[0],
      intro: "O filtra de acuerdo a los valores de una columna en particular.",
    },
    {
      element: '#lista_info',
      intro: "Aquí puedes ver un resumen de los resultados de tu búsqueda.",
      position: "right"
    },
    {
      element: '#lista_paginate',
      intro: "Si los resultados son muchos, desplázate entre las páginas de la tabla.",
      position: "left"
    },
    {
      element: '#download-button-bar',
      intro: "Descarga los resultados filtrados en JSON o CSV.",
      position: "top"
    },
    {
      element: '#tab-descargas',
      intro: "O descarga todos los datos en formato Excel, CSV y JSON.",
      position: "right"
    },
    {
      element: '#tab-mapa',
      intro: "Por último, ¿ya visitaste la sección del mapa interactivo?",
      position: "right"
    },
  ];

  $('#start-tour').click(function(){
    var steps;
    switch($('.menu-wrapper ul li.active').attr('id')) {
      case "tab-mapa":
          steps = stepsMapa;
          break;
      case "tab-listado":
          steps = stepsListado;
          break;
      default:
          steps = false;
    }

    introJs().setOptions({
      doneLabel: 'Salir',
      nextLabel: 'Siguiente &rarr;',
      prevLabel: '&larr; Anterior',
      skipLabel: 'Salir',
      steps: steps
    }).start();
  });
}

/*Utilitario para eliminar acentos de la cadena, para poder comparar las claves
(nombre del departamento) del servicio (BD) con las del GEOJSON*/
function removeAccents(strAccents) {
    var strAccents = strAccents.split('');
    var strAccentsOut = new Array();
    var strAccentsLen = strAccents.length;
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñÿý';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (var y = 0; y < strAccentsLen; y++) {
        if (accents.indexOf(strAccents[y]) != -1) {
            strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
        } else
            strAccentsOut[y] = strAccents[y];
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
}

