import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import Link from "next/link";
import AuthLayout from "layouts/AuthLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Enable the button only if OTP is not empty
    setIsButtonEnabled(otp.trim().length > 0);
  }, [otp]);

  // Function to handle OTP verification
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    try {
      const Id = localStorage.getItem("id");
      if (!Id) {
        toast.error("User ID not found in localStorage.");
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/verify-otp/?id=${Id}&otp=${otp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("OTP verified successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // Display the error message based on the status code
        if (response.status === 404) {
          toast.error("User not found. Please check the ID and try again.");
        } else if (response.status === 400) {
          if (result.detail === "User is already active") {
            toast.success("User is already active. Redirecting to login...");
            setTimeout(() => {
              router.push("/");
            }, 2000);
          } else {
            toast.error("Invalid OTP. Please check and try again.");
          }
        } else if (response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(result.message || "OTP verification failed.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while verifying OTP. Please try again.");
      console.error("Error:", error);
    }
  };

  // Function to handle Resend OTP
  const handleResendOtp = async () => {
    try {
      const Id = localStorage.getItem("id");
      if (!Id) {
        toast.error("User ID not found in localStorage.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/resend-otp/?id=${Id}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();
      console.log("Resend OTP Response:", result);

      if (response.ok) {
        toast.success("OTP resent successfully!");
      } else {
        // Check for specific error message
        if (response.status === 400 && result.detail === "User is already active") {
          toast.success("User is already active. Redirecting to login...");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          console.error("Error status:", response.status);
          toast.error(result.message || "Failed to resend OTP. Please try again.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while resending OTP. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        <Card className="smooth-shadow-md">
          <Card.Body className="p-6">
            <div className="mb-4">
              <Link href="/">
                <Image
                  src="/images/brand/logo/logo-primary.svg"
                  className="mb-2"
                  alt=""
                />
              </Link>
              <p className="mb-6">Verify user OTP</p>
            </div>
            <Form onSubmit={handleVerifyOtp}>
              <Form.Group className="mb-3" controlId="otp">
                <Form.Label>OTP</Form.Label>
                <Form.Control
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter Your OTP"
                  required
                />
              </Form.Group>
              <div className="mb-3 d-grid">
                <Button variant="primary" type="submit" disabled={!isButtonEnabled}>
                  Verify OTP
                </Button>
              </div>
              <span>
                <Link href="/">Sign In</Link>
                <Link style={{ float: "right" }} href="#" onClick={handleResendOtp}>
                  Resend OTP
                </Link>
              </span>
            </Form>
            {/* Toast container */}
            <ToastContainer />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

OtpVerify.Layout = AuthLayout;

export default OtpVerify;
