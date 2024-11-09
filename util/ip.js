import geoip from 'geoip-lite';

export function ipLookup(ip) {
  return geoip.lookup(ip);
}
