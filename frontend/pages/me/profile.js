// import node module libraries
import { Col, Row, Container } from 'react-bootstrap';

// import widget as custom components
import { PageHeading } from 'widgets';

// import sub components
import { AboutMe, ProfileHeader } from 'sub-components';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";

const Profile = () => {
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        mobile: '',
        email: '',
        position: '',
        profile_image: '',
        user_role: '',
    });

    const fetchProfileData = async () => {
        try {
            const access_token = localStorage.getItem('access_token');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/me/`,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                    },
                }
            );

            if (response.data.status === "success") {
                const { data } = response.data;
                setProfileData({
                    name: data.name,
                    bio: data.bio,
                    mobile: data.mobile,
                    email: data.email,
                    user_role: data.user_role,
                    profile_image: data.profile_image,
                });
            } else {
                toast.error('Failed to fetch profile data');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast.error('Failed to fetch profile data');
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    return (
        <Container fluid className="p-6">
            <PageHeading heading="Overview" />
            <ProfileHeader profileData={profileData} setProfileData={setProfileData} />
            {/* content */}
            <div className="py-6">
                <Row>
                    <AboutMe profileData={profileData} />
                </Row>
            </div>
        </Container>
    );
};

export default Profile;
