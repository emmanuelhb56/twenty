# Required Fields for Twenty CRM

**Date:** 2026-06-23
**Status:** Approved for implementation
**Branch target:** `public-contributions` (community contribution)

---

## Overview

Allow workspace admins to mark any object field as "required" through the Settings UI. When a required field is missing during record creation, the user sees a toast notification and a modal to fill the missing fields before the record is created.

---

## Goals

- Admins configure required fields per object via Settings — no code changes needed
- Clean UX: toast + small modal, consistent with Twenty's existing patterns
- Community-ready: clean implementation that can be contributed upstream
- Does not affect API-level record creation (no DB NOT NULL constraint) — only frontend validation

---

## Non-Goals

- Soft warnings / partial blocking — toggle is binary (required or not)
- Required validation on edit (only enforced on creation)
- API-level enforcement (records created via API bypass validation by design)
- Relation fields and system fields cannot be marked required

---

## Architecture

### 1. Backend

**File:** `packages/twenty-server/src/metadata-modules/field-metadata/field-metadata.entity.ts`
- Add `@Column({ default: false }) isRequired: boolean`

**File:** `packages/twenty-server/src/metadata-modules/field-metadata/dtos/field-metadata.type.ts`
- Add `@Field(() => Boolean) isRequired: boolean` to the GraphQL type

**File:** `packages/twenty-server/src/metadata-modules/field-metadata/dtos/update-field.input.ts`
- Add `@IsOptional() @Field(() => Boolean, { nullable: true }) isRequired?: boolean`

**Migration:** New TypeORM migration adding `is_required BOOLEAN DEFAULT FALSE NOT NULL` to `field_metadata` table.

The existing `updateField` GraphQL mutation handles persistence — no new mutation needed.

### 2. Frontend — Metadata type

**File:** `packages/twenty-front/src/modules/object-metadata/types/FieldMetadataItem.ts`
- Add `isRequired: boolean` to the type

**GraphQL fragment:** Add `isRequired` to the existing `FIELD_METADATA_ITEM_FRAGMENT` so it arrives with every metadata fetch — zero extra queries.

### 3. Settings UI

**Target component:** The field editor panel opened from Settings → Objects → [Object] → Fields → edit field.

- Add a `Toggle` component with label "Required"
- Placed below existing field properties (label, description, etc.)
- On change, calls the existing `updateField` mutation with `{ isRequired: true/false }`
- Toggle hidden for:
  - `isSystem: true` fields
  - `RELATION` and `MORPH_RELATION` type fields

### 4. Creation enforcement

**Hook:** New `useRequiredFieldsValidation({ objectMetadataItem, recordInput })`
- Filters `objectMetadataItem.fields` for `isRequired: true`
- Checks each required field against `recordInput` for a non-empty value
- Returns `{ missingFields: FieldMetadataItem[], isValid: boolean }`

**Intercept point:** `useCreateNewIndexRecord` hook — single place, all callers benefit automatically.

Flow before `createOneRecord()` is called:
1. Run `useRequiredFieldsValidation`
2. If `isValid` → proceed as today
3. If `!isValid` → fire toast + open `RequiredFieldsModal`

**Toast:** Uses existing `useSnackBar` with message `t\`Complete required fields before continuing\``

**`RequiredFieldsModal` component** (new file):
- Small modal rendered with existing Twenty `Modal` component
- Lists only `missingFields`, each rendered with `FormFieldInput` (existing, supports all field types)
- Local state tracks values as user fills them
- "Create" button: calls `createOneRecord` with the filled values, closes modal
- "Cancel" button: closes modal, nothing is created

**Side panel indicator:** When `isNewRecord: true`, required fields show a `*` asterisk next to their label. Uses existing `InputLabel` component with an optional `required` prop.

---

## Data Flow

```
DB: field_metadata.is_required
  → GraphQL API: FieldMetadata.isRequired
    → Frontend fragment: FIELD_METADATA_ITEM_FRAGMENT
      → objectMetadataItems state (already in memory)
        → useRequiredFieldsValidation (on creation)
        → Settings toggle (read/write)
        → InputLabel asterisk (in side panel)
```

---

## File Summary

| File | Change |
|------|--------|
| `twenty-server/.../field-metadata.entity.ts` | Add `isRequired` column |
| `twenty-server/.../field-metadata.type.ts` | Expose via GraphQL |
| `twenty-server/.../update-field.input.ts` | Accept in update mutation |
| `twenty-server/migrations/...` | DB migration |
| `twenty-front/.../FieldMetadataItem.ts` | Add type field |
| `twenty-front/.../FIELD_METADATA_ITEM_FRAGMENT` | Add to query fragment |
| `twenty-front/.../SettingsObjectFieldEdit` (or similar) | Add Required toggle |
| `twenty-front/.../useRequiredFieldsValidation.ts` | New validation hook |
| `twenty-front/.../useCreateNewIndexRecord.ts` | Intercept creation |
| `twenty-front/.../RequiredFieldsModal.tsx` | New modal component |
| `twenty-front/.../InputLabel.tsx` | Add optional `required` prop for asterisk |
