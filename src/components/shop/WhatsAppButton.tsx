type Props = { business: { name: string; phone?: string | null } };

export default function WhatsAppButton({ business }: Props) {
  const phone = business.phone?.trim();
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!phone?.startsWith("+") || digits.length < 7 || digits.length > 15) return null;
  const message = `Hola, quisiera información sobre los productos de ${business.name}.`;
  return <a
    href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Contactar a ${business.name} por WhatsApp (abre en una nueva pestaña)`}
    title="Escríbenos por WhatsApp"
    className="fixed right-5 z-50 inline-flex size-12 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-600 text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
  ><WhatsAppIcon /></a>;
}

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current"><path d="M12.04 2C6.5 2 2 6.46 2 12c0 1.76.46 3.48 1.33 5L2 22l5.15-1.31A9.94 9.94 0 0 0 12.04 22C17.56 22 22 17.54 22 12S17.56 2 12.04 2Zm0 18.16a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.06.78.82-2.98-.2-.31A8.1 8.1 0 1 1 12.04 20.16Zm4.45-6.08c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19a7.25 7.25 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.1.15 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" /></svg>;
}
