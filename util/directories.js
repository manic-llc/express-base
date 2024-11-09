import path from 'path';
import * as url from 'url';

export function resolve(base, target) {
  return path.resolve(url.fileURLToPath(new URL('.', base)), target);
}
