import td from 'testdouble';
import { isEqual } from 'lodash-es';

export const payload = td.matchers.create({
  name: 'payload',
  matches([payload], { requestBody }) {
    const body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;

    return isEqual(payload, body);
  }
});
