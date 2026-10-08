import babolat from './brands/babolat.png';
import ellesse from './brands/ellesse.png';
import head from './brands/head.png';
import mizuno from './brands/mizuno.png';
import nike from './brands/nike.png';
import prosPro from './brands/pros-pro.png';
import puma from './brands/puma.png';
import sergioTacchini from './brands/sergio-tacchini.png';
import underArmour from './brands/under-armour.png';

export const BRAND_LOGOS: Record<string, string> = {
  babolat,
  ellesse,
  head,
  mizuno,
  nike,
  'pros-pro': prosPro,
  'pro-s-pro': prosPro,
  puma,
  'sergio-tacchini': sergioTacchini,
  'under-armour': underArmour,
};

export function getBrandLogo(brandSlug?: string): string | undefined {
  if (!brandSlug) return undefined;
  const clean = brandSlug.toLowerCase().replace(/['\s]/g, '-');
  return BRAND_LOGOS[clean];
}
