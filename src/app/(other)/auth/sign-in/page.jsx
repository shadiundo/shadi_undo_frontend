import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoBox from '@/components/LogoBox';
import PageMetaData from '@/components/PageTitle';
import LoginForm from './LoginForm';
import signInImg from '@/assets/images/sign-in.png';

const SignIn = () => {
  return (
    <>
      <PageMetaData title="Sign In" />

      <Card className="auth-card">
        <CardBody className="p-0">
          <Row className="align-items-center g-0">
            <Col lg={6} className="d-none d-lg-inline-block border-end">
              <div className="auth-page-sidebar">
                <img src={signInImg} width={521} height={521} alt="auth" className="img-fluid" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="p-4">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <LogoBox
                    textLogo={{ height: 55, width: 84 }}
                    squareLogo={{ className: 'me-1' }}
                    containerClassName="mx-auto mb-4 text-center auth-logo"
                  />
                </div>
                <h2 className="fw-bold text-center fs-28">Sign In</h2>
                <p className="text-muted text-center mt-1 mb-4">
                  Enter your email address and password to access admin panel.
                </p>
                <Row className="justify-content-center">
                  <Col xs={12} md={8}>
                    <LoginForm />
                  </Col>
                </Row>
              </div>

              <div className="text-center mt-2 p-3 bg-light rounded mx-3">
                <p className="text-black mb-1 fw-bold">Client / User Consultation</p>
                <p className="text-muted small mb-2">
                  Clients log in via Email OTP directly when booking or viewing appointments.
                </p>
                <Link to="/lawyer-list" className="btn btn-outline-primary btn-sm">
                  Book Consultation & Login with OTP →
                </Link>
              </div>

              <div className="text-center mt-3 pb-3">
                <p className="text-black mb-0">
                  Are you a professional?{' '}
                  <a href="/auth/professional-login" className="text-black fw-semibold">
                    Sign In as Lawyer / Mediator / Counsellor / Therapist
                  </a>
                </p>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

export default SignIn;
