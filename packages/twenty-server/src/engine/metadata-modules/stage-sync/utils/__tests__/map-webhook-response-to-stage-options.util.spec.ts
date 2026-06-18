import { type WebhookStagesResponse } from 'src/engine/metadata-modules/stage-sync/dtos/webhook-stages-response.type';
import {
  STAGE_COLOR_PALETTE,
  mapWebhookResponseToStageOptions,
} from 'src/engine/metadata-modules/stage-sync/utils/map-webhook-response-to-stage-options.util';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('mapWebhookResponseToStageOptions', () => {
  it('maps the ERP shape (id -> value, nombre -> label) preserving order', () => {
    const response: WebhookStagesResponse = {
      stages: [
        { id: 1, nombre: 'Contactar cliente', es_etapa_cierre: 0 },
        { id: 2, nombre: 'Calificación', es_etapa_cierre: 0 },
        { id: 5, nombre: 'Cerrado ganado', es_etapa_cierre: 1 },
      ],
    };

    const options = mapWebhookResponseToStageOptions(response);

    expect(options).toHaveLength(3);
    expect(options[0]).toMatchObject({
      value: 'STAGE_1',
      label: 'Contactar cliente',
      position: 0,
    });
    expect(options[1]).toMatchObject({
      value: 'STAGE_2',
      label: 'Calificación',
      position: 1,
    });
    expect(options[2]).toMatchObject({
      value: 'STAGE_5',
      label: 'Cerrado ganado',
      position: 2,
    });
  });

  it('generates a uuid id for every option', () => {
    const options = mapWebhookResponseToStageOptions({
      stages: [{ id: 1, nombre: 'Prospecto' }],
    });

    expect(options[0].id).toMatch(UUID_REGEX);
  });

  it('assigns colors from the palette by position when the ERP sends none', () => {
    const options = mapWebhookResponseToStageOptions({
      stages: [
        { id: 1, nombre: 'A' },
        { id: 2, nombre: 'B' },
      ],
    });

    expect(options[0].color).toBe(STAGE_COLOR_PALETTE[0]);
    expect(options[1].color).toBe(STAGE_COLOR_PALETTE[1]);
  });

  it('respects a valid color when the ERP provides one', () => {
    const options = mapWebhookResponseToStageOptions({
      stages: [{ id: 1, nombre: 'A', color: 'purple' }],
    });

    expect(options[0].color).toBe('purple');
  });

  it('falls back to the palette when the provided color is not a valid TagColor', () => {
    const options = mapWebhookResponseToStageOptions({
      stages: [{ id: 1, nombre: 'A', color: 'not-a-color' }],
    });

    expect(options[0].color).toBe(STAGE_COLOR_PALETTE[0]);
  });

  it('derives value from a slug of nombre when id is missing', () => {
    const options = mapWebhookResponseToStageOptions({
      stages: [{ id: '', nombre: 'Cerrado ganado' }],
    });

    expect(options[0].value).toBe('CERRADO_GANADO');
  });

  it('throws a legible error when there are no stages', () => {
    expect(() =>
      mapWebhookResponseToStageOptions({ stages: [] }),
    ).toThrow(/stages/);
  });

  it('throws when the response has no stages array', () => {
    expect(() =>
      mapWebhookResponseToStageOptions(
        {} as unknown as WebhookStagesResponse,
      ),
    ).toThrow(/stages/);
  });

  it('throws when a stage has no nombre', () => {
    expect(() =>
      mapWebhookResponseToStageOptions({
        stages: [{ id: 1, nombre: '   ' }],
      }),
    ).toThrow(/posición 0/);
  });
});
