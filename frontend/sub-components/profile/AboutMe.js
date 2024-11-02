// import node module libraries
import { Col, Row, Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from Next.js

const AboutMe = () => {
    const router = useRouter(); // Initialize router
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        mobile: '',
        email: '',
        position: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            setProfileData(JSON.parse(userData));
        } else {
            // Redirect if no userData is found
            router.push('/');
        }
    }, [router]); // Add router to dependency array

    return (
        <Col xl={12} lg={12} md={12} xs={12} className="mb-6">
            {/* card */}
            <Card>
                {/* card body */}
                <Card.Body>
                    {/* card title */}
                    <Card.Title as="h4">About Me</Card.Title>
                    <span className="text-uppercase fw-medium text-dark fs-5 ls-2">Bio</span>
                    <p className="mt-2 mb-6">{profileData.bio || 'No bio available'}</p>
                    <Row>
                        <Col xs={12} className="mb-5">
                            <h6 className="text-uppercase fs-5 ls-2">Position</h6>
                            <p className="mb-0">{profileData.user_role || 'Not specified'}</p>
                        </Col>
                        <Col xs={6} className="mb-5">
                            <h6 className="text-uppercase fs-5 ls-2">Phone</h6>
                            <p className="mb-0">{profileData.mobile || 'Not provided'}</p>
                        </Col>
                        <Col xs={6}>
                            <h6 className="text-uppercase fs-5 ls-2">Email</h6>
                            <p className="mb-0">{profileData.email || 'Not provided'}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    );
}

export default AboutMe;
