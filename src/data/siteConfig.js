/**
 * Site branding configuration.
 *
 * Edit the values below to customize your site's identity —
 * no need to touch any component code.
 */
export const SITE_CONFIG = {
  // Site / project name shown next to the logo and in the footer
  siteName: 'VoteBox',

  // Optional tagline shown under the name in the footer
  tagline: 'Платформа для голосований',

  // Logo image URL. Paste a direct link to your image here
  // (e.g. from imgbb.com, imgur.com, or any other image host).
  // Leave empty ('') to fall back to the default text/icon logo.
  logoUrl: '',

  // Footer social / external links. Add, remove, or edit entries as needed.
  // Each entry needs a label and a url. Leave the array empty to hide the row.
  socialLinks: [
    // { label: 'Telegram', url: 'https://t.me/yourchannel' },
    // { label: 'VK', url: 'https://vk.com/yourpage' },
    // { label: 'Сайт', url: 'https://example.com' },
  ],

  // Copyright line shown at the very bottom of the footer.
  // {year} is automatically replaced with the current year.
  copyrightText: '© {year} VoteBox. Все права защищены.',

  // Age restriction badge shown in the footer. Set to null/false to hide it.
  ageRestriction: '18+',
}
