// import necessary libraries and components
import { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
// import custom layout
import AuthLayout from "layouts/AuthLayout";

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    userRole: "",
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data and reset error for the specific field
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: type === "checkbox" ? checked : value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate all fields before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.userRole) newErrors.userRole = "Role selection is required";
    if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enable submit button when all fields are filled
  useEffect(() => {
    const allFieldsFilled = Object.values(formData).every((field) => field);
    setIsSubmitEnabled(allFieldsFilled);
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister`,
        {
          email: formData.email,
          mobile: formData.mobile,
          name: formData.username,
          password: formData.password,
          user_role: formData.userRole
        }
      );

      // Check for success status
      if (response.data.status_code === 200) {
        const { user_data } = response.data; 
        if (user_data) {
          const { id, user_id } = user_data;
          // Store in localStorage
          localStorage.setItem("id", id);
          localStorage.setItem("user_id", user_id);
          toast.success("User registered successfully. OTP sent to your email.");
          // Redirect to verify-otp component
          router.push("/authentication/verify-otp");
          // Clear form data after successful registration
          setFormData({
            username: "",
            email: "",
            mobile: "",
            password: "",
            confirmPassword: "",
            userRole: "",
            agreedToTerms: false
          });
        } else {
          toast.error("User registration failed. Please try again.");
        }
      } else {
        toast.error(response.data.message || "User registration failed. Please try again.");
      }
    } catch (error) {
      // Differentiate between network errors and backend errors
      if (error.response) {
        // If error response is available
        if (error.response.data && error.response.data.detail) {
          toast.error(error.response.data.detail);
        } else {
          // Use the status code to differentiate
          if (error.response.status === 409) {
            if (error.response.data.message.includes("Email")) {
              setErrors({ email: "Email already exists" });
            } else if (error.response.data.message.includes("Mobile")) {
              setErrors({ mobile: "Mobile number already exists" });
            } else {
              toast.error("Registration failed. Please try again.");
            }
          } else {
            // Use backend message if available
            toast.error(error.response.data.message || "Registration failed. Please try again.");
          }
        }
      } else {
        // This handles network errors and other issues
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <Row className="align-items-center justify-content-center g-0 min-vh-100">
        <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
          <Card className="smooth-shadow-md">
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
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="User Name"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {errors.username && <span className="text-danger">{errors.username}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter address here"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <span className="text-danger">{errors.email}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="mobile">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    placeholder="Enter Mobile Number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                  />
                  {errors.mobile && <span className="text-danger">{errors.mobile}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="**************"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  {errors.password && <span className="text-danger">{errors.password}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="**************"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && <span className="text-danger">{errors.confirmPassword}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="userRole">
                  <Form.Label>Select Role</Form.Label>
                  <Form.Select
                    name="userRole"
                    value={formData.userRole}
                    onChange={handleInputChange}
                  >
                    <option value="">Choose Role...</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </Form.Select>
                  {errors.userRole && <span className="text-danger">{errors.userRole}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="agreedToTerms">
                  <Form.Check
                    type="checkbox"
                    name="agreedToTerms"
                    label="I agree to the terms and conditions"
                    checked={formData.agreedToTerms}
                    onChange={handleInputChange}
                  />
                  {errors.agreedToTerms && <span className="text-danger">{errors.agreedToTerms}</span>}
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || !isSubmitEnabled}
                >
                  {isSubmitting ? "Submitting..." : "Sign Up"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

SignUp.Layout = AuthLayout;

export default SignUp;
