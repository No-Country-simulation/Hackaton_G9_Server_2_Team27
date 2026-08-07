export default function Footer() {
  return (
    <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid #334155', textAlign: 'center', color: '#64748b' }}>
      <p>&copy; {new Date().getFullYear()} Mi Proyecto. Todos los derechos reservados.</p>
    </footer>
  );
}