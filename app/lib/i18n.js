/**
 * @param {Request} request
 */
export function getLocaleFromRequest(request) {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  let pathPrefix = '';
  let [language, country] = ['EN', 'US'];

  if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
    pathPrefix = '/' + firstPathPart;
    [language, country] = firstPathPart.split('-');
  } else {
    // Detecta país pelo IP via header do Oxygen
    const buyerCountry = request.headers.get('oxygen-buyer-country');
    if (buyerCountry) {
      country = buyerCountry.toUpperCase();
      // Mapeia país para language
      const countryLanguageMap = {
        AU: 'EN', GB: 'EN', CA: 'EN', NZ: 'EN',
        BR: 'PT', PT: 'PT', FR: 'FR', DE: 'DE',
        ES: 'ES', MX: 'ES', IT: 'IT', JP: 'JA',
      };
      language = countryLanguageMap[country] || 'EN';
    }
  }

  return {language, country, pathPrefix};
}

/**
 * @typedef {Object} I18nLocale
 * @property {import('@shopify/hydrogen/storefront-api-types').LanguageCode} language
 * @property {import('@shopify/hydrogen/storefront-api-types').CountryCode} country
 * @property {string} pathPrefix
 */
