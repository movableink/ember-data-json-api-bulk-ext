import { MIME_TYPE } from '../constants';

export default function buildAjaxOptions(adapterOptions, useExtensionMimeType) {
  const { headers: customHeaders, ...otherAdapterOptions } = adapterOptions;

  return useExtensionMimeType
    ? {
        headers: {
          Accept: MIME_TYPE,
          ...customHeaders,
        },
        contentType: MIME_TYPE,
        ...otherAdapterOptions,
      }
    : adapterOptions;
}
