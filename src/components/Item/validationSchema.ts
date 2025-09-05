import * as yup from "yup";

export const productSchema = yup.object().shape({
  name: yup.string().required("El nombre es obligatorio"),
  sku: yup.string().required("El SKU es obligatorio"),
  cost: yup
    .number()
    .typeError("El costo debe ser un número")
    .required("El costo es obligatorio")
    .min(0, "El costo no puede ser negativo"),
  price: yup
    .number()
    .typeError("El precio debe ser un número")
    .required("El precio es obligatorio")
    .min(0, "El precio no puede ser negativo"),
  quantity: yup
    .number()
    .typeError("La cantidad debe ser un número")
    .required("La cantidad es obligatoria")
    .min(0, "La cantidad no puede ser negativa"),
  description: yup.string(),
});
