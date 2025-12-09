'use client';

export default function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          fontWeight: '700'
        }}>
          Welcome to Evynte
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          Please use the event URL provided by the organizers to access your event.
        </p>
      </div>
    </div>
  );
}
