import { CodeBlock } from 'idea-react';
import { Block, DocumentBlockModel, renderBlocks, WikiNode } from 'mobx-lark';
import { GetServerSideProps } from 'next';
import { FC } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { PageHead } from '../../../components/Layout/PageHead';
import documentStore from '../../../models/Document';
import wikiStore from '../../../models/Wiki';
import { lark } from '../../api/Lark/core';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  await lark.getAccessToken();

  const node = await wikiStore.getOne(params!.node_token as string);

  if (node?.obj_type !== 'docx') return { notFound: true };

  const { client, domain } = documentStore;

  class MyDocumentBlockModel extends DocumentBlockModel {
    client = client;
  }

  const [rawBlocks, renderableBlocks] = await Promise.all([
    new MyDocumentBlockModel(domain, node.obj_token).getAll(),
    new MyDocumentBlockModel(domain, node.obj_token).getRenderableAll(
      token => `/api/Lark/file/${token}/placeholder`,
    ),
  ]);

  return { props: { node, rawBlocks, renderableBlocks } };
};

interface WikiDocumentDebuggerPageProps {
  node: WikiNode;
  rawBlocks: Block<any, any, any>[];
  renderableBlocks: Block<any, any, any>[];
}

const WikiDocumentDebuggerPage: FC<WikiDocumentDebuggerPageProps> = ({
  node,
  rawBlocks,
  renderableBlocks,
}) => {
  const rendered = renderBlocks(renderableBlocks);

  return (
    <Container>
      <PageHead title={`${node.title} - Debugger`} />

      <Row>
        <Col>
          <h2>Raw Blocks</h2>

          <CodeBlock language="json">
            {JSON.stringify(rawBlocks, null, 2)}
          </CodeBlock>
        </Col>

        <Col>
          <h2>Renderable Blocks</h2>

          <CodeBlock language="json">
            {JSON.stringify(renderableBlocks, null, 2)}
          </CodeBlock>
        </Col>

        <Col>
          <h2>Component Tree</h2>

          <CodeBlock language="tsx">{rendered}</CodeBlock>
        </Col>
      </Row>

      <section>
        <h2>Document</h2>

        {rendered}
      </section>
    </Container>
  );
};

export default WikiDocumentDebuggerPage;
