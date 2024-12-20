import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Col, Row, Image, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";

const ProfileHeader = ({ profileData, setProfileData }) => {
  const [showModal, setShowModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
  };

  const handleSaveChanges = async () => {
    if (!profileData.name || !profileData.bio) {
      toast.error('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('bio', profileData.bio);
    formData.append('email', profileData.email);
    formData.append('mobile', profileData.mobile);
    formData.append('is_active', true);
    if (profileImage) {
      formData.append('profile_image', profileImage);
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

      if (response.status === 200) {
        const updatedData = response.data.data;

        // Update profileData with the new data
        setProfileData(prevData => ({
          ...prevData,
          name: updatedData.name,
          bio: updatedData.bio,
          email: updatedData.email,
          mobile: updatedData.mobile,
          profile_image: updatedData.profile_image || prevData.profile_image,
        }));

        // Clear existing user data
        localStorage.removeItem('user_data');

        // Update with new profile data
        localStorage.setItem('user_data', JSON.stringify(updatedData));

        toast.success('Profile updated successfully');
        setShowModal(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
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
                    src={profileData.profile_image || '/images/default-profile.jpg'}
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
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                required
              />
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
              <Form.Label>Mobile</Form.Label>
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
