// import node module libraries
import { Col, Row, Container } from 'react-bootstrap';

// import widget as custom components
import { PageHeading } from 'widgets'

// import sub components
import {
    AboutMe,
    ProfileHeader,
} from 'sub-components'

const Profile = () => {
    return (
        <Container fluid className="p-6">
            <PageHeading heading="Overview" />
            <ProfileHeader />
            {/* content */}
            <div className="py-6">
                <Row>
                    <AboutMe />
                </Row>
            </div>
        </Container>
    )
}

export default Profile