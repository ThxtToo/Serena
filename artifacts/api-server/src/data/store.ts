// In-memory data store for Serena platform simulation
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
    cobertura: ["Sala Imperial", "Carroza de Gala", "Cofre de Madera Fina"],
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
    cobertura: ["Sala Básica B", "Unidad EcoVan", "Cofre Metálico Estándar"],
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
    cobertura: ["Sala VIP C", "Carroza Ejecutiva", "Cofre Caoba Premium", "Servicio de Embalsamamiento"],
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
    cobertura: ["Sala Básica B", "Unidad EcoVan"],
    telefono_aseguradora: "(0261) 200-66-00",
    contacto_aseguradora: "La Occidental de Seguros — Maracaibo. Emergencias Nacionales: 0800-OCCID3N",
  },
];

export const inventory: InventoryState = {
  salas: {
    "Imperial A": "Reservada",
    "Básica B": "Disponible",
    "Sala VIP C": "Disponible",
    "Sala Serena D": "Disponible",
  },
  vehiculos: {
    "Ford de Gala": "Asignado",
    EcoVan: "Disponible",
    "Carroza Ejecutiva": "En Mantenimiento",
    "Carroza Familiar": "Disponible",
  },
  cofres: {
    "Madera Fina": 5,
    "Metálico Estándar": 0,
    "Caoba Premium": 2,
    "Acero Inoxidable": 3,
    "Roble Americano": 1,
  },
};

// Add new inventory item
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
