// ProfessionalLoginPage.jsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import signInImg from "@/assets/images/sign-in.png";
import LogoBox from "@/components/LogoBox";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import "./ProfessionalSignUp";

// ---------------- VALIDATION ----------------
const schema = yup.object({
  email: yup.string().email("Invalid email").required("Required"),
  password: yup.string().required("Required"),
});

export default function ProfessionalLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(""); // ✅ ADDED
  const navigate = useNavigate();
  const auth = useAuthContext();

  // ---------------- SUBMIT ----------------
  const onSubmit = async (data) => {
    setLoginError(""); // clear old error

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/professionals/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (res.ok && result.success && result.token) {
        const { professional, token } = result;

        auth.saveSession({ user: professional, token });

        navigate("/professional/profile", { replace: true });
      } else {
        // ✅ SHOW ERROR MESSAGE
        setLoginError(result?.message || "Invalid email or password");
      }
    } catch (err) {
      setLoginError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(#CAAA93, #d4b8a2)" }}
    >
      <div className="container py-5">
        <Card className="auth-card shadow-lg overflow-hidden">
          <CardBody className="p-0">
            <Row className="g-0 align-items-center">
              {/* LEFT IMAGE */}
              <Col
                lg={6}
                className="d-none d-lg-flex border-end bg-white align-items-center justify-content-center"
                style={{ minHeight: 520 }}
              >
                <div className="text-center p-5" style={{ maxWidth: 600 }}>
                  <img
                    src={signInImg}
                    alt="illustration"
                    className="img-fluid mb-4"
                  />
                  <h4 className="fw-bold text-dark mt-4">Welcome back</h4>
                  <p className="text-muted">
                    Sign in to access your professional dashboard.
                  </p>
                </div>
              </Col>

              {/* RIGHT FORM */}
              <Col lg={6}>
                <div className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    {typeof LogoBox !== "undefined" && (
                      <LogoBox containerClassName="mx-auto mb-3 text-center auth-logo" />
                    )}
                    <h2 className="fw-bold mb-1">Sign In Professions</h2>
                    <p className="text-muted mb-0">
                      Enter your email and password to continue.
                    </p>
                  </div>

                  <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={9}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        {/* 🔴 ERROR MESSAGE */}
                        {loginError && (
                          <div className="alert alert-danger py-2 text-center">
                            {loginError}
                          </div>
                        )}

                        {/* EMAIL */}
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="you@company.com"
                            {...register("email")}
                            isInvalid={!!errors.email}
                            autoComplete="email"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email?.message}
                          </Form.Control.Feedback>
                        </Form.Group>

                        {/* PASSWORD */}
                        <Form.Group className="mb-3" controlId="password">
                          <div className="d-flex justify-content-between mb-1">
                            <Form.Label>Password</Form.Label>
                            <a href="#" className="text-dark">
                              Reset password
                            </a>
                          </div>

                          <InputGroup>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...register("password")}
                              isInvalid={!!errors.password}
                              autoComplete="current-password"
                            />
                            <Button
                              variant="outline-secondary"
                              type="button"
                              onClick={() =>
                                setShowPassword((prev) => !prev)
                              }
                            >
                              {showPassword ? "Hide" : "Show"}
                            </Button>
                          </InputGroup>

                          <Form.Control.Feedback
                            type="invalid"
                            style={{
                              display: errors.password ? "block" : "none",
                            }}
                          >
                            {errors.password?.message}
                          </Form.Control.Feedback>
                        </Form.Group>

                        {/* REMEMBER */}
                        <div className="mb-3">
                          <Form.Check label="Remember me" />
                        </div>

                        {/* SUBMIT */}
                        <div className="d-grid mb-3">
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                          </Button>
                        </div>

                        <p className="text-center text-muted mt-4 mb-0">
                          Don&apos;t have an account?{" "}
                          <a
                            href="/auth/professional-signup"
                            className="fw-semibold"
                          >
                            Sign Up
                          </a>
                        </p>
                      </Form>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
