import { createDirectus, rest, authentication } from '@directus/sdk';

const directus = createDirectus('http://localhost:3000').with(rest()).with(authentication());

export default directus;