import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const accessToken = localStorage.getItem('access_token'); // Fetch the access token from local storage

        if (!accessToken) {
          console.error('No access token found. Redirecting to login page.');
          router.push('/');
          return;
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/newuserregister/logout/`,
          {}, // Empty body for POST request
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Check if the response was successful
        if (response.status === 200) {
          console.log('Logged out successfully:', response.data);

          // Clear the tokens and user data from local storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');

          // Redirect to the login page
          router.push('/');
        } else {
          console.error('Logout failed:', response.data);
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
    handleLogout();
  }, [router]);

  return null;
};

export default Logout;
