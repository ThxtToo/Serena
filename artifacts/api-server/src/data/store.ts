export interface Policy {
  cedula: string;
  titular: string;
  aseguradora: string;
  plan: string;
  limite_usd: number;
  estatus: string;
  cobertura: string[];
  telefono_aseguradora?: string;
  contacto_aseguradora?: string;
}

export interface InventoryState {
  salas: Record<string, string>;
  vehiculos: Record<string, string>;
  cofres: Record<string, number>;
}

export const policies: Policy[] = [
  {
    cedula: "V-14555666",
    titular: "Pedro Flores",
    aseguradora: "Seguros Caracas",
    plan: "Premium Corporativo",
    limite_usd: 2500,
    estatus: "Solvente",
    cobertura: ["Sala Imperial A", "Carroza Ford de Gala", "Cofre Caoba Premium", "Embalsamamiento"],
    telefono_aseguradora: "(0212) 501-50-00",
    contacto_aseguradora: "Seguros Caracas — Centro de Atención al Asegurado. Lun-Vie 8am-5pm. Guardia 24h: (0212) 501-50-11",
  },
  {
    cedula: "V-18765432",
    titular: "María Pérez",
    aseguradora: "Mercantil Seguros",
    plan: "Estándar Individual",
    limite_usd: 1200,
    estatus: "Solvente",
    cobertura: ["Sala Clásica B", "Unidad EcoVan", "Cofre Metálico Estándar"],
    telefono_aseguradora: "0800-MERCANTIL (0800-637-2268)",
    contacto_aseguradora: "Mercantil Seguros — Línea de Siniestros 24/7. WhatsApp: +58 412-637-2268",
  },
  {
    cedula: "V-22111000",
    titular: "Juan Rodríguez",
    aseguradora: "Mapfre Venezuela",
    plan: "Familiar",
    limite_usd: 0,
    estatus: "Suspendido por Falta de Pago",
    cobertura: [],
    telefono_aseguradora: "(0212) 201-73-00",
    contacto_aseguradora: "Mapfre Venezuela — Área de Cobranzas y Regularización. Correo: clientes@mapfre.com.ve",
  },
  {
    cedula: "V-09876543",
    titular: "Carmen Herrera",
    aseguradora: "La Previsora",
    plan: "Protección Total",
    limite_usd: 3000,
    estatus: "Solvente",
    cobertura: ["Sala VIP Serena", "Carroza Ejecutiva", "Cofre Caoba Premium", "Embalsamamiento", "Servicio de Flores"],
    telefono_aseguradora: "(0212) 564-11-11",
    contacto_aseguradora: "La Previsora — Departamento de Vida y Exequias. Emergencias: 0800-PREVISORA",
  },
  {
    cedula: "V-16300400",
    titular: "Roberto Castillo",
    aseguradora: "La Occidental",
    plan: "Básico Familiar",
    limite_usd: 800,
    estatus: "Solvente",
    cobertura: ["Sala Clásica B", "Unidad Transfer"],
    telefono_aseguradora: "(0261) 200-66-00",
    contacto_aseguradora: "La Occidental de Seguros — Maracaibo. Emergencias Nacionales: 0800-OCCIDEN",
  },
  {
    cedula: "V-11223344",
    titular: "Luisa Martínez",
    aseguradora: "Seguros Caracas",
    plan: "Estándar Plus",
    limite_usd: 1800,
    estatus: "Solvente",
    cobertura: ["Sala Ejecutiva C", "Carroza Familiar", "Cofre Roble Americano"],
    telefono_aseguradora: "(0212) 501-50-00",
    contacto_aseguradora: "Seguros Caracas — Centro de Atención al Asegurado. Lun-Vie 8am-5pm. Guardia 24h: (0212) 501-50-11",
  },
  {
    cedula: "V-07654321",
    titular: "Andrés Blanco",
    aseguradora: "Mercantil Seguros",
    plan: "Premium Familiar",
    limite_usd: 2200,
    estatus: "Solvente",
    cobertura: ["Sala Imperial A", "Carroza Ford de Gala", "Cofre Acero Premium", "Embalsamamiento"],
    telefono_aseguradora: "0800-MERCANTIL (0800-637-2268)",
    contacto_aseguradora: "Mercantil Seguros — Línea de Siniestros 24/7. WhatsApp: +58 412-637-2268",
  },
  {
    cedula: "V-25000100",
    titular: "Gloria Ramírez",
    aseguradora: "Mapfre Venezuela",
    plan: "Básico Individual",
    limite_usd: 600,
    estatus: "Solvente",
    cobertura: ["Sala Clásica B", "Cofre Metálico Estándar"],
    telefono_aseguradora: "(0212) 201-73-00",
    contacto_aseguradora: "Mapfre Venezuela — Área de Cobranzas y Regularización. Correo: clientes@mapfre.com.ve",
  },
];

export const inventory: InventoryState = {
  salas: {
    "Imperial A":       "Disponible",
    "Imperial B":       "Reservada",
    "Clásica B":        "Disponible",
    "Clásica C":        "En Limpieza",
    "Ejecutiva C":      "Disponible",
    "VIP Serena":       "Disponible",
    "Sala Familiar D":  "Reservada",
    "Sala de Capilla":  "Disponible",
  },
  vehiculos: {
    "Ford de Gala":        "Disponible",
    "Carroza Ejecutiva":   "Asignado",
    "Carroza Familiar":    "Disponible",
    "Carroza Clásica":     "Disponible",
    "EcoVan":              "Disponible",
    "Unidad Transfer 1":   "Asignado",
    "Unidad Transfer 2":   "Disponible",
    "Van de Apoyo":        "En Mantenimiento",
  },
  cofres: {
    "Caoba Premium":        3,
    "Roble Americano":      5,
    "Cedro Natural":        4,
    "Acero Premium":        2,
    "Metálico Estándar":    8,
    "Metálico Económico":   6,
    "Bronce Clásico":       1,
    "Madera MDF Tapizado":  7,
    "Nogal Europeo":        2,
    "Infantil Blanco":      3,
  },
};

export function addInventoryItem(
  categoria: "salas" | "vehiculos" | "cofres",
  nombre: string,
  valorInicial: string,
): void {
  if (categoria === "cofres") {
    const num = parseInt(valorInicial, 10);
    inventory.cofres[nombre] = isNaN(num) ? 0 : num;
  } else {
    inventory[categoria][nombre] = valorInicial;
  }
}
