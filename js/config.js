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


SMV.COLOR_MAP = {
  "Guaira": '#ff8888'
}

SMV.TABLE_COLUMNS = ["Departamento", "Distrito", "Proyecto", "Programa", "Estado de Obra", "LPN Nº", "Empresa", "Localidad",
              "Cantidad de Viviendas", "Fecha de Inicio", "Fecha de recepcion definitiva"];

SMV.POPUP_ROWS = {
            "General": ["Departamento", "Distrito", "Proyecto", "Programa", "Estado de Obra", "Cantidad de Viviendas"],
            "Detalles": ["LPN Nº", "Empresa", "Localidad", "Fecha de Inicio", "Fecha de recepcion definitiva"]
}

SMV.DATA_COLUMNS = 5;

SMV.BUTTON_COLUMNS = 2;