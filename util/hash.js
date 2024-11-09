import bcrypt from 'bcrypt';
import { randomFillSync } from 'crypto';

export function hash(string) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(string, 10, (err, hashed) => {
      if (err) reject(err);
      resolve(hashed);
    });
  });
}

export function compare(a, b) {
  return new Promise(resolve => {
    bcrypt.compare(a, b, (err, match) => {
      if (match) resolve(true);
      resolve(false); // Yeah, I know.
    });
  });
}

export function randomID(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;
  const maxValid = 256 - (256 % charsLength);
  let result = '';
  const array = new Uint8Array(length);

  randomFillSync(array);

  for (let i = 0; i < length; i++) {
    let randomValue = array[i];
    while (randomValue >= maxValid) randomValue = randomFillSync(new Uint8Array(1))[0];
    result += chars[randomValue % charsLength];
  }

  return result;
}
