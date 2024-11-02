// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
// import authlayout to override default layout
import AuthLayout from "layouts/AuthLayout";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);

    const isFormFilled = username && password;

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setValidated(true);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/login/`,
                new URLSearchParams({
                    grant_type: "password",
                    username,
                    password,
                    scope: "client_id",
                    client_id: "string",
                    client_secret: "string"
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                    },
                }
            );

            // Check if login was successful
            if (response.data.status === "success") {
                localStorage.setItem("access_token", response.data.access_token);
                localStorage.setItem("refresh_token", response.data.refresh_token);
                localStorage.setItem("user_data", JSON.stringify(response.data.user_data));

                // Redirect user to a dashboard or home page
                window.location.href = "/dashboard/main-dashboard";
            }
        } catch (err) {
            console.error(err);
            setError("Login failed. Please check your credentials and try again.");
        }
    };

    return (
        <Row className="align-items-center justify-content-center g-0 min-vh-100">
            <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
                {/* Card */}
                <Card className="smooth-shadow-md">
                    {/* Card body */}
                    <Card.Body className="p-6">
                        <div className="mb-4">
                            <Link href="/">
                                <Image
                                    src="/images/brand/logo/logo-primary.svg"
                                    className="mb-2"
                                    alt="Logo"
                                />
                            </Link>
                            <p className="mb-6">Please enter your user information.</p>
                        </div>
                        {/* Error Message */}
                        {error && <Alert variant="danger">{error}</Alert>}
                        {/* Form */}
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            {/* Username */}
                            <Form.Group className="mb-3" controlId="username">
                                <Form.Label>Username or email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="username"
                                    placeholder="Enter address here"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a valid email.
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Password */}
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="**************"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your password.
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Checkbox */}
                            <div className="d-lg-flex justify-content-between align-items-center mb-4">
                                <Form.Check type="checkbox" id="rememberme">
                                    <Form.Check.Input type="checkbox" />
                                    <Form.Check.Label>Remember me</Form.Check.Label>
                                </Form.Check>
                            </div>
                            <div>
                                {/* Button */}
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={!isFormFilled}>
                                        Sign In
                                    </Button>
                                </div>
                                <div className="d-md-flex justify-content-between mt-4">
                                    <div className="mb-2 mb-md-0">
                                        <Link href="/authentication/sign-up" className="fs-5">
                                            Create An Account{" "}
                                        </Link>
                                    </div>
                                    <div>
                                        <Link
                                            href="/authentication/forget-password"
                                            className="text-inherit fs-5"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

SignIn.Layout = AuthLayout;

export default SignIn;
