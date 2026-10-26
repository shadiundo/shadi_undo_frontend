import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllFriends } from '@/helpers/data';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
const Messages = () => {
  const [allMessages, setAllMessages] = useState();
  useEffect(() => {
    (async () => {
      const data = await getAllFriends();
      setAllMessages(data);
    })();
  }, []);
  return <Card>
      <CardHeader className="d-flex align-items-center">
        <CardTitle as={'h5'}>Reviews</CardTitle>
        <div className="ms-auto">
          <span className="text-primary icons-center" role="button">
            Export
            <IconifyIcon icon="bx:export" className="ms-1" />
          </span>
        </div>
      </CardHeader>
      <CardBody>
        <ul className="list-unstyled mb-0">
          <li className="pb-3 pb-3 border-bottom">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <img src="/src/assets/images/users/avatar-1.jpg" alt="avatar-2" className="avatar-md rounded-circle"/>
               <h5 className="fs-15 mt-0 mb-1">Hemant Sing</h5>
               
              <div className="d-block">
                <p className="text-muted fs-15 text-break mb-2">Nice to Connect with him</p>
                <h6  className="fs-14 mt-0 mb-1">Lorem ipsum lorem ipsum Lorem ipsum lorem ipsum Lorem ipsum lorem ipsum Lorem ipsum lorem ipsum Lorem ipsum lorem ipsum</h6>
                </div>
                <div className="ms-auto text-end">
                  <p className="text-muted mb-0"> 
                    <IconifyIcon icon="iconamoon:star-fill" className="text-warning ms-1" />
                    <IconifyIcon icon="iconamoon:star-fill" className="text-warning ms-1" />
                    <IconifyIcon icon="iconamoon:star-fill" className="text-warning ms-1" />
                    <IconifyIcon icon="iconamoon:star-fill" className="text-warning ms-1" />
                    <IconifyIcon icon="iconamoon:star-fill" className="text-warning ms-1" />
                    </p>
                  </div>
                  </div>
                  </li>
                  </ul>
      </CardBody>
    </Card>;
};
export default Messages;