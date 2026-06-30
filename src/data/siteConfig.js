/**
 * Site branding configuration.
 *
 * Edit the values below to customize your site's identity —
 * no need to touch any component code.
 */
export const SITE_CONFIG = {
  // Site / project name shown next to the logo and in the footer
  siteName: 'Prince AI',

  // Optional tagline shown under the name in the footer
  tagline: 'A boss with a little dementia xDD',

  // Logo image URL. Paste a direct link to your image here
  // (e.g. from imgbb.com, imgur.com, or any other image host).
  // Leave empty ('') to fall back to the default text/icon logo.
  logoUrl: 'https://pbs.twimg.com/profile_images/1831662910462115840/ascykHGp_400x400.jpg',

  // Footer social / external links. Add, remove, or edit entries as needed.
  // Each entry needs a label and a url. Leave the array empty to hide the row.
  socialLinks: [
     { label: 'Patreon', url: 'https://www.patreon.com/cw/PrinceAI97' },
     { label: 'X/Twitter', url: 'https://x.com/PrinceAI129167' },
     { label: 'Pivix', url: 'https://www.pixiv.net/en/users/11003880' },
	 { label: 'Deviantart', url: 'https://www.deviantart.com/princeai97' },
  ],

  // Copyright line shown at the very bottom of the footer.
  // {year} is automatically replaced with the current year.
  copyrightText: '© {year} Prince AI. All rights reserved.',

  // Age restriction badge shown in the footer. Set to null/false to hide it.
  ageRestriction: '18+',
}
