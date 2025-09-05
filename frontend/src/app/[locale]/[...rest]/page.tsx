import { notFound } from 'next/navigation'

// Cette page catch-all capture toutes les routes non définies
// et déclenche la page not-found.tsx localisée
export default function CatchAllPage() {
  notFound()
}