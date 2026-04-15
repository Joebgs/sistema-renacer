import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'mi-secreto-super-seguro-cambiar-en-produccion'

export function generarToken(usuario: { id: number; email: string; rol: string }) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    SECRET,
    { expiresIn: '24h' }
  )
}

export function verificarToken(token: string) {
  return jwt.verify(token, SECRET) as { id: number; email: string; rol: string }
}