import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add password change logic here
        if (newPassword === confirmPassword) {
            console.log("Password change request submitted.");
        } else {
            console.log("New passwords do not match.");
        }
    };

    return (
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
                                        type="password"
                                        placeholder="Enter your old password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                {/* New Password */}
                                <Form.Group className="mb-3" controlId="newPassword">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                {/* Confirm Password */}
                                <Form.Group className="mb-3" controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
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
    );
};

export default ChangePassword;
