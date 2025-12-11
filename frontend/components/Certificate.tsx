'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, Medal } from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Box } from '@mui/system';
import Image from 'next/image';

interface CertificateData {
  id: string | null;
  certificate_title: string;
  certificate_subtitle: string;
  participant_name: string;
  participation_text: string;
  event_name: string;
  date: string;
  signature: string | null;
  event_id: string;
}

interface CertificateProps {
  eventId: string;
  userId?: string;
}

export default function Certificate({ eventId, userId }: CertificateProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCertificate();
  }, [eventId, userId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('event_certificates')
        .select('*')
        .eq('event_id', eventId);

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching certificate:', error);
        return;
      }

      setCertificate(data);
    } catch (err) {
      console.error('Error loading certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current || !certificate) return;

    try {
      setDownloading(true);

      // Capture the certificate HTML as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Download PDF
      const fileName = `${certificate.participant_name.replace(/\s+/g, '_')}_Certificate.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: 'white'
      }}>
        Loading certificate...
      </div>
    );
  }

  if (!certificate) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        padding: '20px'
      }}>
        <Medal size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>No Certificate Available</h3>
        <p>Your certificate has not been generated yet.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      gap: '30px'
    }}>
      {/* Download Button */}
      <button
        onClick={downloadCertificate}
        disabled={downloading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 28px',
          background: downloading ? '#666' : '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: downloading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        }}
      >
        <Download size={20} />
        {downloading ? 'Generating PDF...' : 'Download Certificate'}
      </button>

      {/* Certificate Preview */}
      <Box
        ref={certificateRef}
        key={certificate.id}
        sx={{
          width: "400px",
          height: "300px",
          border: "5px solid #2c3e50",
          padding: "20px",
          borderRadius: "10px",
          background: "#f7f7f7",
          textAlign: "center",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "5px 5px 10px rgba(0,0,0,0.2)",
        }}
      >
        {/* Badge */}
        <Box
          sx={{
            position: "absolute",
            top: "5px",
            left: "5px",
            color: "white",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg width="75" height="75" viewBox="0 0 256 256">
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFB700" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
            <Medal size={200} fill="url(#gold-gradient)" />
          </svg>
          {/* Certificate Title */}
          <Box sx={{ fontSize: "16px", fontWeight: "bold", marginBottom: "5px", color: "#333" }}>
            {certificate.certificate_title}
          </Box>
        </Box>

        {/* Subtitle */}
        <Box sx={{ fontSize: "12px", fontStyle: "italic", marginBottom: "10px" }}>
          {certificate.certificate_subtitle}
        </Box>

        {/* Participant Name */}
        <Box sx={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
          {certificate.participant_name}
        </Box>

        {/* Participation Text */}
        <Box sx={{ fontSize: "12px", marginBottom: "5px" }}>
          {certificate.participation_text}
        </Box>

        {/* Event Name */}
        <Box sx={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
          {certificate.event_name}
        </Box>

        {/* Date */}
        <Box sx={{ fontSize: "12px", position: "absolute", bottom: "10px", right: "10px" }}>
          {certificate.date}
        </Box>

        {/* Signature */}
        {certificate.signature && (
          <Image src={certificate.signature} alt="Signature" layout="responsive" width={100} height={100} style={{
            maxWidth: "100px",
            maxHeight: "30px",
            position: "absolute",
            bottom: "10px",
            left: "10px"
          }} />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>

        </Box>
      </Box>
    </div>
  );
}
