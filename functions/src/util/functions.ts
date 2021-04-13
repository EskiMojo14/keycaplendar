/**
 * ### Returns Go / Lua like responses(data, err)
 * when used with await
 *
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.all([req1, req2, req3])
 * - Example response [ [data1, data2, data3], undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.race([req1, req2, req3])
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 * @param {Promise} promise
 * @returns {Promise} [ data, undefined ]
 * @returns {Promise} [ undefined, Error ]
 */

export const handle = <T>(promise: Promise<T>): Promise<[T, undefined] | [undefined, any]> => {
  return promise
    .then((data) => [data, undefined] as [T, undefined])
    .catch((error) => Promise.resolve([undefined, error] as [undefined, any]));
};
