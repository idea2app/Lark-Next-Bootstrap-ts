// eslint-disable-next-line simple-import-sort/imports
import dynamic from 'next/dynamic';
import { textJoin } from 'mobx-i18n';
import { observer } from 'mobx-react';
import { compose, translator } from 'next-ssr-middleware';
import { FC, PropsWithChildren } from 'react';
import { Container } from 'react-bootstrap';
import { CodeBlock, EditorHTML } from 'idea-react';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

import { PageHead } from '../components/Layout/PageHead';
import { i18n, t } from '../models/Translation';
import RichEditData from './api/rich-edit.json';

const HTMLEditor = dynamic(() => import('../components/Form/HTMLEditor'), {
  ssr: false,
});
HTMLEditor.displayName = 'HTMLEditor';

const BlockEditor = dynamic(() => import('../components/Form/BlockEditor'), {
  ssr: false,
});
BlockEditor.displayName = 'BlockEditor';

const Example: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => (
  <>
    <h2 className="mt-3">{title}</h2>
    {children}
    <CodeBlock language="tsx">{children}</CodeBlock>
  </>
);

export const getServerSideProps = compose(translator(i18n));

const ComponentPage = observer(() => {
  const title = textJoin(t('component'), t('examples'));

  return (
    <>
      <PageHead title={title}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/prismjs@1.30.0/themes/prism.min.css"
        />
      </PageHead>

      <Container>
        <h1 className="my-4 text-center">{title}</h1>

        <Example title="HTML Editor">
          <HTMLEditor defaultValue="Hello, HTML!" onChange={console.info} />
        </Example>

        <Example title="Block Editor">
          <BlockEditor name="content" defaultValue={RichEditData} />
        </Example>

        <Example title="Block Editor to HTML">
          <EditorHTML data={RichEditData} />
        </Example>
      </Container>
    </>
  );
});
export default ComponentPage;
