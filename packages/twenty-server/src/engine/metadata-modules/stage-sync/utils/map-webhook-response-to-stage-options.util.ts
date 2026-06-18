import {
  FieldMetadataComplexOption,
  type TagColor,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type WebhookStagesResponse } from 'src/engine/metadata-modules/stage-sync/dtos/webhook-stages-response.type';

// Lista completa de colores válidos de Twenty (debe coincidir con TagColor).
// Se usa sólo para validar un color que venga del ERP.
const VALID_TAG_COLORS = new Set<string>([
  'red',
  'ruby',
  'crimson',
  'tomato',
  'orange',
  'amber',
  'yellow',
  'lime',
  'grass',
  'green',
  'jade',
  'mint',
  'turquoise',
  'cyan',
  'sky',
  'blue',
  'iris',
  'violet',
  'purple',
  'plum',
  'pink',
  'bronze',
  'gold',
  'brown',
  'gray',
]);

// Paleta rotativa usada para colorear las etapas por posición cuando el ERP no
// envía color (su tabla de etapas no tiene columna de color).
export const STAGE_COLOR_PALETTE: TagColor[] = [
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'sky',
  'pink',
  'turquoise',
  'gray',
];

const isValidTagColor = (color: unknown): color is TagColor =>
  typeof color === 'string' && VALID_TAG_COLORS.has(color);

// Convierte un texto a un valor de opcion valido para Twenty: UPPER_CASE
// snake_case que cumple /^(?!.*__)[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/.
// Los valores de un SELECT se exponen como enums de GraphQL, por eso NO pueden
// empezar con digito (p. ej. el id "1" del ERP) -> de ahi el prefijo "STAGE_".
const toOptionValue = (input: string): string => {
  const normalized = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (normalized === '') {
    return 'STAGE';
  }

  return /^[A-Z]/.test(normalized) ? normalized : `STAGE_${normalized}`;
};

/**
 * Convierte la respuesta cruda del webhook de etapas (forma del ERP) en las
 * opciones del campo SELECT "stage" de Opportunity en Twenty.
 *
 * Mapeo:
 *   value    <- String(id)   (o slug(nombre) si no hay id)
 *   label    <- nombre
 *   color    <- color del ERP si es válido, si no uno de la paleta por posición
 *   position <- orden del arreglo
 *   id       <- uuid v4 generado
 *
 * Es el ÚNICO punto a modificar cuando se conecte la API real del ERP.
 */
export const mapWebhookResponseToStageOptions = (
  response: WebhookStagesResponse,
): FieldMetadataComplexOption[] => {
  const stages = response?.stages;

  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error(
      'La respuesta del webhook no contiene un arreglo "stages" con etapas.',
    );
  }

  return stages.map((stage, index) => {
    const label =
      typeof stage?.nombre === 'string' ? stage.nombre.trim() : '';

    if (label === '') {
      throw new Error(
        `La etapa en la posición ${index} no tiene un "nombre" válido.`,
      );
    }

    const rawId = isDefined(stage.id) ? String(stage.id).trim() : '';
    const value =
      rawId !== '' ? toOptionValue(`STAGE_${rawId}`) : toOptionValue(label);

    const color = isValidTagColor(stage.color)
      ? stage.color
      : STAGE_COLOR_PALETTE[index % STAGE_COLOR_PALETTE.length];

    return {
      id: uuidv4(),
      value,
      label,
      position: index,
      color,
    };
  });
};
