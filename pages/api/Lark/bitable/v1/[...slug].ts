import { withSafeKoa } from '../../../../../lib/API';
import { proxyLarkAll } from '../../../../../lib/Lark';

export const config = { api: { bodyParser: false } };

export default withSafeKoa(proxyLarkAll);
