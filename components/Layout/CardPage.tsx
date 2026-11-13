import { Col, PageItem, PageLink, Pagination, Row } from 'idea-react';
import { ComponentClass, FC } from 'react';

import { SearchPageMeta } from '../../models/System';

export interface CardPageProps extends SearchPageMeta {
  Card: ComponentClass<any> | FC<any>;
  cardLinkOf?: (id: string) => string;
  pageLinkOf: (page: number) => string;
}

export const CardPage: FC<CardPageProps> = ({
  Card,
  cardLinkOf,
  currentPage,
  pageIndex,
  pageCount,
  pageLinkOf,
}) => (
  <>
    <Row className="g-3 my-3" xs={1} md={2} lg={3}>
      {currentPage.map(item => (
        <Col key={item.id as string}>
          <Card className="h-100" linkOf={cardLinkOf} {...item} />
        </Col>
      ))}
    </Row>

    <Pagination className="justify-content-center" size="lg">
      <PageItem disabled={pageIndex === 1}>
        <PageLink
          href={pageLinkOf(pageIndex - 1)}
          aria-label="Previous page"
          tabIndex={pageIndex === 1 ? -1 : undefined}
        >
          &lsaquo;
        </PageLink>
      </PageItem>
      <PageItem disabled={pageIndex === pageCount}>
        <PageLink
          href={pageLinkOf(pageIndex + 1)}
          aria-label="Next page"
          tabIndex={pageIndex === pageCount ? -1 : undefined}
        >
          &rsaquo;
        </PageLink>
      </PageItem>
    </Pagination>
  </>
);
