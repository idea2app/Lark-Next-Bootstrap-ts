import {
  Container,
  Drawer,
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarToggler,
  NavItem,
  NavLink,
} from 'idea-react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';
import dynamic from 'next/dynamic';

import { Name } from '../../models/configuration';
import { i18n, I18nContext } from '../../models/Translation';

const LanguageMenu = dynamic(() => import('./LanguageMenu'), { ssr: false });

@observer
export class MainNavigator extends ObservedComponent<{}, typeof i18n> {
  static contextType = I18nContext;

  @observable accessor open = false;

  toggle = action(() => (this.open = !this.open));

  hide = action(() => (this.open = false));

  @computed
  get links() {
    const { t } = this.observedContext;

    return [
      { href: '/article', label: t('article') },
      { href: '/wiki', label: t('wiki') },
      { href: '/component', label: t('component') },
      { href: '/pagination', label: t('pagination') },
      { href: '/scroll-list', label: t('scroll_list') },
      {
        target: '_blank',
        href: 'https://github.com/idea2app/Lark-Next-Bootstrap-ts',
        label: t('source_code'),
      },
    ];
  }

  render() {
    return (
      <Navbar className="fixed-top bg-primary" theme="dark" expand="sm">
        <Container>
          <NavbarBrand href="/">{Name}</NavbarBrand>

          <NavbarToggler
            expanded={this.open}
            aria-label="Toggle navigation"
            onClick={this.toggle}
          />

          <Drawer
            className="w-100"
            bodyClassName="d-flex"
            title={Name}
            responsive="sm"
            placement="end"
            open={this.open}
            onDismiss={this.hide}
          >
            <NavbarNav className="flex-fill">
              {this.links.map(({ href, label, target }) => (
                <NavItem key={href}>
                  <NavLink href={href} target={target} onClick={this.hide}>
                    {label}
                  </NavLink>
                </NavItem>
              ))}
            </NavbarNav>

            <LanguageMenu />
          </Drawer>
        </Container>
      </Navbar>
    );
  }
}
