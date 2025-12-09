'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, Monitor } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './KiosksLive.module.css';

interface KioskScanType {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

interface KioskCheckIn {
  id: string;
  user_id: string;
  scan_type_id: string;
  timestamp: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export default function KiosksLivePage() {
  const router = useRouter();
  const { eventCode } = useParams();
  const [kioskTypes, setKioskTypes] = useState<KioskScanType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<KioskCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchKioskTypes();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedType) {
      fetchCheckIns(selectedType);
      
      // Set up real-time subscription
      const channel = supabase
        .channel('kiosk-checkins')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'kiosk_checkins',
            filter: `scan_type_id=eq.${selectedType}`,
          },
          (payload) => {
            setCheckIns((prev) => [payload.new as KioskCheckIn, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedType]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${eventCode}`);
        return;
      }

      // Check if user has ADMIN role
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || profile?.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        setTimeout(() => router.push(`/${eventCode}`), 2000);
        return;
      }

      setIsAdmin(true);
    } catch (err) {
      console.error('Error checking admin access:', err);
      setError('Failed to verify access permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchKioskTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('kiosk_scan_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setKioskTypes(data || []);
    } catch (err) {
      console.error('Error fetching kiosk types:', err);
      setError('Failed to load kiosk types');
    }
  };

  const fetchCheckIns = async (typeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kiosk_checkins')
        .select(`
          *,
          user:user_profiles(name, email)
        `)
        .eq('scan_type_id', typeId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCheckIns(data || []);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      setError('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedType) {
      fetchCheckIns(selectedType);
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Verifying access...</div>
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Kiosks Live</h1>
        {selectedType && (
          <button onClick={handleRefresh} className={styles.refreshButton}>
            <RefreshCw size={20} />
          </button>
        )}
      </div>

      {!selectedType ? (
        <div className={styles.typeSelection}>
          <h2 className={styles.subtitle}>Select Kiosk Type</h2>
          <div className={styles.typeGrid}>
            {kioskTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={styles.typeCard}
              >
                <Monitor size={32} className={styles.typeIcon} />
                <h3 className={styles.typeName}>{type.name}</h3>
                {type.description && (
                  <p className={styles.typeDescription}>{type.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.checkInsContainer}>
          <div className={styles.checkInsHeader}>
            <h2 className={styles.subtitle}>
              {kioskTypes.find((t) => t.id === selectedType)?.name} - Live Check-ins
            </h2>
            <button
              onClick={() => setSelectedType(null)}
              className={styles.changeTypeButton}
            >
              Change Type
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading check-ins...</div>
          ) : checkIns.length === 0 ? (
            <div className={styles.emptyState}>
              <Monitor size={48} className={styles.emptyIcon} />
              <p>No check-ins yet. Waiting for scans...</p>
            </div>
          ) : (
            <div className={styles.checkInsList}>
              {checkIns.map((checkIn) => (
                <div key={checkIn.id} className={styles.checkInCard}>
                  <div className={styles.checkInInfo}>
                    <h3 className={styles.userName}>
                      {checkIn.user?.name || 'Unknown User'}
                    </h3>
                    <p className={styles.userEmail}>{checkIn.user?.email}</p>
                  </div>
                  <div className={styles.checkInTime}>
                    {new Date(checkIn.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
