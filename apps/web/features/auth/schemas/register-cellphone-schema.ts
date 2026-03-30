import { z } from 'zod';
import { isValidCellphone } from '../utils/cellphone';

export const registerCellphoneSchema = z.object({
  cellphone: z
    .string({ required_error: 'Informe seu celular' })
    .trim()
    .min(1, 'Informe seu celular')
    .refine(
      (value) => isValidCellphone(value),
      'Informe um celular válido no formato (11) 99999-9999',
    ),
});

export type RegisterCellphoneFormValues = z.infer<
  typeof registerCellphoneSchema
>;
