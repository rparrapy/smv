var SMV = SMV || {};

SMV.ATTR_TO_LABEL = {
            Proyecto: 'Proyecto',
            Localidad: 'Localidad',
            Distrito: 'Distrito',
            Departamento: 'Departamento',
            Empresa: 'Empresa Constructora',
            'Cantidad de Viviendas': 'Cantidad de Viviendas',
            Programa: 'Programa',
            'LPN Nº': 'LPN Nº',
            'Estado de Obra': 'Estado de Obra',
            'Fecha de Inicio': 'Fecha de Inicio',
            'Fecha de recepcion definitiva': 'Fecha de recepcion definitiva'
        };


SMV.ESTADO_TO_ICON = {
  'Paralizado': 'img/paralizado.png',
  'En Ejecución': 'img/ejecucion.png',
  'Culminado': 'img/culminado.png'
};

SMV.ESTADO_TO_ICON_CSS = {
  'Paralizado': 'icon-paralizado',
  'En Ejecución': 'icon-ejecucion',
  'Culminado': 'icon-culminado'
};

SMV.TABLE_COLUMNS = ["Departamento", "Distrito", "Proyecto", "Programa", "Estado de Obra", "LPN Nº", "Empresa", "Localidad",
              "Cantidad de Viviendas", "Fecha de Inicio", "Fecha de recepcion definitiva"];

SMV.POPUP_ROWS = {
            "General": ["Departamento", "Distrito", "Proyecto", "Programa", "Estado de Obra", "Cantidad de Viviendas"],
            "Detalles": ["LPN Nº", "Empresa", "Localidad", "Fecha de Inicio", "Fecha de recepcion definitiva"]
};

SMV.DATA_COLUMNS = 5;

SMV.BUTTON_COLUMNS = 2;

SMV.LAYERS = function(){
    var mapbox = L.tileLayer(
        'http://api.tiles.mapbox.com/v4/rparra.jmk7g7ep/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnBhcnJhIiwiYSI6IkEzVklSMm8ifQ.a9trB68u6h4kWVDDfVsJSg');
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {minZoom: 3});
    var gglHybrid = new L.Google("HYBRID");
    var gglRoadmap = new L.Google("ROADMAP");
    return {
        MAPBOX: mapbox,
        OPEN_STREET_MAPS: osm,
        GOOGLE_HYBRID: gglHybrid,
        GOOGLE_ROADMAP: gglRoadmap
    } 
}