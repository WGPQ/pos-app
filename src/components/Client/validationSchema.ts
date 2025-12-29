import * as yup from "yup";

export const clientSchema = yup.object().shape({
  ci: yup.string().required("El CI es obligatorio"),
  name: yup.string().required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Email inválido")
    .transform((value) => (value === "" ? undefined : value))
    .notRequired(),
  phone: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .notRequired(),
  address: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .notRequired(),
});
