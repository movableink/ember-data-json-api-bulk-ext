import td from 'testdouble';
import { isEqual } from 'lodash-es';

export const payload = td.matchers.create({
  name: 'payload',
  matches([payload], { requestBody }) {
    const body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;

    return isEqual(payload, body);
  }
});

export const headers = td.matchers.create({
  name: 'headers',
  matches([headerObject], { requestHeaders }) {
    const normalizedHeaderObject = {};

    for (const key in headerObject) {
      normalizedHeaderObject[key.toLowerCase()] = headerObject[key];
    }

    return isEqual(normalizedHeaderObject, requestHeaders);
  }
});
