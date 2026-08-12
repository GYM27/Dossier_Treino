import { Construction } from "lucide-react"

export function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Construction className="size-7" />
        </span>
        <p className="text-sm font-medium">Módulo em construção</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          A secção {title} estará disponível em breve nesta versão do Dossier do Treinador.
        </p>
      </div>
    </div>
  )
}
