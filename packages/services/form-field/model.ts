import {z} from 'zod'


export const formFieldEnum = z.enum(['TEXT', 'YES_NO', 'NUMBER', 'EMAIL', 'PASSWORD'])

export const createFieldInput = z.object({
    label: z.string().max(100).describe("Label of the form"),
    type: formFieldEnum.describe("Enums of the fields"),
    formId: z.string().uuid().describe('Form id or the forms'),
    description: z.string().optional().describe('Helper text for the fields'),
    placeholder: z.string().optional().describe('Placeholder for the Form Field'),
    isRequired: z.boolean().default(false).describe('Weather the field is mandatory is not')
})
export type CreateFieldInputType = z.infer<typeof createFieldInput>

export const updateFieldInput = z.object({
    fieldId: z.string().uuid().describe('Field id or the forms'),
    label: z.string().max(100).describe("Update Label of the form"),
    type: formFieldEnum.describe("Update Enums of the fields"),
    description: z.string().optional().describe('Update text for the fields'),
    placeholder: z.string().optional().describe('Update Placeholder for the Form Field'),
    isRequired: z.boolean().default(false).describe('update required text')
})
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>


export const getFieldsInput = z.object({
    formId: z.string().uuid().describe('UUId of field to get'),
})
export type GetFieldsInputType = z.infer<typeof getFieldsInput>

export const deleteFieldInput = z.object({
    fieldId: z.string().uuid().describe('UUId of field to delete'),
})
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>