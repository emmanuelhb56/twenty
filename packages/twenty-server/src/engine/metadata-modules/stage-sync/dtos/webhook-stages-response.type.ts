// Forma cruda devuelta por el webhook de etapas (hoy el mock de n8n, mañana el
// ERP real). Refleja los campos relevantes de la tabla de etapas del ERP.
//
// IMPORTANTE: este tipo y el mapper `mapWebhookResponseToStageOptions` son los
// ÚNICOS puntos a tocar cuando se conecte la API real del ERP. El resto del
// backend trabaja ya con las opciones de Twenty (FieldMetadataComplexOption).
export type WebhookStage = {
  // Identificador estable de la etapa en el ERP. Se usa como `value` interno.
  id: number | string;
  // Nombre visible de la etapa. Se usa como `label`.
  nombre: string;
  // Informativo, no se usa en el select.
  descripcion?: string | null;
  // Marca la etapa ganada / de cierre. No se usa todavía en el select.
  es_etapa_cierre?: number | boolean;
  // Opcional: si algún día el ERP envía color, el mapper lo respeta.
  color?: string;
};

export type WebhookStagesResponse = {
  stages: WebhookStage[];
};
