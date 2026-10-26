// src/pages/auth/LoginForm.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { Button, Alert, Form } from 'react-bootstrap';
import useSignIn from './useSignIn';

// validation schema (exported so hook can import it)
export const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('please enter your email'),
  password: yup.string().required('Please enter your password'),
  remember: yup.boolean()
});

const LoginForm = () => {
  const { loading, login, control, error } = useSignIn();

  return (
    <form onSubmit={login} className="authentication-form" noValidate>
      {error && <Alert variant="danger">{error}</Alert>}

      <TextFormInput
        control={control}
        name="email"
        containerClassName="mb-3"
        label="Email"
        id="email-id"
        placeholder="Enter your email"
      />

      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label={
          <>
            <Link to="/auth/reset-pass" className="float-end text-muted text-unline-dashed ms-1">
              Reset password
            </Link>
            <label className="form-label" htmlFor="example-password">
              Password
            </label>
          </>
        }
      />

      <Form.Group className="mb-3 form-check">
        {/* remember checkbox controlled via react-hook-form */}
        <Form.Check
          type="checkbox"
          id="checkbox-signin"
          label="Remember me"
          {...(control ? {} : {})}
      
        />
      </Form.Group>


      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
