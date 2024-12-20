// import node module libraries
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMediaQuery } from 'react-responsive';
import {
    Row,
    Col,
    Image,
    Dropdown,
    ListGroup,
} from 'react-bootstrap';

// simple bar scrolling used for notification item scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// import data files
import NotificationList from 'data/Notification';

// import hooks
import useMounted from 'hooks/useMounted';

const QuickMenu = () => {

    const hasMounted = useMounted();
    const router = useRouter();
    const [userName, setUserName] = useState('');

    const isDesktop = useMediaQuery({
        query: '(min-width: 1224px)'
    });

    useEffect(() => {
        // Check for access and refresh tokens in local storage
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        // If tokens are missing, redirect to login page
        if (!accessToken || !refreshToken) {
            router.push('/login');
        } else {
            // Retrieve user_data if tokens are present
            const userData = JSON.parse(localStorage.getItem('user_data'));
            const name = userData?.name || 'User Name';
            setUserName(name);
        }
    }, [router]);

    const QuickMenuDesktop = () => {
        return (
            <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
                <Dropdown as="li" className="ms-2">
                    <Dropdown.Toggle
                        as="a"
                        bsPrefix=' '
                        className="rounded-circle"
                        id="dropdownUser">
                        <div className="avatar avatar-md avatar-indicators avatar-online">
                            <Image alt="avatar" src='/images/avatar/avatar-1.jpg' className="rounded-circle" />
                        </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                        className="dropdown-menu dropdown-menu-end "
                        align="end"
                        aria-labelledby="dropdownUser"
                        show
                    >
                        <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=' '>
                            <div className="lh-1">
                                <h5 className="mb-1">{userName}</h5>
                                <Link href="/me/profile" className="text-inherit fs-6">View my profile</Link>
                            </div>
                            <div className="dropdown-divider mt-3 mb-2"></div>
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="2">
                            <Link href="/me/profile" passHref legacyBehavior>
                                <a className="d-flex align-items-center">
                                    <i className="fe fe-user me-2"></i> Edit Profile
                                </a>
                            </Link>
                        </Dropdown.Item>

                        <Dropdown.Item eventKey="4">
                            <Link href="/me/changepassword" passHref legacyBehavior>
                                <a className="d-flex align-items-center">
                                    <i className="fe fe-settings me-2"></i> Change Password
                                </a>
                            </Link>
                        </Dropdown.Item>

                        <Dropdown.Item eventKey="5">
                            <Link href="/me/logout" passHref legacyBehavior>
                                <a className="d-flex align-items-center">
                                    <i className="fe fe-power me-2"></i> Sign Out
                                </a>
                            </Link>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </ListGroup>
        )
    }

    const QuickMenuMobile = () => {
        return (
            <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
                <Dropdown as="li" className="ms-2">
                    <Dropdown.Toggle
                        as="a"
                        bsPrefix=' '
                        className="rounded-circle"
                        id="dropdownUser">
                        <div className="avatar avatar-md avatar-indicators avatar-online">
                            <Image alt="avatar" src='/images/avatar/avatar-1.jpg' className="rounded-circle" />
                        </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                        className="dropdown-menu dropdown-menu-end "
                        align="end"
                        aria-labelledby="dropdownUser"
                    >
                        <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=' '>
                            <div className="lh-1">
                                <h5 className="mb-1">{userName}</h5>
                                <Link href="#" className="text-inherit fs-6">View my profile</Link>
                            </div>
                            <div className="dropdown-divider mt-3 mb-2"></div>
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="2">
                            <i className="fe fe-user me-2"></i> Edit Profile
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="3">
                            <i className="fe fe-activity me-2"></i> Activity Log
                        </Dropdown.Item>
                        <Dropdown.Item >
                            <i className="fe fe-settings me-2"></i> Change Password
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <i className="fe fe-power me-2"></i>Sign Out
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </ListGroup>
        )
    }

    return (
        <Fragment>
            {hasMounted && isDesktop ? <QuickMenuDesktop /> : <QuickMenuMobile />}
        </Fragment>
    )
}

export default QuickMenu;
