import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get('jwt')
  const { pathname } = request.nextUrl

  // Removido: O redirecionamento de /login para / causava um loop infinito se o JWT fosse inválido.
  // Se o utilizador tiver um JWT inválido, ele vai para /login e DEVE FICAR LÁ para poder fazer login novamente.

  // Se o utilizador NÃO tem token e tenta aceder a qualquer rota protegida
  // (neste caso protegemos tudo exceto o /login, _next, favicon etc)
  if (!jwt && pathname !== '/login') {
    // Verificar se é uma rota de api, _next estático, imagem, etc.
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
      return NextResponse.next()
    }
    
    // Para todas as outras rotas (ex: /, /plantel, /calendario), obriga a login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configuração para definir em que rotas o middleware atua
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
