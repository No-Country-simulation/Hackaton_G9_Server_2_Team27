// Central de tokens y estilos reutilizables para EnergiAI
export const theme = {
  colors: {
    primary: '#16a34a',
    primaryBg: '#f0fdf4',
    primaryBorder: '#dcfce7',
    textMain: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    border: '#e2e8f0',
    borderInput: '#cbd5e1',
    bg: '#f8fafc',
    white: '#ffffff',
  }
};

// Función para generar badges de categoría dinámica
export const getBadgeStyle = (category) => {
  const cat = category?.toLowerCase();
  let bg = '#fee2e2';
  let color = '#dc2626';

  if (cat === 'eficiente') {
    bg = '#f0fdf4';
    color = '#16a34a';
  } else if (cat === 'moderado') {
    bg = '#fef3c7';
    color = '#d97706';
  }

  return {
    backgroundColor: bg,
    color: color,
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.8rem',
    display: 'inline-block',
    textAlign: 'center'
  };
};

// Estilos base de UI compartidos
export const ui = {
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.colors.textMain,
    marginBottom: '1.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: `1px solid ${theme.colors.borderInput}`,
    backgroundColor: theme.colors.white,
    fontSize: '0.9rem',
    color: theme.colors.textMain,
    outline: 'none',
    boxSizing: 'border-box'
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    padding: '0.75rem 1.75rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
  },
  btnOutline: {
    backgroundColor: theme.colors.white,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderInput}`,
    padding: '0.75rem 1.75rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  infoBanner: {
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '0.5rem',
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#1d4ed8',
    fontSize: '0.875rem'
  }
};