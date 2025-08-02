import { WikiNode } from 'mobx-lark';
import { GetStaticProps } from 'next';
import { FC } from 'react';
import { Container } from 'react-bootstrap';

import { PageHead } from '../../components/Layout/PageHead';
import wikiStore from '../../models/Wiki';
import { lark } from '../api/Lark/core';

export const getStaticProps: GetStaticProps = async () => {
  await lark.getAccessToken();

  const nodes = await wikiStore.getAll();

  return { props: { nodes } };
};

const WikiIndexPage: FC<{ nodes: WikiNode[] }> = ({ nodes }) => (
  <Container>
    <PageHead title="Wiki" />

    <h1>Wiki</h1>

    <ol>
      {nodes.map(({ node_token, title }) => (
        <li key={node_token}>
          <a href={`/wiki/${node_token}`}>{title}</a>
        </li>
      ))}
    </ol>
  </Container>
);

export default WikiIndexPage;
