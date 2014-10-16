var SMV = SMV || {};

SMV.ATTR_TO_LABEL = {
            proyecto: 'Proyecto',
            estado: 'Estado',
            contrato: 'Contrato',
            empresa: 'Empresa Constructora',
            razon_social: 'Razón Social',
            ruc: 'RUC',
            monto: 'Monto (Gs.)',
            codigo_licitacion: 'Código de Licitación',
            fecha_inicio: 'Fecha de Inicio de Obras',
            fecha_fin: 'Fecha de Fin de Obras',
            departamento: 'Departamento',
            distrito: 'Distrito',
            localidad: 'Localidad',
            terreno: 'Superficie del Terreno (m²)',
            construido: 'Superficie Construida (m²)',
            cantidad_viviendas: 'Cantidad de Viviendas'
        };


SMV.COLOR_MAP = {
  "Guaira": '#ff8888'
}

SMV.TABLE_COLUMNS = ["proyecto", "estado", "contrato", "empresa", "razon_social", "ruc", "monto",
              "codigo_licitacion", "fecha_inicio", "fecha_fin", "departamento", "distrito", "localidad",
              "terreno", "construido", "cantidad_viviendas"];

SMV.POPUP_ROWS = ["proyecto", "estado", "contrato", "empresa", "razon_social", "ruc", "monto",
              "codigo_licitacion", "fecha_inicio", "fecha_fin", "departamento", "distrito", "localidad",
              "terreno", "construido", "cantidad_viviendas"];

SMV.DATA_COLUMNS = 4;

SMV.BUTTON_COLUMNS = 2;