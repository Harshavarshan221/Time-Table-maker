import { Calendar, LogOut, LogIn, CloudCheck } from 'lucide-react';
import { ViewSwitcher, type AppView } from './ViewSwitcher';
import type { User } from 'firebase/auth';

interface GlobalNavigationProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const GlobalNavigation: React.FC<GlobalNavigationProps> = ({
  activeView,
  onViewChange,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  return (
    <header className="app-header">
      {/* Brand Logo & Application Title */}
      <div className="header-brand">
        <div className="brand-logo">
          <Calendar className="logo-icon" />
        </div>
        <div>
          <h1 className="brand-title">Weekly Timetable</h1>
          <p className="brand-subtitle">Effortless study & task planner</p>
        </div>
      </div>

      {/* Global Navigation Tabs (Home | Timetable | Analytics) */}
      <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />

      {/* User Account / Sign In Actions */}
      <div className="header-right-actions">
        {currentUser ? (
          <div className="user-profile-badge">
            <div className="user-avatar">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
              ) : (
                <span>{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}</span>
              )}
            </div>
            <div className="user-info-text">
              <span className="user-name">{currentUser.displayName || currentUser.email}</span>
              {currentUser.displayName && currentUser.email && (
                <span className="user-email-sub">{currentUser.email}</span>
              )}
              <span className="cloud-status">
                <CloudCheck className="icon-nano" /> Cloud Synced
              </span>
            </div>
            <button
              type="button"
              className="btn-signout"
              onClick={onSignOut}
              title="Sign Out"
            >
              <LogOut className="icon-xs" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-auth-signin"
            onClick={onOpenAuthModal}
          >
            <LogIn className="icon-xs" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
