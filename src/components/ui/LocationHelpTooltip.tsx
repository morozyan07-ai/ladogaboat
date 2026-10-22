'use client'

export default function LocationHelpTooltip() {
  return (
    <span className="relative inline-flex group ml-1.5 align-middle">
      <span
        tabIndex={0}
        className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center cursor-help select-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        ?
      </span>
      <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-full ml-2 w-64 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-30">
        Если вы не можете найти своё место отправления или начало аренды лодки/катера — напишите нам, указав место любым способом (название причала или адрес причала), через форму обратной связи или техподдержки, и мы добавим точку отправления.
      </span>
    </span>
  )
}
