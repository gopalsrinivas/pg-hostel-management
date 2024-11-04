// Import node module libraries
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Card, Form, Button, Image, Toast, ToastContainer } from "react-bootstrap";
import Link from "next/link";

// Import authlayout to override default layout
import AuthLayout from "layouts/AuthLayout";

const ForgetPassword = () => {
  const router = useRouter();

  // State variables for input, error handling, and notifications
  const [identifier, setIdentifier] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Validation regex patterns for email and mobile
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobilePattern = /^[0-9]{10}$/;

  // Check local storage for existing identifier
  useEffect(() => {
    const storedIdentifier = localStorage.getItem("email");
    if (storedIdentifier) {
      setIdentifier(storedIdentifier);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage(""); // Reset toast message on new submit

    // Validate input (either email or mobile number)
    if (!identifier) {
      setToastMessage("Please enter your email or mobile number.");
      setShowToast(true);
      return;
    } else if (!emailPattern.test(identifier) && !mobilePattern.test(identifier)) {
      setToastMessage("Please enter a valid email address or a 10-digit mobile number.");
      setShowToast(true);
      return;
    }

    try {
      // Send POST request to the API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/forgot-password/?identifier=${identifier}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier }), // Send identifier data in the request body
        }
      );

      const responseData = await response.json(); // Parse response data as JSON

      if (!response.ok) {
        // If the response is not successful, display the error message from the backend
        throw new Error(responseData?.msg || "Failed to send reset password email. Please try again.");
      }

      // If the request is successful, handle the response
      setToastMessage(responseData?.msg || "Password reset email sent successfully!");
      setShowToast(true);

      // Check if response indicates success and contains an email
      if (responseData.status === "success" && responseData.data && responseData.data.email) {
        localStorage.setItem("email", responseData.data.email); // Store email from response
        // Redirect to the reset password page after showing a success message
        setTimeout(() => {
          router.push("/authentication/reset-password");
        }, 3000);
      } else {
        // If the identifier does not exist in the database
        setToastMessage("The email or mobile number is not registered. Please check and try again.");
        setShowToast(true);
      }

      // Clear the input field
      setIdentifier("");

    } catch (err) {
      // Display specific error message
      setToastMessage(err.message);
      setShowToast(true);
    }
  };

  return (
    <>
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
                <p className="mb-6">
                  Don&apos;t worry, we&apos;ll send you an email to reset your password.
                </p>
              </div>
              {/* Form */}
              <Form onSubmit={handleSubmit}>
                {/* Identifier (Email or Mobile) */}
                <Form.Group className="mb-3" controlId="identifier">
                  <Form.Label>Email or Mobile </Form.Label>
                  <Form.Control
                    type="text"
                    name="identifier"
                    placeholder="Enter Your Email or Mobile"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </Form.Group>
                {/* Button */}
                <div className="mb-3 d-grid">
                  <Button variant="primary" type="submit">
                    Reset Password
                  </Button>
                </div>
                <span>
                  Don&apos;t have an account?{" "}
                  <Link href="/">Sign In</Link>
                </span>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-center" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

ForgetPassword.Layout = AuthLayout;

export default ForgetPassword;
