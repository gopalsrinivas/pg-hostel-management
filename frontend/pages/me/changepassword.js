import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { Toaster, toast } from 'react-hot-toast';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Function to refresh access token
    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            throw new Error("No refresh token available. Please log in again.");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/token/refresh?refresh_token=${refreshToken}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (response.ok) {
            // Save the new access token
            localStorage.setItem("access_token", data.access_token);
            return data.access_token;
        } else {
            throw new Error(data.message || "Failed to refresh token. Please log in again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form inputs
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            return;
        }

        try {
            let token = localStorage.getItem("access_token");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/change-password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: oldPassword,
                    new_password: newPassword,
                    confirm_new_password: confirmPassword,
                }),
            });

            if (response.status === 401) {
                // If the token is expired, refresh it and retry the request
                try {
                    token = await refreshAccessToken();

                    // Retry the request with the new token
                    const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/change-password/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            current_password: oldPassword,
                            new_password: newPassword,
                            confirm_new_password: confirmPassword,
                        }),
                    });

                    const retryData = await retryResponse.json();

                    if (!retryResponse.ok) {
                        toast.error(retryData.msg || "Failed to change password. Please try again.");
                        return;
                    }

                    // Display success message on successful password change
                    toast.success(retryData.msg || "Password changed successfully.");

                    // Clear fields and checkboxes
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowOldPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);

                } catch (refreshError) {
                    toast.error(refreshError.message || "Token has expired. Please log in again.");
                }
            } else {
                const responseData = await response.json();
                if (!response.ok) {
                    toast.error(responseData.msg || "Failed to change password. Please try again.");
                    return;
                }

                // Display success message on successful password change
                toast.success(responseData.msg || "Password changed successfully.");

                // Clear fields and checkboxes
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            }

        } catch (err) {
            toast.error(err.message || "An error occurred. Please try again.");
        }
    };

    return (
        <>
            <Toaster />
            <Container fluid className="p-6">
                <Row className="justify-content-center mt-5">
                    <Col md={6}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h3 className="text-center mb-4">Change Password</h3>

                                <Form onSubmit={handleSubmit}>
                                    {/* Old Password */}
                                    <Form.Group className="mb-3" controlId="oldPassword">
                                        <Form.Label>Old Password</Form.Label>
                                        <Form.Control
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="Enter your old password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Show Old Password"
                                            checked={showOldPassword}
                                            onChange={() => setShowOldPassword(!showOldPassword)}
                                        />
                                    </Form.Group>

                                    {/* New Password */}
                                    <Form.Group className="mb-3" controlId="newPassword">
                                        <Form.Label>New Password</Form.Label>
                                        <Form.Control
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter your new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Show New Password"
                                            checked={showNewPassword}
                                            onChange={() => setShowNewPassword(!showNewPassword)}
                                        />
                                    </Form.Group>

                                    {/* Confirm Password */}
                                    <Form.Group className="mb-3" controlId="confirmPassword">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Show Confirm Password"
                                            checked={showConfirmPassword}
                                            onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                                        />
                                    </Form.Group>

                                    {/* Submit Button */}
                                    <div className="d-grid">
                                        <Button variant="primary" type="submit">
                                            Change Password
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ChangePassword;
