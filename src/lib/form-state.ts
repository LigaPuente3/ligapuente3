/** Estado que devuelven las acciones de formulario: errores por campo y valores enviados. */
export type FormState = {
  errors?: Record<string, string>;
  values?: Record<string, string>;
  message?: string;
};

export const initialFormState: FormState = {};
