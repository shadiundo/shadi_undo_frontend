import { Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import PriorityProfessionTable from './components/PriorityProfessionTable';

const GridJS = () => {
  return (
    <>
      {/* <PageBreadcrumb subName="Table" title="Priority Profession Ranking" /> */}
      <PageMetaData title="Priority Ranking" />
      <Row>
        <Col xl={12}>
          <PriorityProfessionTable />
        </Col>
      </Row>
    </>
  );
};
export default GridJS;