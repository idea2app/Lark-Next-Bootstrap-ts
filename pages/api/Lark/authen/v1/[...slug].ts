import { withSafeKoa } from '../../../core';
import { proxyLark } from '../../core';

export default withSafeKoa(proxyLark());
