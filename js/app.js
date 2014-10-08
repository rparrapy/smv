$(document).ready(function(){
    var mapbox = L.tileLayer(
                 'http://api.tiles.mapbox.com/v4/rparra.jmk7g7ep/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg',
                                   {     maxZoom: 18     });
    var osm = L.tileLayer(
                 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                   {     maxZoom: 18     });
    var map = L.map('map',{
      layers: [mapbox, osm]
    }).setView([-23.388, -60.189], 7);
    
    var baseMaps = {
      "Calles": osm,
      "Satelital": mapbox
    };

    L.control.layers(baseMaps).addTo(map);

    $("#departamento").select2();

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

    $('.nav-tabs>li>a').bind('click', function (e) {
      map.invalidateSize();
    });

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



});