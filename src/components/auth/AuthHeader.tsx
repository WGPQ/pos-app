import Image from "next/image";

export default function AuthHeader({ title, description }: { title: string; description: string }) {
  return <header className="space-y-6">
    <div className="flex items-center gap-3 border-b border-purple-100 pb-5">
      <Image src="/pos.png" alt="" width={64} height={64} priority className="size-14 shrink-0 rounded-2xl object-contain sm:size-16" />
      <div>
        <p className="text-xl font-bold tracking-tight text-gray-900">Simplio <span className="text-purple-700">POS</span></p>
        <p className="mt-1 text-xs font-medium text-gray-500">Tu negocio, más simple.</p>
      </div>
    </div>
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  </header>;
}
