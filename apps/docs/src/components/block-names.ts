/** Block files export one main component named after the file: hero-centered → HeroCentered. */
export const blockComponentName = (slug: string) => slug.replace(/(^|-)(\w)/g, (_m, _d, c: string) => c.toUpperCase());
