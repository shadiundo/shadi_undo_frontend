// src/components/layout/TopNavigationBar/index.jsx
import React, { lazy, Suspense } from 'react';
import ActivityStreamToggle from './components/ActivityStreamToggle';
import LeftSideBarToggle from './components/LeftSideBarToggle';
import ProfileDropdown from './components/ProfileDropdown';
import SearchBox from './components/SearchBox';
import ThemeCustomizerToggle from './components/ThemeCustomizerToggle';
import ThemeModeToggle from './components/ThemeModeToggle';

// Lazy-load heavier dropdowns
const AppsDropdown = lazy(() => import('./components/AppsDropdown'));
const Notifications = lazy(() => import('./components/Notifications'));

/**
 * Small visual fallback used for Suspense while lazy components load.
 */
const SmallPlaceholder = ({ ariaLabel = 'loading' }) => (
  <div aria-hidden style={{ width: 36, height: 36, display: 'inline-block' }} title={ariaLabel} />
);

const TopNavigationBar = () => {
  return (
    <header className="topbar">
      <div className="container-xxl">
        <div className="navbar-header">
          <div className="d-flex align-items-center gap-2">
            <div className="menu-side">

            <LeftSideBarToggle />
            </div>
            <SearchBox />
          </div>

          <div className="d-flex align-items-center gap-1">
            {/* Toggle Theme Mode */}
            <ThemeModeToggle />

            {/* Apps Dropdown (lazy) */}
            {/* <Suspense fallback={<SmallPlaceholder ariaLabel="Loading apps dropdown" />}>
              <AppsDropdown />
            </Suspense> */}

            {/* Notification Dropdown (lazy) */}
            <Suspense fallback={<SmallPlaceholder ariaLabel="Loading notifications" />}>
              <Notifications />
            </Suspense>

            {/* Toggle for Theme Customizer */}
            <div className="theme-customizer-toggle">
  <ThemeCustomizerToggle />
</div>


            {/* Toggle for Activity Stream */}
            <ActivityStreamToggle />

            {/* Admin Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigationBar;
