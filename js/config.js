var attr_to_label = {
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


var mapToColor = {
  "Guaira": '#ff8888'
}

var table_columns = ["proyecto", "estado", "contrato", "empresa", "razon_social", "ruc", "monto",
              "codigo_licitacion", "fecha_inicio", "fecha_fin", "departamento", "distrito", "localidad",
              "terreno", "construido", "cantidad_viviendas"];

var popup_rows = ["proyecto", "estado", "contrato", "empresa", "razon_social", "ruc", "monto",
              "codigo_licitacion", "fecha_inicio", "fecha_fin", "departamento", "distrito", "localidad",
              "terreno", "construido", "cantidad_viviendas"];

var max_columns = 4;