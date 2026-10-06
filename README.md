This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Información del negocio

En `/settings` puedes editar el nombre del negocio y subir o quitar su avatar. La imagen admite JPEG, PNG y WEBP de hasta 5 MB y se almacena en Cloudinary. Guarda los cambios para actualizar la identidad del menú lateral y la cabecera móvil. Sin avatar se muestran las iniciales del negocio.

Consultar requiere `business.settings.view` y editar o subir imágenes requiere `business.settings.update`. Los cambios afectan únicamente al negocio activo y se registran en auditoría. Moneda y zona horaria se muestran como información de consulta. No requiere migraciones nuevas.

```bash
node --test tests/business-profile.test.cjs
```

## Administración de usuarios

El módulo `/users` aparece en el menú para quienes tienen `user.view`. Crear o editar requiere `user.manage`. Permite buscar usuarios del negocio actual, invitar cuentas por correo, editar nombre y correo, asignar roles y sucursales activas, y activar o desactivar el acceso al negocio. No requiere nuevas migraciones.

No se pueden asignar permisos superiores a los del administrador que realiza la operación, cambiar su propio rol, desactivar su propio acceso o quitar su sucursal actual. Guardar cambios revoca las sesiones del usuario en ese negocio, excepto la sesión actual al editarse a sí mismo. Desactivar conserva las ventas y la auditoría.

Los correos de cuentas existentes no se pueden reutilizar para crear otra cuenta. Si una cuenta participa en varios negocios, desde este módulo solo se puede editar su acceso al negocio; el nombre y correo son globales. Al invitar se genera una contraseña aleatoria que no se comparte. El destinatario recibe el nombre del negocio, un enlace de un solo uso válido por 24 horas para definir su contraseña y la URL de login configurada en `APP_URL`. Se reutiliza el sistema de tokens de recuperación, sin nuevas migraciones. La interfaz informa si Resend aceptó el envío y permite reenviar la invitación. El correo se envía después de guardar la cuenta; si falla, la cuenta permanece creada. Los usuarios también pueden definir o cambiar su contraseña mediante la recuperación del login.

Pruebas de validación, permisos y aislamiento (con mocks, sin modificar la base de datos):

```bash
node --test tests/user-management.test.cjs
```

## Recuperación de contraseña

Desde `/login`, selecciona «¿Olvidaste tu contraseña?». El correo contiene un enlace de un solo uso que caduca en 30 minutos. Al restablecer la contraseña se invalidan los otros enlaces y se revocan todas las sesiones del usuario. La contraseña nueva debe tener entre 12 y 128 caracteres.

Configura estas variables en `.env` y en el entorno de despliegue:

```dotenv
APP_URL=http://localhost:3000
RESEND_API_KEY=re_tu_clave
MAIL_FROM=ELY PAPELERÍA <no-reply@tu-dominio.com>
```

En producción, `APP_URL` debe ser la URL pública con HTTPS. `MAIL_FROM` debe ser un remitente autorizado en Resend. Se utiliza la [API de envío de Resend](https://resend.com/docs/api-reference/emails/send-email).

Antes de usar el flujo, aplica la migración y genera el cliente:

```bash
npx prisma migrate deploy
npx prisma generate
```

La respuesta al solicitar un enlace es la misma para correos registrados y no registrados. Los tokens se almacenan como hashes SHA-256 y no se incluyen en la auditoría ni en los logs. Si falta la configuración de correo, la API devuelve un error de disponibilidad. Los errores de entrega se registran sin datos del destinatario; la respuesta pública sigue siendo genérica.

El límite de solicitudes reutiliza el mecanismo en memoria de autenticación: cinco intentos por IP cada 15 minutos, por proceso. Para despliegues con varias instancias, utiliza un límite compartido y configura el proxy para sobrescribir las cabeceras de IP.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Categorías y catálogo público

Aplica la migración de categorías antes de usar estas funciones:

```bash
npx prisma migrate deploy
npx prisma generate
```

La migración conserva las etiquetas existentes como categorías del mismo negocio. Los productos nuevos e importados pueden quedar sin categoría; ya no se asigna «oficina» automáticamente.

En `/categories` puedes crear, renombrar y activar o desactivar categorías. Editar requiere `business.settings.update`; consultar la pantalla requiere `business.settings.view`. Los formularios de producto permiten seleccionar varias categorías y quitar todas las selecciones. Validan que las categorías pertenezcan al negocio. Un producto sin selección queda sin categoría. Desactivar no elimina productos ni su clasificación interna.

En `/settings`, activa «Publicar catálogo» y guarda. La URL pública es `/shop/[slug]` y no requiere sesión. El catálogo empieza deshabilitado para todos los negocios. Solo se publican productos con `in_store = true` y stock mayor a cero. Los productos sin categoría o con categoría inactiva siguen apareciendo en «Todos los productos». Si no hay categorías activas, se oculta completamente la navegación por categorías.

La búsqueda combina palabras del nombre, SKU, descripción y categorías activas, ignora mayúsculas y tildes y prioriza nombres exactos o que empiezan con la búsqueda. No utiliza un servicio de IA ni corrección automática de errores ortográficos. Hay 24 productos por página; las consultas públicas devuelven únicamente la identidad pública del negocio y los datos del catálogo, sin costos ni cantidades de inventario. El catálogo usa el nombre y avatar guardados, y no incluye carrito, cuentas personales, likes ni envíos.

Pruebas de categorías opcionales, permisos, publicación, filtros y aislamiento (con mocks):

```bash
node --test tests/categories-catalog.test.cjs tests/business-profile.test.cjs
```


### Varias categorías por producto

La migración `20261006000000_product_multiple_categories` conserva las asignaciones previas en una tabla de relación. Aplica las migraciones con `npx prisma migrate deploy` y regenera el cliente con `npx prisma generate`.

El formulario usa un selector múltiple: en escritorio, Ctrl o ⌘ permiten seleccionar varias opciones. «Quitar todas las categorías» deja el producto sin clasificación. En el catálogo se filtra por cualquiera de sus categorías activas sin duplicar productos. La API acepta `categoryIds: number[]`; una lista vacía elimina las asignaciones y omitir el campo al editar las conserva. Las categorías inactivas existentes se pueden conservar o retirar, pero no asignar por primera vez.
