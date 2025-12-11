'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CameraIcon, LucideIcon } from 'lucide-react';
import {
  MessageCircle,
  Calendar,
  Clock,
  Users,
  UserCheck,
  Settings,
  Wifi,
  ClipboardList,
  Info,
  Mic2,
  GraduationCap,
  MapPin,
  Bell,
  Bookmark,
  QrCode,
  X,
  LogOut,
  Monitor
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from '../styles/HomeScreen.module.css';
import { useEffect } from 'react';

interface AppItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    company?: string;
    [key: string]: any;
  };
}

interface Event {
  id?: string;
  name: string;
  date: string;
  code?: string;
  description?: string;
  venue?: string;
  organizerEmail?: string;
  liveSettings?: {
    [key: string]: 'active' | 'coming_soon' | 'disabled';
  };
  venueMapHtml?: string;
  travelInfoHtml?: string;
  hotelsNearbyHtml?: string;
}

interface HomeScreenProps {
  eventName?: string;
  eventDate?: string;
  initialUser?: User | null;
  initialEvent?: Event | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  eventName = "Event Name", 
  eventDate = "Date",
  initialUser = null,
  initialEvent = null
}) => {
  const { eventCode } = useParams();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [event, setEvent] = useState<Event | null>(initialEvent || {
    name: eventName,
    date: eventDate,
    code: eventCode as string
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch user role if user is logged in
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        console.log('Fetched user role:', profile?.role);
        setUserRole(profile?.role || null);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // Fetch role when auth state changes
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dynamic active app items based on user login status, role, and event settings
  const getActiveAppItems = (): AppItem[] => {
    const items: AppItem[] = [];
    const settings = event?.liveSettings || {};
    
    // Helper to check if feature is active
    const isActive = (key: string) => settings[key] === 'active' || !settings[key];
    
    // QR Code - only for logged in users and if enabled
    if (user && isActive('qr')) {
      items.push({
        id: 'qr',
        name: 'My QR',
        icon: QrCode,
        path: `${eventCode}/qr-code`,
        color: '#26C6DA'
      });
    }
    
    // Kiosks Live - only for ADMIN users and if enabled
    if (user && userRole === 'ADMIN' && isActive('kiosksLive')) {
      items.push({
        id: 'kiosks-live',
        name: 'Kiosks Live',
        icon: Monitor,
        path: `${eventCode}/kiosks-live`,
        color: '#FF9800'
      });
    }
    
    // Common items - only add if active
    if (isActive('agenda')) {
      items.push({
        id: 'agenda',
        name: 'Agenda',
        icon: ClipboardList,
        path: `${eventCode}/agenda`,
        color: '#FF5722'
      });
    }
    
    if (isActive('schedule')) {
      items.push({
        id: 'schedule',
        name: 'Schedule',
        icon: Calendar,
        path: `${eventCode}/schedule`,
        color: '#2196F3'
      });
    }
    
    if (isActive('photobooth')) {
      items.push({
        id: 'photobooth',
        name: 'Photobooth',
        icon: CameraIcon,
        path: `${eventCode}/photobooth`,
        color: '#607D8B'
      });
    }
    
    if (isActive('organizers')) {
      items.push({
        id: 'organizers',
        name: 'Organizers',
        icon: Users,
        path: `${eventCode}/organizer`,
        color: '#4CAF50'
      });
    }
    
    if (isActive('about')) {
      items.push({
        id: 'about',
        name: 'About',
        icon: Info,
        path: `${eventCode}/about`,
        color: '#667eea'
      });
    }
    
    if (isActive('venueMap')) {
      items.push({
        id: 'venueMap',
        name: 'Venue Map',
        icon: MapPin,
        path: `${eventCode}/venue-map`,
        color: '#66BB6A'
      });
    }
    
    if (isActive('travelInfo')) {
      items.push({
        id: 'travelInfo',
        name: 'Travel Info',
        icon: Bookmark,
        path: `${eventCode}/travel-info`,
        color: '#42A5F5'
      });
    }
    
    if (isActive('hotelsNearby')) {
      items.push({
        id: 'hotelsNearby',
        name: 'Hotels Nearby',
        icon: Bookmark,
        path: `${eventCode}/hotels-nearby`,
        color: '#FFA726'
      });
    }
    
    return items;
  };

  // Get coming soon items based on event settings
  const getComingSoonItems = (): AppItem[] => {
    const items: AppItem[] = [];
    const settings = event?.liveSettings || {};
    
    // Helper to check if feature is coming soon
    const isComingSoon = (key: string) => settings[key] === 'coming_soon';
    
    if (isComingSoon('networking')) {
      items.push({
        id: 'networking',
        name: 'Networking',
        icon: Wifi,
        path: `${eventCode}/networking`,
        color: '#9C27B0'
      });
    }
    
    if (isComingSoon('chat')) {
      items.push({
        id: 'chat',
        name: 'Chat',
        icon: MessageCircle,
        path: `${eventCode}/chat`,
        color: '#4CAF50'
      });
    }
    
    if (isComingSoon('venueMap')) {
      items.push({
        id: 'venueMap',
        name: 'Venue Map',
        icon: MapPin,
        path: `${eventCode}/venue-map`,
        color: '#66BB6A'
      });
    }
    
    if (isComingSoon('travelInfo')) {
      items.push({
        id: 'travelInfo',
        name: 'Travel Info',
        icon: Bookmark,
        path: `${eventCode}/travel-info`,
        color: '#42A5F5'
      });
    }
    
    if (isComingSoon('hotelsNearby')) {
      items.push({
        id: 'hotelsNearby',
        name: 'Hotels Nearby',
        icon: Bookmark,
        path: `${eventCode}/hotels-nearby`,
        color: '#FFA726'
      });
    }
    
    if (isComingSoon('notifications')) {
      items.push({
        id: 'notifications',
        name: 'Updates',
        icon: Bell,
        path: `${eventCode}/notifications`,
        color: '#42A5F5'
      });
    }
    
    return items;
  };

  const activeAppItems = getActiveAppItems();
  const comingSoonItems = getComingSoonItems();

  const handleNavigation = (path: string) => {
    if (navigating) return;
    
    setNavigating(true);
    // Small delay to show the tap animation
    setTimeout(() => {
      // Pass user and event data via URL state or localStorage for now
      if (user && event) {
        sessionStorage.setItem('evynte_user', JSON.stringify(user));
        sessionStorage.setItem('evynte_event', JSON.stringify(event));
      }
      router.push(path);
    }, 150);
  };  const handleLoginClick = () => {
    if (user) {
      // Logic to logout
      handleLogout();
    } else {
      setIsLoginModalOpen(true);
      setAuthStep('email');
      setAuthError(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  }

  const handleModalClose = () => {
    setIsLoginModalOpen(false);
    setLoginEmail('');
    setOtp('');
    setAuthStep('email');
    setAuthError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      // 1. Check registration table if possible (Optional based on RLS, skipping explicit check for now to rely on Auth logic or post-check)
      // Actually, user requested: "Once attendee enters otp, should verify in registration table"

      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
      });

      if (error) throw error;

      setAuthStep('otp');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: loginEmail,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      // Verify in registration table
      // Assuming 'registrations' table has 'email' column.
      // We need to handle RLS. If RLS blocks read, this will fail.
      // Trying to select.  
      const { data: registrationData, error: registrationError } = await supabase
        .from('event_user_registrations')
        .select('id')
        .eq('email_address', loginEmail)
        .eq('event_id', event.id)
        .limit(1)
        .maybeSingle();

      // If table doesn't exist or RLS blocks, this might error. 
      // If registrationError is "PGRST116" (JSON object requested, multiple (or no) rows returned), it means not found (if .single())

      if (registrationError || !registrationData) {
        // If error is not "no rows found", it might be permission.
        // But per requirements, we should verify. 
        // If we can't verify, we might want to assume valid or fail.
        // Let's assume strict verification as requested.
        if (registrationError && registrationError.code !== 'PGRST116') {
          console.error('Registration check error:', registrationError);
          // Proceed with caution or fail? Let's fail for safety if explicit requirement.
          // But if table missing, we block everyone. 
          // Logic: If user is authenticated, Supabase session is active.
        }

        if (!registrationData) {
          await supabase.auth.signOut();
          throw new Error('Email not found in registration list.');
        }
      }

      setUser(data.user);
      setIsLoginModalOpen(false);
      // Session established
    } catch (err: any) {
      setAuthError(err.message || 'Failed to verify OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.loginButton} onClick={handleLoginClick}>
          {user ? 'Logout' : 'Login'}
        </button>
        <div className={styles.logoWrapper}>
          <Image
            src="/assets/evynte_logo.png"
            alt="Evynte Logo"
            width={150}
            height={40}
            className={styles.logo}
            priority
          />
        </div>
        <h1 className={styles.eventName}>{eventName}</h1>
        <p className={styles.eventDate}>{eventDate}</p>
      </div>

      <div className={styles.appGrid}>
        {activeAppItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={styles.appItem}
              onClick={() => handleNavigation(item.path)}
              style={{ '--app-color': item.color } as React.CSSProperties}
            >
              <div className={styles.iconWrapper}>
                <Icon className={styles.icon} size={32} />
              </div>
              <span className={styles.appName}>{item.name}</span>
            </button>
          );
        })}
      </div>

      {comingSoonItems.length > 0 && (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerText}>Coming Soon</span>
          </div>

          <div className={styles.appGrid}>
            {comingSoonItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.appItem} ${styles.appItemDisabled}`}
                  onClick={() => handleNavigation(item.path)}
                  style={{ '--app-color': item.color } as React.CSSProperties}
                >
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} size={32} />
                  </div>
                  <span className={styles.appName}>{item.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className={styles.footer}>
        <p>&nbsp;</p>
      </div>

      {isLoginModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleModalClose}>
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>
              {authStep === 'email' ? 'Login' : 'Enter OTP'}
            </h2>

            {authStep === 'email' ? (
              <form onSubmit={handleEmailSubmit}>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={authLoading}
                >
                  {authLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div className={styles.successMessage}>
                  OTP sent to {loginEmail}
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={authLoading}
                >
                  {authLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>
            )}

            {authError && (
              <div className={styles.errorMessage}>
                {authError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
