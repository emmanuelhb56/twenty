import { type FieldMetadataComplexOption, type TagColor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type WebhookCargosResponse } from 'src/engine/metadata-modules/cargo-sync/dtos/webhook-cargos-response.type';

const VALID_TAG_COLORS = new Set<string>([
  'red','ruby','crimson','tomato','orange','amber','yellow','lime','grass',
  'green','jade','mint','turquoise','cyan','sky','blue','iris','violet',
  'purple','plum','pink','bronze','gold','brown','gray',
]);

const CARGO_COLOR_PALETTE: TagColor[] = [
  'blue','green','yellow','orange','red','purple','sky','pink','turquoise','gray',
];

const isValidTagColor = (color: unknown): color is TagColor =>
  typeof color === 'string' && VALID_TAG_COLORS.has(color);

const toOptionValue = (input: string): string => {
  const normalized = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (normalized === '') return 'CARGO';
  return /^[A-Z]/.test(normalized) ? normalized : `CARGO_${normalized}`;
};

export const mapWebhookResponseToCargoOptions = (
  response: WebhookCargosResponse,
): FieldMetadataComplexOption[] => {
  const normalized = Array.isArray(response) ? response[0] : response;
  const cargos = normalized?.cargos;

  if (!Array.isArray(cargos)) {
    throw new Error(
      'La respuesta del webhook no contiene un arreglo "cargos".',
    );
  }

  if (cargos.length === 0) {
    return [];
  }

  return cargos.map((cargo, index) => {
    const label = typeof cargo?.nombre === 'string' ? cargo.nombre.trim() : '';

    if (label === '') {
      throw new Error(`El cargo en posición ${index} no tiene "nombre" válido.`);
    }

    const rawId = isDefined(cargo.jerarquia_asociado_id)
      ? String(cargo.jerarquia_asociado_id).trim()
      : isDefined(cargo.id)
        ? String(cargo.id).trim()
        : '';
    const value = rawId !== ''
      ? `CARGO_${rawId}`
      : toOptionValue(label);

    const color = isValidTagColor(cargo.color)
      ? cargo.color
      : CARGO_COLOR_PALETTE[index % CARGO_COLOR_PALETTE.length];

    return { id: uuidv4(), value, label, position: index, color };
  });
};
