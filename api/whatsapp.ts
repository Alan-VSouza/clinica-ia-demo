import { webhook } from '../shared/whatsapp.js'

// Endereço do webhook para colar no painel da Meta: https://clinica-ia-demo-alan.vercel.app/api/whatsapp
export const maxDuration = 30

export function GET(req: Request) {
  return webhook(req)
}

export function POST(req: Request) {
  return webhook(req)
}
