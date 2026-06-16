-- =============================================================
-- Twenty CRM — Traducción completa al Español (México)
-- Uso:
--   cat es-mx-seed.sql | docker compose exec -T db psql -U postgres -d default
-- =============================================================

-- 1. OBJETOS
UPDATE core."objectMetadata" SET "labelSingular"='Empresa',              "labelPlural"='Empresas'              WHERE "nameSingular"='company';
UPDATE core."objectMetadata" SET "labelSingular"='Persona',              "labelPlural"='Personas'              WHERE "nameSingular"='person';
UPDATE core."objectMetadata" SET "labelSingular"='Oportunidad',          "labelPlural"='Oportunidades'         WHERE "nameSingular"='opportunity';
UPDATE core."objectMetadata" SET "labelSingular"='Nota',                 "labelPlural"='Notas'                 WHERE "nameSingular"='note';
UPDATE core."objectMetadata" SET "labelSingular"='Tarea',                "labelPlural"='Tareas'                WHERE "nameSingular"='task';
UPDATE core."objectMetadata" SET "labelSingular"='Panel',                "labelPlural"='Paneles'               WHERE "nameSingular"='dashboard';
UPDATE core."objectMetadata" SET "labelSingular"='Grabación',            "labelPlural"='Grabaciones'           WHERE "nameSingular"='callRecording';
UPDATE core."objectMetadata" SET "labelSingular"='Evento de calendario', "labelPlural"='Eventos de calendario' WHERE "nameSingular"='calendarEvent';
UPDATE core."objectMetadata" SET "labelSingular"='Mensaje',              "labelPlural"='Mensajes'              WHERE "nameSingular"='message';
UPDATE core."objectMetadata" SET "labelSingular"='Flujo de trabajo',     "labelPlural"='Flujos de trabajo'     WHERE "nameSingular"='workflow';
UPDATE core."objectMetadata" SET "labelSingular"='Miembro',              "labelPlural"='Miembros'              WHERE "nameSingular"='workspaceMember';
UPDATE core."objectMetadata" SET "labelSingular"='Archivo adjunto',      "labelPlural"='Archivos adjuntos'     WHERE "nameSingular"='attachment';
UPDATE core."objectMetadata" SET "labelSingular"='Actividad',            "labelPlural"='Actividades'           WHERE "nameSingular"='timelineActivity';
UPDATE core."objectMetadata" SET "labelSingular"='Versión de flujo',     "labelPlural"='Versiones de flujo'    WHERE "nameSingular"='workflowVersion';
UPDATE core."objectMetadata" SET "labelSingular"='Ejecución de flujo',   "labelPlural"='Ejecuciones de flujo'  WHERE "nameSingular"='workflowRun';

-- 2. CAMPOS COMUNES
UPDATE core."fieldMetadata" SET "label"='Nombre'               WHERE "name"='name';
UPDATE core."fieldMetadata" SET "label"='Título'               WHERE "name"='title';
UPDATE core."fieldMetadata" SET "label"='Descripción'          WHERE "name"='description';
UPDATE core."fieldMetadata" SET "label"='Cuerpo'               WHERE "name"='bodyV2';
UPDATE core."fieldMetadata" SET "label"='Estado'               WHERE "name"='status';
UPDATE core."fieldMetadata" SET "label"='Posición'             WHERE "name"='position';
UPDATE core."fieldMetadata" SET "label"='Fecha de creación'    WHERE "name"='createdAt';
UPDATE core."fieldMetadata" SET "label"='Última actualización' WHERE "name"='updatedAt';
UPDATE core."fieldMetadata" SET "label"='Eliminado en'         WHERE "name"='deletedAt';
UPDATE core."fieldMetadata" SET "label"='Creado por'           WHERE "name"='createdBy';
UPDATE core."fieldMetadata" SET "label"='Actualizado por'      WHERE "name"='updatedBy';
UPDATE core."fieldMetadata" SET "label"='Archivos adjuntos'    WHERE "name"='attachments';
UPDATE core."fieldMetadata" SET "label"='Actividades'          WHERE "name"='timelineActivities';
UPDATE core."fieldMetadata" SET "label"='Notas'                WHERE "name"='noteTargets';
UPDATE core."fieldMetadata" SET "label"='Tareas'               WHERE "name"='taskTargets';
UPDATE core."fieldMetadata" SET "label"='Empresa'              WHERE "name"='company';
UPDATE core."fieldMetadata" SET "label"='Ubicación'            WHERE "name"='location';

-- 3. EMPRESA
UPDATE core."fieldMetadata" SET "label"='Dominio'              WHERE "name"='domainName';
UPDATE core."fieldMetadata" SET "label"='Dirección'            WHERE "name"='address';
UPDATE core."fieldMetadata" SET "label"='Ingresos anuales'     WHERE "name"='annualRevenue';
UPDATE core."fieldMetadata" SET "label"='LinkedIn'             WHERE "name"='linkedinLink';
UPDATE core."fieldMetadata" SET "label"='Personas'             WHERE "name"='people';
UPDATE core."fieldMetadata" SET "label"='Oportunidades'        WHERE "name"='opportunities';
UPDATE core."fieldMetadata" SET "label"='Responsable'          WHERE "name"='accountOwner';

-- 4. PERSONA
UPDATE core."fieldMetadata" SET "label"='Cargo'                WHERE "name"='jobTitle';
UPDATE core."fieldMetadata" SET "label"='Correos'              WHERE "name"='emails';
UPDATE core."fieldMetadata" SET "label"='Teléfonos'            WHERE "name"='phones';
UPDATE core."fieldMetadata" SET "label"='Avatar'               WHERE "name"='avatarUrl';
UPDATE core."fieldMetadata" SET "label"='Foto'                 WHERE "name"='avatarFile';

-- 5. OPORTUNIDAD
UPDATE core."fieldMetadata" SET "label"='Monto'                WHERE "name"='amount';
UPDATE core."fieldMetadata" SET "label"='Fecha de cierre'      WHERE "name"='closeDate';
UPDATE core."fieldMetadata" SET "label"='Etapa'                WHERE "name"='stage';
UPDATE core."fieldMetadata" SET "label"='Propietario'          WHERE "name"='owner';
UPDATE core."fieldMetadata" SET "label"='Punto de contacto'    WHERE "name"='pointOfContact';

-- 6. TAREA
UPDATE core."fieldMetadata" SET "label"='Asignado a'           WHERE "name"='assignee';
UPDATE core."fieldMetadata" SET "label"='Fecha límite'         WHERE "name"='dueAt';

-- 7. EVENTO DE CALENDARIO
UPDATE core."fieldMetadata" SET "label"='Inicio'               WHERE "name"='startsAt';
UPDATE core."fieldMetadata" SET "label"='Fin'                  WHERE "name"='endsAt';
UPDATE core."fieldMetadata" SET "label"='Todo el día'          WHERE "name"='isFullDay';
UPDATE core."fieldMetadata" SET "label"='Cancelado'            WHERE "name"='isCanceled';
UPDATE core."fieldMetadata" SET "label"='Enlace de reunión'    WHERE "name"='conferenceLink';
UPDATE core."fieldMetadata" SET "label"='Participantes'        WHERE "name"='calendarEventParticipants';

-- 8. GRABACIÓN
UPDATE core."fieldMetadata" SET "label"='Iniciada'             WHERE "name"='startedAt';
UPDATE core."fieldMetadata" SET "label"='Terminada'            WHERE "name"='endedAt';
UPDATE core."fieldMetadata" SET "label"='Resumen'              WHERE "name"='summary';
UPDATE core."fieldMetadata" SET "label"='Transcripción'        WHERE "name"='transcript';
UPDATE core."fieldMetadata" SET "label"='Audio'                WHERE "name"='audio';
UPDATE core."fieldMetadata" SET "label"='Video'                WHERE "name"='video';

-- 9. MIEMBRO
UPDATE core."fieldMetadata" SET "label"='Esquema de color'      WHERE "name"='colorScheme';
UPDATE core."fieldMetadata" SET "label"='Formato de fecha'      WHERE "name"='dateFormat';
UPDATE core."fieldMetadata" SET "label"='Formato de número'     WHERE "name"='numberFormat';
UPDATE core."fieldMetadata" SET "label"='Formato de hora'       WHERE "name"='timeFormat';
UPDATE core."fieldMetadata" SET "label"='Zona horaria'          WHERE "name"='timeZone';
UPDATE core."fieldMetadata" SET "label"='Idioma'                WHERE "name"='locale';
UPDATE core."fieldMetadata" SET "label"='Inicio de semana'      WHERE "name"='calendarStartDay';
UPDATE core."fieldMetadata" SET "label"='Correo del usuario'    WHERE "name"='userEmail';
UPDATE core."fieldMetadata" SET "label"='Oportunidades propias' WHERE "name"='ownedOpportunities';
UPDATE core."fieldMetadata" SET "label"='Tareas asignadas'      WHERE "name"='assignedTasks';
UPDATE core."fieldMetadata" SET "label"='Responsable de empresas' WHERE "name"='accountOwnerForCompanies';

-- 10. FLUJO DE TRABAJO
UPDATE core."fieldMetadata" SET "label"='Versiones'             WHERE "name"='versions';
UPDATE core."fieldMetadata" SET "label"='Ejecuciones'           WHERE "name"='runs';
UPDATE core."fieldMetadata" SET "label"='Estados'               WHERE "name"='statuses';
UPDATE core."fieldMetadata" SET "label"='Disparadores'          WHERE "name"='automatedTriggers';

-- 11. RELACIONES ADICIONALES
UPDATE core."fieldMetadata" SET label = 'Oportunidades (punto de contacto)' WHERE "name" = 'pointOfContactForOpportunities' AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'person');
UPDATE core."fieldMetadata" SET label = 'Participantes de mensajes' WHERE "name" = 'messageParticipants' AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" IN ('person','workspaceMember'));
UPDATE core."fieldMetadata" SET label = 'Evento de calendario' WHERE "name" = 'calendarEvent' AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'callRecording');
UPDATE core."fieldMetadata" SET label = 'Grabaciones' WHERE "name" = 'callRecordings' AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'calendarEvent');
UPDATE core."fieldMetadata" SET label = 'Preferencia de grabación' WHERE "name" = 'recordingPreference' AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'calendarEvent');
UPDATE core."fieldMetadata" SET label = 'Pasos'             WHERE "name" = 'steps'           AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'workflowVersion');
UPDATE core."fieldMetadata" SET label = 'Disparador'        WHERE "name" = 'trigger'         AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'workflowVersion');
UPDATE core."fieldMetadata" SET label = 'En cola desde'     WHERE "name" = 'enqueuedAt'      AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'workflowRun');
UPDATE core."fieldMetadata" SET label = 'Registros'         WHERE "name" = 'stepLogs'        AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'workflowRun');
UPDATE core."fieldMetadata" SET label = 'Versión del flujo' WHERE "name" = 'workflowVersion' AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'workflowRun');
UPDATE core."fieldMetadata" SET label = 'Fecha de creación' WHERE "name" = 'happensAt'       AND "objectMetadataId" IN (SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'timelineActivity');

-- 12. ENCABEZADOS DE SECCIÓN (viewFieldGroup)
UPDATE core."viewFieldGroup" SET name = 'Sistema'    WHERE name = 'System';
UPDATE core."viewFieldGroup" SET name = 'Negocios'   WHERE name = 'Business';
UPDATE core."viewFieldGroup" SET name = 'Contacto'   WHERE name = 'Contact';
UPDATE core."viewFieldGroup" SET name = 'Trato'      WHERE name = 'Deal';
UPDATE core."viewFieldGroup" SET name = 'Relaciones' WHERE name = 'Relations';
UPDATE core."viewFieldGroup" SET name = 'Trabajo'    WHERE name = 'Work';

-- 13. VISTAS
UPDATE core."view" SET "name"='Todas las {objectLabelPlural}' WHERE "name"='All {objectLabelPlural}';
UPDATE core."view" SET "name"='Asignadas a mí'                WHERE "name"='Assigned to Me';
UPDATE core."view" SET "name"='Por etapa'                     WHERE "name"='By Stage';
UPDATE core."view" SET "name"='Por estado'                    WHERE "name"='By Status';
UPDATE core."view" SET "name"='Ejecuciones'                   WHERE "name"='Runs';
UPDATE core."view" SET "name"='Versiones'                     WHERE "name"='Versions';
