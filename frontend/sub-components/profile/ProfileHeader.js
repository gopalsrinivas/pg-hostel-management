import React, { useState } from 'react';
import Link from 'next/link';
import { Col, Row, Image, Modal, Button, Form } from 'react-bootstrap';

const ProfileHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Jitu Chauhan',
    bio: '',
    email: 'jituchauhan@example.com',
    mobile: '123-456-7890',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file });
  };

  
  const handleSaveChanges = () => {
    // Save the changes to the profile
    setShowModal(false);
  };

  return (
    <>
      <Row className="align-items-center">
        <Col xl={12} lg={12} md={12} xs={12}>
          {/* Bg */}
          <div
            className="pt-20 rounded-top"
            style={{
              background: 'url(/images/background/profile-cover.jpg) no-repeat',
              backgroundSize: 'cover',
            }}
          ></div>
          <div className="bg-white rounded-bottom smooth-shadow-sm ">
            <div className="d-flex align-items-center justify-content-between pt-4 pb-6 px-4">
              <div className="d-flex align-items-center">
                {/* avatar */}
                <div className="avatar-xxl avatar-indicators avatar-online me-2 position-relative d-flex justify-content-end align-items-end mt-n10">
                  <Image
                    src="/images/avatar/avatar-1.jpg"
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
                {/* text */}
                <div className="lh-1">
                  <h2 className="mb-0">
                    {profileData.fullName}
                    <Link
                      href="#!"
                      className="text-decoration-none"
                      data-bs-toggle="tooltip"
                      data-placement="top"
                      title="Beginner"
                    ></Link>
                  </h2>
                  <p className="mb-0 d-block">@imjituchauhan</p>
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
            {/* nav */}
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

      {/* Modal for editing profile */}
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
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={3}
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
