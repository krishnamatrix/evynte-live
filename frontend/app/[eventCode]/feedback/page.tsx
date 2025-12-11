'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PaperPlaneRight, CheckCircle, Download } from '@phosphor-icons/react';
import { useEvent } from '@/contexts/EventContext';
import { supabase } from '@/lib/supabaseClient';
import { useForm, FormProvider } from 'react-hook-form';
import { CustomFieldRenderer } from '@/components/custom-field-renderer';
import styles from '@/styles/PlaceholderPage.module.css';

export default function FeedbackPage() {
  const router = useRouter();
  const { eventId, eventCode } = useEvent();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {}
  });

  const { handleSubmit, control, formState: { errors } } = methods;

  useEffect(() => {
    fetchFeedbackForm();
    checkUser();
  }, [eventId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchFeedbackForm = async () => {
    try {
      if (!eventId) {
        console.error('No event ID available');
        setLoading(false);
        return;
      }

      // Fetch feedback form for this event
      const { data: formData, error: formError } = await supabase
        .from('event_feedback_forms')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single();

      if (formError) {
        console.error('Error fetching feedback form:', formError);
        setLoading(false);
        return;
      }

      if (formData) {
        setFeedbackForm(formData);
      }
    } catch (err) {
      console.error('Error loading feedback form:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      // Get fields array
      let fields = feedbackForm.form_fields || [];
      if (typeof fields === 'string') {
        fields = JSON.parse(fields);
      }
      
      // Transform form data into structured responses
      const fieldResponses = fields.map((field: any, index: number) => {
        const fieldName = `field_${field.id || index}`;
        const value = formData[fieldName];
        
        return {
          feedbackFieldId: field.id || `field_${index}`,
          question: field.question || '',
          label: field.label || '',
          value: value !== undefined && value !== null ? value : ''
        };
      });

      console.log('Structured field responses:', fieldResponses);

      // Save feedback response with user_id
      const { error: saveError } = await supabase
        .from('event_feedback_responses')
        .insert({
          event_id: eventId,
          feedback_form_id: feedbackForm.id,
          user_id: user?.id || null,
          field_responses: fieldResponses,
          created_at: new Date().toISOString()
        });

      if (saveError) {
        console.error('Error saving feedback:', saveError);
        alert('Failed to submit feedback. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Feedback</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Feedback</h1>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'rgba(30, 27, 75, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            color: 'white'
          }}>
            <CheckCircle size={64} style={{ color: '#4CAF50', marginBottom: '20px' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Thank You!</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Your feedback has been submitted successfully.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', width: '100%' }}>
              <button
                onClick={() => router.push(`/${eventCode}/certificate`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#45a049'}
                onMouseOut={(e) => e.currentTarget.style.background = '#4CAF50'}
              >
                <Download size={20} />
                Download Certificate
              </button>
              
              <button
                onClick={() => router.back()}
                style={{
                  padding: '12px 24px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#7c3aed'}
                onMouseOut={(e) => e.currentTarget.style.background = '#8b5cf6'}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedbackForm) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Feedback</h1>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'rgba(30, 27, 75, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '20px'
          }}>
            No feedback form available at this time.
          </div>
        </div>
      </div>
    );
  }

  // Ensure fields is an array
  let fields = feedbackForm.form_fields || [];
  
  // If form_fields is a string (JSON), parse it
  if (typeof fields === 'string') {
    try {
      fields = JSON.parse(fields);
    } catch (e) {
      console.error('Error parsing form_fields:', e);
      fields = [];
    }
  }
  
  // Ensure it's an array
  if (!Array.isArray(fields)) {
    console.error('form_fields is not an array:', fields);
    fields = [];
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>{feedbackForm.form_name || 'Feedback'}</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        <FormProvider {...methods}>
          <form 
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
          >
            <div
              style={{
                background: 'rgba(30, 27, 75, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '20px',
                padding: '30px',
                color: 'white'
              }}
            >
              {feedbackForm.form_description && (
                <p style={{ 
                  marginBottom: '30px', 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px'
                }}>
                  {feedbackForm.form_description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {fields.map((field: any, index: number) => (
                  <div key={field.id || index}>
                    <CustomFieldRenderer
                      field={field}
                      control={control}
                      fieldName={`field_${field.id || index}`}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '30px',
                  width: '100%',
                  padding: '14px',
                  background: submitting ? '#666' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {submitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <PaperPlaneRight size={20} />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
