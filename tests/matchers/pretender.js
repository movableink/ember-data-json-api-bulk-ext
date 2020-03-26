import td from 'testdouble';
import { isEqual, mapKeys } from 'lodash-es';

function normalizedHeaders(headers) {
  return mapKeys(headers, (value, key) => key.toLowerCase());
}

export const payload = td.matchers.create({
  name: 'payload',
  matches([payload], { requestBody }) {
    const body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;

    return isEqual(payload, body);
  },
});

export const headers = td.matchers.create({
  name: 'headers',
  matches([headers], { requestHeaders }) {
    return isEqual(normalizedHeaders(headers), normalizedHeaders(requestHeaders));
  },
});
