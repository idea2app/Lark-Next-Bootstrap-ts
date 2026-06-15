import { CodeBlock } from 'idea-react';
import {
  Block,
  DocumentBlockModel,
  renderBlocks,
  WikiNode,
} from 'mobx-lark';
import { GetStaticPaths, GetStaticProps } from 'next';
import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Minute, Second } from 'web-utility';

import { PageHead } from '../../../components/Layout/PageHead';
import { LarkWikiDomain } from '../../../models/configuration';
import wikiStore from '../../../models/Wiki';
import { lark } from '../../api/Lark/core';

class DebugDocumentBlockModel extends DocumentBlockModel {
  client = lark.client;
}

const resolveFileURL = (token: string) => `/api/Lark/file/${token}/placeholder`;

const toJSONText = (value: unknown) =>
  JSON.stringify(
    value,
    (_, current) => {
      if (typeof current === 'bigint') return current.toString();
      if (typeof current === 'function') return `[Function ${current.name}]`;
      if (typeof current === 'symbol') return current.toString();

      return current;
    },
    2,
  );

const toElementTree = (node: ReactNode): unknown => {
  if (Array.isArray(node)) return node.map(toElementTree);

  if (!isValidElement(node)) return node;

  const { children, ...props } = node.props as Record<string, unknown>;
  const nodeType = node.type;
  const type = (() => {
    if (typeof nodeType === 'string') return nodeType;
    if (typeof nodeType !== 'function' && typeof nodeType !== 'object')
      return 'Component';

    const component = nodeType as { displayName?: string; name?: string };

    return component.displayName || component.name || 'Component';
  })();

  return {
    type,
    props,
    children: children ? toElementTree(children as ReactNode) : undefined,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  await lark.getAccessToken();

  const nodes = await wikiStore.getAll();

  return {
    paths: nodes.map(({ node_token }) => ({ params: { node_token } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  await lark.getAccessToken();

  const node = await wikiStore.getOne(params!.node_token as string);

  if (node?.obj_type !== 'docx') return { notFound: true };

  const blockStore = new DebugDocumentBlockModel(
    LarkWikiDomain,
    node.obj_token,
  );

  try {
    const [rawBlocks, renderableBlocks] = await Promise.all([
      blockStore.getAll(),
      blockStore.getRenderableAll(resolveFileURL),
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

const DebugCard = ({
  title,
  language,
  children,
}: {
  title: string;
  language: string;
  children: string;
}) => (
  <Card className="h-100">
    <Card.Header as="h2" className="h5">
      {title}
    </Card.Header>
    <Card.Body className="overflow-auto" style={{ maxHeight: '60vh' }}>
      <CodeBlock language={language}>{children}</CodeBlock>
    </Card.Body>
  </Card>
);

export default function WikiDocumentDebuggerPage({
  node,
  rawBlocks,
  renderableBlocks,
}: WikiDocumentDebuggerPageProps) {
  const renderedBlocks = renderBlocks(renderableBlocks);

  return (
    <Container fluid className="py-4">
      <PageHead title={`${node.title} Debugger`}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/prismjs@1.30.0/themes/prism.min.css"
        />
      </PageHead>

      <h1 className="mb-4">{node.title} Debugger</h1>

      <Row xs={1} lg={3} className="g-3">
        <Col>
          <DebugCard title="Raw document blocks" language="json">
            {toJSONText(rawBlocks)}
          </DebugCard>
        </Col>
        <Col>
          <DebugCard title="Renderable document blocks" language="json">
            {toJSONText(renderableBlocks)}
          </DebugCard>
        </Col>
        <Col>
          <DebugCard title="Rendered component tree" language="tsx">
            {toJSONText(toElementTree(renderedBlocks))}
          </DebugCard>
        </Col>
      </Row>

      <section className="mt-4">
        <h2 className="mb-3">Read-only document view</h2>
        <Card>
          <Card.Body>{renderedBlocks}</Card.Body>
        </Card>
      </section>
    </Container>
  );
}
