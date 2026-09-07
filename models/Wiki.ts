import { WikiNodeModel } from 'mobx-lark';

import { lark } from '../lib/Lark';
import { LarkWikiDomain, LarkWikiId } from './configuration';

export class MyWikiNodeModel extends WikiNodeModel {
  client = lark.client;
}

export default new MyWikiNodeModel(LarkWikiDomain, LarkWikiId);
