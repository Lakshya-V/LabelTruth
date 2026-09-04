export const theme = {
  colors: {
    background: '#FAFAF8',
    card: '#FFFFFF',
    textPrimary: '#2C2D2B',
    textSecondary: '#6B6D68',
    textLight: '#9E9F9D',
    primary: '#1B4D3E',
    border: '#E2E3E0',
    semantic: {
      amber: '#F59E0B',
      red: '#EF4444',
      green: '#10B981',
      darkGreen: '#1B4D3E'
    }
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    s: 8,
    m: 16,
    card: 24,
    pill: 9999,
  },
  shadows: {
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    }
  },
  typography: {
    h1: {
      fontSize: 34,
      fontWeight: '700' as const,
      color: '#2C2D2B',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: '#2C2D2B',
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      color: '#2C2D2B',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: '#2C2D2B',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#6B6D68',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: '#6B6D68',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
  }
};
