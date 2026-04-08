# Macanudas Fan Card

Base frontend en Next.js + Supabase, con estética inspirada en tu embed de Lindo.

## Qué incluye
- `/login`: acceso por email + OTP
- `/card`: tarjeta del cliente con 5 stamps, código y QR placeholder
- `/admin`: panel cashier para buscar clientes, sumar stamp y canjear premio
- estilos muy parecidos al embed actual

## Antes de usar
1. Crea un archivo `.env.local` a partir de `.env.example`
2. Pega tus variables de Supabase
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Corre la app:
   ```bash
   npm run dev
   ```

## Importante
- El panel admin espera que ya tengas creadas en Supabase las tablas y funciones:
  - `profiles`
  - `loyalty_cards`
  - `qr_tokens`
  - funciones RPC `add_stamp(uuid)` y `redeem_reward(uuid)`
- El login usa OTP por email
- El QR mostrado en la tarjeta es por ahora un placeholder visual con el `qr_token`

## Flujo sugerido
- Landing en Lindo: `/fancard`
- App real en subdominio: `card.macanudasempanadas.com`

## Ajustes rápidos que seguramente quieras hacer
- Reemplazar el wordmark de texto por logo real externo
- Activar búsqueda también por teléfono
- Cambiar el QR placeholder por una librería real si luego quieres renderizarlo
