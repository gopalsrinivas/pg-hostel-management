// Import node module libraries
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Card, Form, Button, Image, Toast, ToastContainer } from "react-bootstrap";
import Link from "next/link";

// Import authlayout to override default layout
import AuthLayout from "layouts/AuthLayout";

const ResetPassword = () => {
  const router = useRouter();

  // State variables for input, error handling, and notifications
  const [identifier, setIdentifier] = useState(""); // Email or Mobile
  const [otp, setOtp] = useState(""); // OTP input
  const [newPassword, setNewPassword] = useState(""); // New password input
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password input
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Track success for redirection

  // Validation regex patterns for email, mobile, and OTP
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobilePattern = /^[0-9]{10}$/;
  const otpPattern = /^[0-9]{6}$/; // Assuming OTP is a 6-digit number

  // Check local storage for existing email
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setIdentifier(storedEmail); // Set the identifier to the stored email
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage(""); // Reset toast message on new submit

    // Validate inputs
    if (!otp) {
      setToastMessage("Please enter the OTP.");
      setShowToast(true);
      return;
    } else if (!otpPattern.test(otp)) {
      setToastMessage("Please enter a valid 6-digit OTP."); // Display message if OTP is invalid
      setShowToast(true);
      return;
    }
    if (!newPassword) {
      setToastMessage("Please enter your new password.");
      setShowToast(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMessage("New password and confirm password do not match.");
      setShowToast(true);
      return;
    }

    try {
      // Send POST request to the API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/reset-password/?identifier=${identifier}&otp=${otp}&new_password=${newPassword}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier, otp, newPassword }), // Send data in the request body
        }
      );

      const responseData = await response.json(); // Parse response data as JSON

      if (!response.ok || responseData.status_code !== 200) {
        // Handle specific errors based on the response message
        if (responseData.msg === "Invalid OTP") {
          setToastMessage("Invalid OTP. Please check and try again.");
        } else if (responseData.msg === "Invalid email or mobile.") {
          setToastMessage("Invalid email or mobile. Please check and try again.");
        } else {
          setToastMessage(responseData.msg || "Failed to reset password. Please try again.");
        }
        setShowToast(true);
        return; // Stop further execution in case of error
      }

      // If the request is successful, show success message and set isSuccess to true
      setToastMessage(responseData.msg || "Password reset successfully!");
      setShowToast(true);
      setIsSuccess(true); // Update isSuccess for redirection

      // Clear local storage after successful reset
      localStorage.removeItem("email");

    } catch (err) {
      // Display specific error message
      setToastMessage(err.message);
      setShowToast(true);
    }
  };

  // Redirect to login page only on successful password reset
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [isSuccess, router]);

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
                  Enter the OTP sent to your email <strong>{identifier}</strong> to reset your password.
                </p>
              </div>
              {/* Form */}
              <Form onSubmit={handleSubmit}>
                {/* OTP Input */}
                <Form.Group className="mb-3" controlId="otp">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    name="otp"
                    placeholder="Enter Your OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Form.Group>
                {/* New Password Input */}
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    placeholder="Enter Your New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Group>
                {/* Confirm Password Input */}
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Your New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

ResetPassword.Layout = AuthLayout;

export default ResetPassword;
