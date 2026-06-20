export type WebhookCargo = {
  id?: number | string;
  jerarquia_asociado_id?: number | string;
  nombre: string;
  descripcion?: string | null;
  color?: string;
};

export type WebhookCargosResponse =
  | { cargos: WebhookCargo[] }
  | [{ cargos: WebhookCargo[] }];
