import { withSafeKoa } from '../../../core';
import { proxyLark } from '../../core';

export const config = { api: { bodyParser: false } };

export default withSafeKoa(proxyLark());
