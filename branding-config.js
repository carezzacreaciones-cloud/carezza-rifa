/**
 * Módulo compartido para cargar y aplicar personalización de marca
 * Se utiliza en dashboard.html, admin.html y cliente.html
 */

let brandingData = null;
let brandingUnsubscribe = null;

const DEFAULT_BRANDING = {
  logo_url: '',
  primary_color: '#b5a7cb',    // lavender
  secondary_color: '#f8dcc0',  // peach
  accent_color: '#8a7aa6',     // lavDark
  school_name: 'Carezza Rifa'
};

export async function initBranding(db) {
  return new Promise((resolve) => {
    const brandingRef = window.firebase?.firestore?.doc?.(db, 'school-branding', 'default');
    if (!brandingRef) {
      brandingData = { ...DEFAULT_BRANDING };
      applyBranding(brandingData);
      resolve(brandingData);
      return;
    }

    const unsubscribe = window.firebase?.firestore?.onSnapshot?.(brandingRef, (snap) => {
      if (snap.exists()) {
        brandingData = { ...DEFAULT_BRANDING, ...snap.data() };
      } else {
        brandingData = { ...DEFAULT_BRANDING };
      }
      applyBranding(brandingData);
      resolve(brandingData);
    });

    brandingUnsubscribe = unsubscribe;
  });
}

export function applyBranding(branding) {
  if (!branding) return;

  // Aplicar colores a Tailwind
  const root = document.documentElement;
  root.style.setProperty('--color-primary', branding.primary_color);
  root.style.setProperty('--color-secondary', branding.secondary_color);
  root.style.setProperty('--color-accent', branding.accent_color);

  // Aplicar logo si existe
  if (branding.logo_url) {
    const logos = document.querySelectorAll('[data-logo-placeholder]');
    logos.forEach(logo => {
      logo.src = branding.logo_url;
      logo.style.display = 'block';
    });
  }

  // Inyectar CSS dinámico con los colores personalizados
  let styleEl = document.getElementById('dynamic-branding-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-branding-styles';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root {
      --color-primary: ${branding.primary_color};
      --color-secondary: ${branding.secondary_color};
      --color-accent: ${branding.accent_color};
    }

    .branding-primary {
      background-color: ${branding.primary_color} !important;
      color: white;
    }

    .branding-primary-text {
      color: ${branding.primary_color} !important;
    }

    .branding-secondary {
      background-color: ${branding.secondary_color} !important;
    }

    .branding-secondary-light {
      background-color: ${hexToRgba(branding.secondary_color, 0.1)} !important;
    }

    .branding-accent {
      background-color: ${branding.accent_color} !important;
      color: white;
    }

    .branding-accent-text {
      color: ${branding.accent_color} !important;
    }

    .branding-gradient {
      background: linear-gradient(135deg, ${hexToRgba(branding.secondary_color, 1)} 0%, #ffffff 40%, ${hexToRgba(branding.primary_color, 0.15)} 100%);
    }

    /* Tailwind: Botones personalizados */
    .btn-primary {
      @apply bg-white;
      background-color: ${branding.primary_color};
      color: white;
    }

    .btn-primary:hover {
      filter: brightness(0.9);
    }

    .btn-secondary {
      background-color: ${branding.secondary_color};
    }

    /* Override de colores Tailwind hardcodeados */
    .text-lavender, .text-lavDark, .border-lavLight {
      color: ${branding.primary_color} !important;
      border-color: ${hexToRgba(branding.primary_color, 0.2)} !important;
    }

    .bg-lavender, .bg-lavLight, .bg-lavDark {
      background-color: ${branding.primary_color} !important;
    }

    .bg-peach, .bg-peachLight {
      background-color: ${branding.secondary_color} !important;
    }
  `;
}

export function getBranding() {
  return brandingData || DEFAULT_BRANDING;
}

export function unsubscribeBranding() {
  if (brandingUnsubscribe) {
    brandingUnsubscribe();
  }
}

// Utilidad para convertir hex a rgba
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
