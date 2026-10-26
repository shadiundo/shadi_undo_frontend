// src/components/layout/TopNavigationBar/components/ProfileDropdown.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import avatar1 from '@/assets/images/shadiundo.png';
import { useAuthContext } from '../../../../context/useAuthContext'; // adjust path if needed

const ProfileDropdown = () => {
  const { removeSession, user } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // 🔹 1) Remove auth session (clears cookie and updates context)
      removeSession();

      // 🔹 2) Remove any leftover tokens (optional but safe)
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('adminToken');

      // 🔹 3) Redirect to sign-in page
      navigate('/auth/sign-in', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/auth/sign-in', { replace: true });
    }
  };

  return (
    <Dropdown className="topbar-item" align="end">
      <DropdownToggle
        as="button"
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="d-flex align-items-center">
          <img
            className="rounded-circle border"
            width={50}
            height={50}
            src={avatar1}
            alt="avatar"
          />
        </span>
      </DropdownToggle>

      <DropdownMenu>
        <DropdownHeader as="h6">Welcome {user?.name || 'Admin'}!</DropdownHeader>

        {/* <DropdownItem as={Link} to="/pages/profile">
          <IconifyIcon icon="bx:user-circle" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Profile</span>
        </DropdownItem> */}

        <DropdownItem as={Link} to="/auth/lock-screen">
          <IconifyIcon icon="bx:lock" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Lock screen</span>
        </DropdownItem>

        <DropdownDivider className="dropdown-divider my-1" />

        {/* 🔴 Logout triggers removeSession */}
        <DropdownItem as="button" className="text-danger" onClick={handleLogout}>
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
