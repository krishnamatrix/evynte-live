'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';

const DEFAULT_TEMPLATE_PATH = '/CLAP R10 (1).png';
const TARGET_SIZE = 1080;
const DEFAULT_HASHTAGS = "#r10Ethics #Clap2023 #IEEE";

function PhotoBooth() {
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hashtags, setHashtags] = useState(DEFAULT_HASHTAGS);
  const [originalFileName, setOriginalFileName] = useState('');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [templateLink, setTemplateLink] = useState(DEFAULT_TEMPLATE_PATH);
  const [customTemplateLink, setCustomTemplateLink] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [templateValidation, setTemplateValidation] = useState({ isValid: true, message: 'Default template loaded' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null);
  const [isAdjustingImage, setIsAdjustingImage] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalImageData, setOriginalImageData] = useState<string | null>(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const templateCache = useRef(new Map());
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  const preloadTemplate = async (url) => {
    if (templateCache.current.has(url)) return;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        templateCache.current.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to preload template: ${url}`);
        templateCache.current.delete(url);
        
        // If local template fails, show specific error
        const isLocal = url.startsWith('/') || url.startsWith('./');
        const errorMsg = isLocal 
          ? `Local template not found: ${url}. Please make sure it exists in the public folder.`
          : `Failed to load template from: ${url}. CORS or network issue.`;
          
        reject(new Error(errorMsg));
      };
      img.src = url;
    });
  };

  const validateTemplate = async (url) => {
    if (!url) {
      return { isValid: false, message: 'Template URL is required' };
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      // Check if it's a local path
      if (url.startsWith('/') || url.startsWith('./')) {
        // It's a local path, continue
      } else {
        return { 
          isValid: false, 
          message: 'Please enter a valid URL (e.g., https://example.com/image.png)' 
        };
      }
    }

    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load template image'));
        image.src = url;
      });

      return { 
        isValid: true, 
        message: `Template loaded (${(img as HTMLImageElement).width}×${(img as HTMLImageElement).height}px)` 
      };
    } catch (err) {
      let errorMessage = 'Failed to load template image. ';
      
      if (url.includes('http')) {
        errorMessage += 'This may be due to CORS restrictions. Try: 1. Uploading the image to imgur.com 2. Using a direct image link 3. Using a local template.';
      } else {
        errorMessage += 'Make sure the image file exists in your public folder.';
      }
      
      return { isValid: false, message: errorMessage };
    }
  };

  const handleCustomTemplateSubmit = async () => {
    const trimmedLink = customTemplateLink.trim();
    if (!trimmedLink) {
      setTemplateValidation({ isValid: false, message: 'Please enter a template URL' });
      return;
    }

    try {
      setTemplateValidation({ isValid: false, message: 'Validating custom template...' });
      const validation = await validateTemplate(trimmedLink);
      
      if (validation.isValid) {
        await preloadTemplate(trimmedLink);
        setTemplateLink(trimmedLink);
        setSelectedTemplate('custom');
        setTemplateValidation(validation);
        setTemplatePreviewUrl(trimmedLink);
      } else {
        setTemplateValidation(validation);
        setTemplatePreviewUrl(null);
      }
    } catch (error) {
      setTemplateValidation({ 
        isValid: false, 
        message: error.message || 'Failed to load custom template' 
      });
    }
  };

  const resetToDefaultTemplate = () => {
    setTemplateLink(DEFAULT_TEMPLATE_PATH);
    setSelectedTemplate('default');
    setCustomTemplateLink('');
    setTemplateValidation({ isValid: true, message: 'Using default template' });
    setTemplatePreviewUrl(null);
  };

  const handleTemplateFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setTemplateValidation({ 
        isValid: false, 
        message: 'Please select a JPEG, PNG, WebP, or GIF image for template' 
      });
      return;
    }

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setCustomTemplateLink(dataUrl);
      setTemplatePreviewUrl(dataUrl);
      
      try {
        setTemplateValidation({ isValid: false, message: 'Loading uploaded template...' });
        await preloadTemplate(dataUrl);
        setTemplateLink(dataUrl);
        setSelectedTemplate('custom');
        setTemplateValidation({ 
          isValid: true, 
          message: 'Uploaded template loaded successfully' 
        });
      } catch (error) {
        setTemplateValidation({ 
          isValid: false, 
          message: 'Failed to load uploaded template' 
        });
        setTemplatePreviewUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateFile = (file) => {
    if (!file) return "Please select a file";
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return "Please select a JPEG, PNG, WebP, or GIF image";
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return "Image size must be less than 10MB";
    }
    
    return null;
  };

  const processImage = useCallback(async (file) => {
    console.log("Processing image with template:", templateLink);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!templateValidation.isValid && templateLink !== DEFAULT_TEMPLATE_PATH) {
      setError('Please fix template issues before processing');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setFinalImageUrl(null);
    setOriginalFileName(file.name);

    try {
      setProgress(10);
      
      const userImgDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProgress(30);
          resolve(e.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgress(50);

      // Load template image from cache or load it
      let overlayImg;
      if (templateCache.current.has(templateLink)) {
        overlayImg = templateCache.current.get(templateLink);
      } else {
        overlayImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            templateCache.current.set(templateLink, img);
            resolve(img);
          };
          img.onerror = () => reject(new Error("Failed to load template image. Please try a different template."));
          img.src = templateLink;
        });
      }

      setProgress(70);

      const userImg = new Image();
      userImg.src = userImgDataUrl;
      await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
      });

      const canvas = canvasRef.current || document.createElement('canvas');
      if (!canvasRef.current) {
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      const ratio = Math.min(TARGET_SIZE / userImg.width, TARGET_SIZE / userImg.height);
      const newWidth = userImg.width * ratio;
      const newHeight = userImg.height * ratio;
      const xOffset = (TARGET_SIZE - newWidth) / 2;
      const yOffset = (TARGET_SIZE - newHeight) / 2;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(userImg, xOffset, yOffset, newWidth, newHeight);

      ctx.drawImage(overlayImg, 0, 0, TARGET_SIZE, TARGET_SIZE);

      setProgress(90);

      const finalUrl = canvas.toDataURL('image/png', 1.0);
      setFinalImageUrl(finalUrl);
      setOriginalImageData(userImgDataUrl);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setProgress(100);

      if (!canvasRef.current) canvasRef.current = canvas;

    } catch (error) {
      console.error("Image processing error:", error);
      let errorMessage = error.message || "Failed to process image.";
      
      // Add specific guidance for CORS issues
      if (error.message.includes('CORS') || templateLink.includes('http')) {
        errorMessage += " Try using a local template or upload a template image instead.";
      }
      
      setError(errorMessage);
      
      // Fallback to default template on error
      if (!templateLink.includes(DEFAULT_TEMPLATE_PATH)) {
        setTemplateLink(DEFAULT_TEMPLATE_PATH);
        setSelectedTemplate('default');
        setTemplateValidation({ 
          isValid: true, 
          message: 'Fell back to default template due to error' 
        });
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [templateLink, templateValidation.isValid]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDownload = () => {
    if (!finalImageUrl) return;

    const link = document.createElement('a');
    link.href = finalImageUrl;
    const fileName = originalFileName 
      ? `ethics-journey-${selectedTemplate}-${originalFileName.split('.')[0]}.png`
      : `ethics-journey-${selectedTemplate}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(hashtags);
      const button = document.querySelector('.copy-btn') as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = '#28a745';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
      }
    } catch (err) {
      alert('Could not copy text. Please copy manually.');
    }
  };

  const resetApp = () => {
    setFinalImageUrl(null);
    setOriginalFileName('');
    setOriginalImageData(null);
    setIsAdjustingImage(false);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const reprocessWithAdjustments = async () => {
    if (!originalImageData) return;

    try {
      setIsLoading(true);

      const overlayImg = templateCache.current.get(templateLink);
      if (!overlayImg) return;

      const userImg = new Image();
      userImg.src = originalImageData;
      await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
      });

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Calculate base dimensions
      const ratio = Math.min(TARGET_SIZE / userImg.width, TARGET_SIZE / userImg.height) * zoom;
      const newWidth = userImg.width * ratio;
      const newHeight = userImg.height * ratio;
      const xOffset = (TARGET_SIZE - newWidth) / 2 + panX;
      const yOffset = (TARGET_SIZE - newHeight) / 2 + panY;

      // Fill background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      // Draw user image with zoom and pan
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(userImg, xOffset, yOffset, newWidth, newHeight);

      // Draw template overlay
      ctx.drawImage(overlayImg, 0, 0, TARGET_SIZE, TARGET_SIZE);

      const finalUrl = canvas.toDataURL('image/png', 1.0);
      setFinalImageUrl(finalUrl);

      if (!canvasRef.current) canvasRef.current = canvas;
    } catch (error) {
      console.error("Error reprocessing image:", error);
      setError("Failed to adjust image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAdjustingImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isAdjustingImage) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const applyAdjustments = async () => {
    await reprocessWithAdjustments();
    setIsAdjustingImage(false);
  };

  const cancelAdjustments = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setIsAdjustingImage(false);
    reprocessWithAdjustments();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      setError("Please drop an image file (JPEG, PNG, etc.)");
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setIsVideoReady(false);
      
      // Wait a bit for the next render cycle
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setIsVideoReady(true);
            }).catch(err => {
              console.error('Error playing video:', err);
              setError('Unable to start video playback.');
            });
          };
        }
      }, 100);
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', err);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsVideoReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !captureCanvasRef.current || !isVideoReady) {
      setError('Camera is not ready yet. Please wait a moment.');
      return;
    }
    
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror the image horizontally (flip it back to normal)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        processImage(file);
        closeCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (isAdjustingImage && originalImageData) {
      const timeoutId = setTimeout(() => {
        reprocessWithAdjustments();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [zoom, panX, panY, isAdjustingImage]);

  return (
    <div className="image-overlay-app" style={styles.container}>
      <div style={styles.headerContainer}>
        <button onClick={() => window.history.back()} style={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>
      <header style={styles.header}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>Photo Booth Studio</h1>
          <p style={styles.subtitle}>Capture memories with custom templates</p>
        </div>
      </header>

      {/* Template Selection Section */}
      <div style={styles.templateSection}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.icon}>🎨</span> Choose Your Template
        </h3>
        
        <div style={styles.templateStatus}>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: templateValidation.isValid ? 'rgba(139, 92, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: templateValidation.isValid ? '#fff' : '#fca5a5',
            border: templateValidation.isValid ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {templateValidation.isValid ? '✓' : '⚠️'} {templateValidation.message}
          </span>
        </div>

        {/* Template Upload Section */}
        <div style={styles.customTemplateSection}>
          <h4 style={styles.subsectionTitle}>Upload Template</h4>
          
          <div style={styles.templateMethodTabs}>
            <div style={styles.methodTab}>
              <h5 style={styles.methodTitle}>Option 1: Upload Template Image</h5>
              <p style={styles.helpText}>
                Upload your own template (PNG with transparency works best)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleTemplateFileUpload}
                style={styles.fileInput}
              />
              {templatePreviewUrl && selectedTemplate === 'custom' && (
                <div style={styles.templatePreviewContainer}>
                  <p style={styles.previewLabel}>Template Preview:</p>
                  <div style={styles.templatePreviewBox}>
                    <img 
                      src={templatePreviewUrl} 
                      alt="Template preview" 
                      style={styles.templatePreviewImage}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div style={styles.methodDivider}>
              <span style={styles.dividerText}>OR</span>
            </div>
            
            <div style={styles.methodTab}>
              <h5 style={styles.methodTitle}>Option 2: Enter Image URL</h5>
              <p style={styles.helpText}>
                Enter direct image URL (must allow CORS)
              </p>
              <div style={styles.urlInputGroup}>
                <input
                  type="url"
                  value={customTemplateLink}
                  onChange={(e) => setCustomTemplateLink(e.target.value)}
                  placeholder="https://example.com/your-template.png"
                  style={styles.urlInput}
                />
                <button
                  onClick={handleCustomTemplateSubmit}
                  style={{
                    ...styles.primaryButton,
                    padding: '10px 20px',
                    backgroundColor: customTemplateLink.trim() ? '#3498db' : '#cccccc',
                    cursor: customTemplateLink.trim() ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!customTemplateLink.trim()}
                >
                  Use URL
                </button>
              </div>
              <p style={styles.corsWarning}>
                ⚠️ Some URLs may be blocked by CORS. If URL doesn't work, try uploading instead.
              </p>
              
              <div style={styles.templateHelp}>
                <h5 style={styles.tipsTitle}>📝 Template Tips:</h5>
                <ul style={styles.tipsList}>
                  <li>For best results, use 1080×1080px images</li>
                  <li>PNG with transparent areas works best for overlays</li>
                  <li>To find templates: Search for "PNG frame transparent background"</li>
                  <li>Need help? Use the default template or upload your own</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetToDefaultTemplate}
            style={styles.secondaryButton}
          >
            ↺ Reset to Default Template
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div style={styles.uploadSection}>
        <h3 style={styles.sectionTitle}>Capture or Upload</h3>
        
        <div style={styles.uploadOptions}>
          <button style={styles.optionButton} onClick={openCamera}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>Take Selfie</span>
          </button>
          
          <div style={styles.dividerContainer}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>
          
          <div style={styles.uploadAreaModern}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={styles.visibleFileInput}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={styles.uploadIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p style={styles.uploadText}>Drop your photo here</p>
            <p style={styles.uploadSubtext}>or click to browse</p>
          </div>
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div style={styles.cameraModal}>
            <div style={styles.cameraContainer}>
              <div style={styles.cameraHeader}>
                <h3 style={styles.cameraTitle}>Take Your Selfie</h3>
                <button onClick={closeCamera} style={styles.closeButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              {!isVideoReady && (
                <div style={styles.videoLoading}>
                  <div style={styles.loadingSpinner}></div>
                  <p style={styles.loadingText}>Starting camera...</p>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                style={{
                  ...styles.video,
                  opacity: isVideoReady ? 1 : 0
                }}
              />
              <canvas ref={captureCanvasRef} style={{ display: 'none' }} />
              <div style={styles.cameraActions}>
                <button 
                  onClick={capturePhoto} 
                  style={{
                    ...styles.captureButton,
                    opacity: isVideoReady ? 1 : 0.5,
                    cursor: isVideoReady ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isVideoReady}
                >
                  <div style={styles.captureButtonInner}></div>
                </button>
                {isVideoReady && (
                  <p style={styles.captureHint}>Click to capture</p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <div style={styles.errorContent}>
              <strong>Error:</strong> {error}
            </div>
            <button onClick={() => setError(null)} style={styles.dismissButton}>
              ×
            </button>
          </div>
        )}

        {isLoading && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`
                }}
              />
            </div>
            <p style={styles.progressText}>
              Processing with template {selectedTemplate}... {progress}%
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Section */}
      {finalImageUrl && !isLoading && (
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>
            <h3 style={styles.previewTitle}>
              Your Ethics Journey Memory 
              <span style={styles.templateBadge}>{selectedTemplate}</span>
            </h3>
            <div style={styles.previewActions}>
              {!isAdjustingImage ? (
                <>
                  <button 
                    onClick={() => setIsAdjustingImage(true)}
                    style={styles.adjustButton}
                    title="Adjust photo position and zoom"
                  >
                    Adjust Photo
                  </button>
                  <button 
                    onClick={resetApp}
                    style={styles.secondaryButton}
                    title="Upload a different image"
                  >
                    New Image
                  </button>
                  <button 
                    onClick={handleDownload}
                    style={styles.primaryButton}
                  >
                    Download PNG
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={cancelAdjustments}
                    style={styles.secondaryButton}
                  >
                    ✕ Cancel
                  </button>
                  <button 
                    onClick={applyAdjustments}
                    style={styles.primaryButton}
                  >
                    ✓ Apply
                  </button>
                </>
              )}
            </div>
          </div>

          {isAdjustingImage && (
            <div style={styles.adjustmentControls}>
              <div style={styles.controlGroup}>
                <span style={styles.controlLabel}>Zoom: {zoom.toFixed(1)}x</span>
                <div style={styles.zoomButtons}>
                  <button onClick={handleZoomOut} style={styles.zoomButton} disabled={zoom <= 0.5}>−</button>
                  <button onClick={handleZoomIn} style={styles.zoomButton} disabled={zoom >= 3}>+</button>
                </div>
              </div>
              <p style={styles.adjustmentHint}>💡 Drag the image to reposition it within the frame</p>
            </div>
          )}
          
          <div 
            style={{
              ...styles.imageContainer,
              cursor: isAdjustingImage ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              src={finalImageUrl} 
              alt="Your Ethics Journey Memory" 
              style={{
                ...styles.finalImage,
                userSelect: 'none' as const,
                pointerEvents: 'none' as const
              }}
              draggable={false}
            />
          </div>
          
          <div style={styles.imageInfo}>
            <span>📏 {TARGET_SIZE}×{TARGET_SIZE}px</span>
            <span>🎨 Template: {selectedTemplate}</span>
            <span>📦 Ready to share!</span>
          </div>
        </div>
      )}

      {/* Hashtags Section */}
      <div style={styles.hashtagsSection}>
        <h4 style={styles.sectionTitle}>
          <span style={styles.icon}>🏷️</span> Social Media Hashtags
        </h4>
        
        <div style={styles.hashtagsInputContainer}>
          <textarea
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            style={styles.hashtagsTextarea}
            placeholder="#your #hashtags #here"
            rows={2}
          />
          <div style={styles.hashtagsActions}>
            <button 
              onClick={() => setHashtags(DEFAULT_HASHTAGS)}
              style={styles.secondaryButton}
              title="Reset to default hashtags"
            >
              Reset
            </button>
            <button 
              onClick={copyHashtags}
              className="copy-btn"
              style={styles.copyButton}
              disabled={!hashtags.trim()}
            >
              📋 Copy Hashtags
            </button>
          </div>
        </div>
        
        <p style={styles.tip}>
          Tip: Copy these hashtags and paste when sharing your image on social media!
        </p>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Made with ❤️ for IEEE R10 • All images are processed locally in your browser
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #0f0e1e 50%, #24243e 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    color: '#fff',
    position: 'relative' as const,
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto 30px',
  },
  backButton: {
    background: 'rgba(139, 92, 246, 0.2)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '50px',
    maxWidth: '1200px',
    margin: '0 auto 50px',
  },
  titleContainer: {
    animation: 'fadeInUp 0.6s ease-out',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 15px 0',
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.3rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    fontWeight: '400',
  },
  icon: {
    marginRight: '8px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: '0 0 25px 0',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  templateSection: {
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    marginBottom: '25px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    maxWidth: '1200px',
    margin: '0 auto 25px',
  },
  templateStatus: {
    marginBottom: '25px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  templateCard: {
    border: '2px solid',
    borderRadius: '10px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    backgroundColor: '#fafafa',
  },
  templatePreview: {
    width: '100%',
    height: '120px',
    marginBottom: '10px',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  templateImage: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#f0f0f0',
  },
  localBadge: {
    position: 'absolute' as const,
    top: '5px',
    left: '5px',
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    zIndex: 2,
  },
  urlBadge: {
    position: 'absolute' as const,
    top: '5px',
    left: '5px',
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    zIndex: 2,
  },
  templateInfo: {
    textAlign: 'center' as const,
  },
  templateName: {
    display: 'block',
    fontSize: '0.95rem',
    marginBottom: '4px',
    color: '#2c3e50',
  },
  templateDesc: {
    color: '#7f8c8d',
    fontSize: '0.8rem',
  },
  selectedBadge: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    backgroundColor: '#3498db',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  customTemplateSection: {
    backgroundColor: 'rgba(15, 12, 41, 0.4)',
    borderRadius: '15px',
    padding: '20px',
    marginTop: '20px',
    border: '1px solid rgba(139, 92, 246, 0.15)',
  },
  subsectionTitle: {
    fontSize: '1.3rem',
    margin: '0 0 20px 0',
    color: '#fff',
    fontWeight: '600',
  },
  templateMethodTabs: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginBottom: '20px',
  },
  methodTab: {
    backgroundColor: 'rgba(15, 12, 41, 0.4)',
    borderRadius: '10px',
    padding: '15px',
    border: '1px solid rgba(139, 92, 246, 0.15)',
  },
  methodTitle: {
    fontSize: '1.1rem',
    margin: '0 0 10px 0',
    color: '#fff',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  methodDivider: {
    textAlign: 'center' as const,
    position: 'relative' as const,
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  uploadAreaModern: {
    border: '2px dashed rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '50px 20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
  },
  helpText: {
    fontSize: '0.9rem',
    color: '#6c757d',
    margin: '0 0 15px 0',
  },
  urlInputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '10px',
  },
  urlInput: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(15, 12, 41, 0.6)',
    color: '#fff',
  },
  corsWarning: {
    fontSize: '0.8rem',
    color: '#e74c3c',
    margin: '10px 0 0 0',
    fontStyle: 'italic',
  },
  templateHelp: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '15px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  tipsTitle: {
    fontSize: '0.95rem',
    margin: '0 0 10px 0',
    color: '#fff',
    fontWeight: '600',
  },
  templatePreviewContainer: {
    marginTop: '15px',
  },
  previewLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0 0 10px 0',
    fontWeight: '500',
  },
  templatePreviewBox: {
    backgroundColor: 'rgba(15, 12, 41, 0.6)',
    border: '2px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '250px',
    overflow: 'hidden',
  },
  templatePreviewImage: {
    maxWidth: '100%',
    maxHeight: '230px',
    objectFit: 'contain' as const,
    borderRadius: '8px',
  },
  tipsList: {
    margin: '0',
    paddingLeft: '20px',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '1.6',
  },
  uploadSection: {
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    marginBottom: '25px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    maxWidth: '1200px',
    margin: '0 auto 25px',
  },
  uploadOptions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px',
  },
  optionButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    border: 'none',
    borderRadius: '15px',
    padding: '18px',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)',
  },
  fileInput: {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '10px',
    backgroundColor: 'rgba(15, 12, 41, 0.6)',
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  visibleFileInput: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 10,
  },
  uploadContent: {
    pointerEvents: 'none' as const,
  },
  uploadIcon: {
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '0 auto 20px',
  },
  uploadText: {
    fontSize: '1.2rem',
    color: '#fff',
    margin: '0 0 10px 0',
    fontWeight: '600',
  },
  uploadSubtext: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
  },
  errorBox: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    border: '1px solid rgba(220, 53, 69, 0.4)',
    borderRadius: '12px',
    padding: '15px 20px',
    marginTop: '20px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backdropFilter: 'blur(10px)',
  },
  errorContent: {
    flex: 1,
  },
  errorIcon: {
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#999',
    flexShrink: 0,
  },
  progressContainer: {
    marginBottom: '20px',
  },
  progressBar: {
    height: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    textAlign: 'center' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.95rem',
    margin: 0,
    fontWeight: '500',
  },
  previewSection: {
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    marginBottom: '25px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    maxWidth: '1200px',
    margin: '0 auto 25px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '15px',
  },
  previewTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '1.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: '700',
  },
  templateBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  previewActions: {
    display: 'flex',
    gap: '10px',
    flex: 1,
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    color: '#fff',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    flex: 1,
  },
  adjustButton: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
    flex: 1,
  },
  adjustmentControls: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
  },
  controlLabel: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
  },
  zoomButtons: {
    display: 'flex',
    gap: '10px',
  },
  zoomButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  adjustmentHint: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    margin: 0,
    textAlign: 'center' as const,
  },
  imageContainer: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    marginBottom: '15px',
  },
  finalImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  imageInfo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.95rem',
    margin: '15px 0 0 0',
  },
  hashtagsSection: {
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    marginBottom: '25px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    maxWidth: '1200px',
    margin: '0 auto 25px',
  },
  hashtagsInputContainer: {
    marginBottom: '15px',
  },
  hashtagsTextarea: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'monospace',
    marginBottom: '10px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
    backgroundColor: 'rgba(15, 12, 41, 0.6)',
    color: '#fff',
  },
  hashtagsActions: {
    display: 'flex',
    gap: '10px',
  },
  copyButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    flex: 1,
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  tip: {
    fontSize: '0.85rem',
    color: '#7f8c8d',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    margin: '10px 0 0 0',
  },
  footer: {
    textAlign: 'center' as const,
    paddingTop: '30px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerText: {
    margin: '0 0 10px 0',
  },
  cameraModal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  cameraContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '20px',
    maxWidth: '800px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  cameraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cameraTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.3s ease',
  },
  video: {
    width: '100%',
    borderRadius: '16px',
    maxHeight: '500px',
    objectFit: 'cover' as const,
    transform: 'scaleX(-1)',
  },
  cameraActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '25px',
  },
  captureButton: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '4px solid #fff',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
  },
  captureButtonInner: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#fff',
  },
  videoLoading: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    zIndex: 10,
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px',
  },
  loadingText: {
    color: '#fff',
    fontSize: '1rem',
    margin: 0,
  },
  captureHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    margin: '10px 0 0 0',
    textAlign: 'center' as const,
  },
};

// Add hover effects and animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .image-overlay-app button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    .image-overlay-app button:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .image-overlay-app button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .image-overlay-app [style*="optionButton"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
    }
    
    .image-overlay-app [style*="uploadAreaModern"]:hover {
      border-color: rgba(255, 255, 255, 0.5);
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .image-overlay-app [style*="closeButton"]:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
    
    .image-overlay-app [style*="captureButton"]:hover {
      transform: scale(1.1);
    }
    
    .image-overlay-app [style*="backButton"]:hover {
      background: rgba(139, 92, 246, 0.3);
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }

    .image-overlay-app [style*="backButton"]:active {
      transform: scale(0.9);
      background: rgba(139, 92, 246, 0.4);
    }

    .image-overlay-app input[type="file"] {
      cursor: pointer;
    }
    
    .image-overlay-app input[type="file"]::file-selector-button {
      background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      margin-right: 10px;
      transition: all 0.3s ease;
    }
    
    .image-overlay-app input[type="file"]::file-selector-button:hover {
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

export default PhotoBooth;
