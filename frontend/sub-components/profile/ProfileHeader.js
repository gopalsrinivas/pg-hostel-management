import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Col, Row, Image, Modal, Button, Form } from 'react-bootstrap';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";

const ProfileHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    email: '',
    mobile: '',
    profileImage: null,
  });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      router.push('/');
    } else {
      const parsedData = JSON.parse(userData);
      setProfileData({
        ...parsedData,
        bio: parsedData.bio || '',
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileData({ ...profileData, profileImage: file });
  };

  const handleSaveChanges = async () => {
    if (!profileData.name || !profileData.bio) {
      toast.error('Please fill in all fields'); // Use toast for error
      return;
    }

    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('bio', profileData.bio);
    formData.append('email', profileData.email);
    formData.append('mobile', profileData.mobile);
    formData.append('is_active', true);
    if (profileData.profileImage) {
      formData.append('profileImage', profileData.profileImage);
    }

    try {
      const access_token = localStorage.getItem('access_token');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/update_me/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status !== 200) throw new Error('Failed to update profile');

      // Update user_data in localStorage
      const existingUserData = JSON.parse(localStorage.getItem('user_data')) || {};
      const updatedUserData = { ...existingUserData, ...profileData };
      localStorage.setItem('user_data', JSON.stringify(updatedUserData));

      toast.success('Profile updated successfully');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message); // Use toast for error
    }
  };

  return (
    <>
      <Toaster />
      <Row className="align-items-center">
        <Col xl={12} lg={12} md={12} xs={12}>
          <div
            className="pt-20 rounded-top"
            style={{
              background: 'url(/images/background/profile-cover.jpg) no-repeat',
              backgroundSize: 'cover',
            }}
          ></div>
          <div className="bg-white rounded-bottom smooth-shadow-sm">
            <div className="d-flex align-items-center justify-content-between pt-4 pb-6 px-4">
              <div className="d-flex align-items-center">
                <div className="avatar-xxl avatar-indicators avatar-online me-2 position-relative d-flex justify-content-end align-items-end mt-n10">
                  <Image
                    src=""
                    className="avatar-xxl rounded-circle border border-4 border-white-color-40"
                    alt=""
                  />
                  <Link
                    href="#!"
                    className="position-absolute top-0 right-0 me-2"
                    data-bs-toggle="tooltip"
                    data-placement="top"
                    title="Verified"
                  >
                    <Image
                      src="/images/svg/checked-mark.svg"
                      alt=""
                      height="30"
                      width="30"
                    />
                  </Link>
                </div>
                <div className="lh-1">
                  <h2 className="mb-0">{profileData.name}</h2>
                  <p className="mb-0 d-block">@{profileData.email}</p>
                </div>
              </div>
              <div>
                <Button
                  variant="outline-primary"
                  className="d-none d-md-block"
                  onClick={() => setShowModal(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
            <ul className="nav nav-lt-tab px-4" id="pills-tab" role="tablist">
              <li className="nav-item">
                <Link className="nav-link active" href="#">
                  Overview
                </Link>
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProfileImage">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control
                type="file"
                name="profileImage"
                onChange={handleImageChange}
                accept="image/*"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                isInvalid={!profileData.name}
              />
              <Form.Control.Feedback type="invalid">
                Full Name is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                value={profileData.bio || ''}
                onChange={handleInputChange}
                rows={3}
                isInvalid={!profileData.bio}
              />
              <Form.Control.Feedback type="invalid">
                Bio is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobile"
                value={profileData.mobile}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileHeader;
