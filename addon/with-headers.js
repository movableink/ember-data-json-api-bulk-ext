export const MIME_TYPE = 'application/vnd.api+json; ext=bulk';

export function withHeaders(AdapterClass) {
  return class AdapterWithContentType extends AdapterClass {
    get headers() {
      const headers = typeof super.headers === 'undefined' ? {} : super.headers;

      return {
        ...headers,
        Accept: MIME_TYPE,
        'Content-Type': MIME_TYPE
      };
    }
  };
}
