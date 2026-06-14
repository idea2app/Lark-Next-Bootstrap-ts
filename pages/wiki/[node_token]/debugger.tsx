import { CodeBlock } from 'idea-react';
import { Block, DocumentBlockModel, renderBlocks, WikiNode } from 'mobx-lark';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FC } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Minute, Second } from 'web-utility';

import { PageHead } from '../../../components/Layout/PageHead';
import documentStore from '../../../models/Document';
import wikiStore from '../../../models/Wiki';
import { lark } from '../../api/Lark/core';

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    await lark.getAccessToken();

    const nodes = await wikiStore.getAll();

    return {
      paths: nodes.map(({ node_token }) => ({ params: { node_token } })),
      fallback: 'blocking',
    };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  await lark.getAccessToken();

  const node = await wikiStore.getOne(params!.node_token as string);

  if (node?.obj_type !== 'docx') return { notFound: true };

  try {
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
  } catch (error) {
    console.error(error);

    return { notFound: true, revalidate: Minute / Second };
  }
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
