import { Bird } from 'lucide-react'

const bodyColors = [
  { name: 'sabia', hex: '#6B4F35' },
  { name: 'azulao', hex: '#2563EB' },
  { name: 'canario', hex: '#EAB308' },
  { name: 'cardeal', hex: '#DC2626' },
  { name: 'coruja', hex: '#78716C' },
  { name: 'pica-pau', hex: '#059669' },
  { name: 'tucano', hex: '#1E293B' },
  { name: 'flamingo', hex: '#EC4899' },
]

const eyeStyles = [
  { name: 'serio', icon: '--', desc: 'olhos serios' },
  { name: 'cansado', icon: '~_', desc: 'cara de quem trampa' },
  { name: 'focado', icon: 'oo', desc: 'determinado' },
  { name: 'fechado', icon: '--', desc: 'zen' },
  { name: 'doido', icon: 'OO', desc: 'espantado' },
]

const accessories = [
  { name: 'none', label: 'sem nada' },
  { name: 'tie', label: 'gravata' },
  { name: 'glasses', label: 'oculos' },
  { name: 'hat', label: 'bone' },
]

export interface AvatarConfig {
  bodyColor: string
  eyeStyle: string
  accessory: string
}

export function AvatarDisplay({ config, size = 48 }: { config: AvatarConfig; size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${config.bodyColor}88, ${config.bodyColor})`,
        border: '2px solid rgba(255,255,255,0.1)',
      }}
    >
      <Bird
        className="relative"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          color: config.bodyColor,
          filter: 'brightness(1.2)',
        }}
      />
      {config.accessory === 'tie' && (
        <div className="absolute bottom-1 left-1/2 h-2 w-1 -translate-x-1/2 rounded-sm" style={{ background: '#00B2A9' }} />
      )}
      {config.accessory === 'glasses' && (
        <div className="absolute left-1/2 top-[35%] flex -translate-x-1/2 gap-0.5">
          <div className="h-1.5 w-1.5 rounded-full border" style={{ borderColor: '#1A2C40', borderWidth: 1 }} />
          <div className="h-1.5 w-1.5 rounded-full border" style={{ borderColor: '#1A2C40', borderWidth: 1 }} />
        </div>
      )}
    </div>
  )
}

export function AvatarPicker({
  config,
  onChange,
}: {
  config: AvatarConfig
  onChange: (config: AvatarConfig) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <AvatarDisplay config={config} size={72} />
      </div>

      <div>
        <p className="mb-2 text-xs font-mono text-slate-400">cor</p>
        <div className="flex flex-wrap gap-2">
          {bodyColors.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => onChange({ ...config, bodyColor: c.hex })}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c.hex,
                borderColor: config.bodyColor === c.hex ? '#00B2A9' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono text-slate-400">olhar</p>
        <div className="flex flex-wrap gap-2">
          {eyeStyles.map((s) => (
            <button
              key={s.name}
              title={s.desc}
              onClick={() => onChange({ ...config, eyeStyle: s.name })}
              className="rounded-lg px-3 py-1.5 font-mono text-xs transition-colors"
              style={{
                background: config.eyeStyle === s.name ? 'rgba(0,178,169,0.15)' : 'rgba(255,255,255,0.05)',
                color: config.eyeStyle === s.name ? '#00B2A9' : '#94A3B8',
              }}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono text-slate-400">acessorio</p>
        <div className="flex flex-wrap gap-2">
          {accessories.map((a) => (
            <button
              key={a.name}
              onClick={() => onChange({ ...config, accessory: a.name })}
              className="rounded-lg px-3 py-1.5 font-mono text-xs transition-colors"
              style={{
                background: config.accessory === a.name ? 'rgba(0,178,169,0.15)' : 'rgba(255,255,255,0.05)',
                color: config.accessory === a.name ? '#00B2A9' : '#94A3B8',
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {config.accessory === 'tie' && (
        <p className="text-xs font-mono" style={{ color: '#00B2A9' }}>
          gravata ciano auditor. elegante.
        </p>
      )}
    </div>
  )
}
