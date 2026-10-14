export const DEFAULT_BRANDING = { schoolName: '', logoUrl: '', primaryColor: '#087f5b', updatedAt: 0 };

export function uiThemeVariables(color, scheme = 'light') {
  const theme = brandingTheme(color, scheme);
  return {
    '--meal-ui-primary': theme.primary, '--meal-ui-primary-foreground': theme.foreground,
    '--meal-ui-hover': theme.hover, '--meal-ui-background': theme.canvas || '#f5f8f9',
    '--meal-ui-card': theme.panel || '#ffffff', '--meal-ui-muted': theme.raised || theme.surface,
    '--meal-ui-field': theme.field || '#ffffff', '--meal-ui-foreground': theme.text || theme.ink,
    '--meal-ui-muted-foreground': theme.muted || '#526a74', '--meal-ui-border': theme.line || theme.border
  };
}

export function normalizeBranding(value) {
  const schoolName = typeof value?.schoolName === 'string' && value.schoolName.length <= 100 && !/[\x00-\x1f]/.test(value.schoolName) ? value.schoolName.trim() : '';
  const logoUrl = typeof value?.logoUrl === 'string' && value.logoUrl.length <= 512 && /^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d{1,5})?(?:[/?#][^\s\x00-\x1f]*)?$/i.test(value.logoUrl) ? value.logoUrl : '';
  const primaryColor = /^#[0-9a-f]{6}$/i.test(value?.primaryColor || '') ? value.primaryColor.toLowerCase() : DEFAULT_BRANDING.primaryColor;
  return { schoolName, logoUrl, primaryColor, updatedAt: Number.isFinite(Number(value?.updatedAt)) ? Math.max(0, Number(value.updatedAt)) : 0 };
}

export function brandingTheme(color,scheme='light') {
  const primary = normalizeBranding({ primaryColor: color }).primaryColor;
  const rgb = [1, 3, 5].map(index => parseInt(primary.slice(index, index + 2), 16));
  const channels = rgb.map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  const blend = (other, weight) => '#' + rgb.map(value => Math.round(value * (1 - weight) + other * weight).toString(16).padStart(2, '0')).join('');
  const theme = { primary, foreground: (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#ffffff', surface: scheme==='dark'?blend(0,.7):blend(255, .93), border: scheme==='dark'?blend(255,.6):luminance > .4 ? blend(0, .55) : blend(255, .3), ink: scheme==='dark'?blend(255,.85):blend(0, .7), hover: blend(0, .15) };
  if (scheme === 'dark') Object.assign(theme, {
    canvas: blend(8, .88), panel: blend(22, .85), field: blend(30, .78), raised: blend(45, .72),
    text: blend(255, .92), muted: blend(215, .83), line: blend(170, .78), highlight: blend(40, .7)
  });
  return theme;
}
