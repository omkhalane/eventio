import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CalendarEvent } from '../types';

export const exportEventAsImage = async (event: CalendarEvent, format: 'pdf' | 'jpg') => {
  // Create a temporary hidden container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#1c1917'; // stone-900
  container.style.color = '#fff';
  container.style.fontFamily = 'sans-serif';
  container.style.borderRadius = '24px';
  
  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'competitive_programming': return '#f59e0b'; // amber-500
      case 'hackathon': return '#a855f7'; // purple-500
      case 'data_science':
      case 'ai_ml': return '#06b6d4'; // cyan-500
      case 'global_competition':
      case 'startup': return '#ca8a04'; // yellow-600
      case 'hiring_challenge': return '#f97316'; // orange-500
      case 'community_event':
      case 'web_development': return '#3b82f6'; // blue-500
      case 'cybersecurity_ctf': return '#ef4444'; // red-500
      case 'open_source': return '#10b981'; // emerald-500
      default: return '#64748b'; // slate-500
    }
  };

  const primaryColor = getCategoryColor(event.event_type || '');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; position: relative; z-index: 10;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; border-bottom: 2px solid rgba(255,255,255,0.05); padding-bottom: 24px;">
        <div style="display: flex; align-items: center;">
          <div style="width: 56px; height: 56px; background: ${primaryColor}20; border: 2px solid ${primaryColor}; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <h2 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; color: #fff;">EventIO</h2>
            <p style="margin: 0; font-size: 12px; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 900;">Verified Event</p>
          </div>
        </div>
        
        <div style="text-align: right;">
          <div style="background: ${primaryColor}20; border: 1px solid ${primaryColor}40; padding: 8px 16px; border-radius: 12px;">
            <span style="font-size: 14px; font-weight: 900; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 0.1em;">
              ${event.platform}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Title & Category -->
      <h1 style="margin: 0 0 24px 0; font-size: 52px; font-weight: 900; line-height: 1.1; letter-spacing: -0.04em; color: #fff;">
        ${event.title}
      </h1>
      
      <div style="display: flex; gap: 12px; margin-bottom: 40px; flex-wrap: wrap;">
        <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #e7e5e4;">
          ${event.event_type ? event.event_type.replace('_', ' ') : 'Event'}
        </span>
        <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #e7e5e4;">
          ${event.is_online ? '🌐 Online' : '📍 In-Person'}
        </span>
        ${event.is_free ? `
        <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #10b981;">
          Free
        </span>` : ''}
      </div>

      <!-- Description -->
      ${event.description || event.shortDescription ? `
      <div style="margin-bottom: 40px; font-size: 16px; line-height: 1.6; color: #a8a29e; max-height: 150px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical;">
        ${event.description || event.shortDescription}
      </div>
      ` : ''}

      <!-- Meta Grid -->
      <div style="background: rgba(0,0,0,0.4); border-radius: 20px; padding: 32px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <div>
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #78716c; font-weight: bold;">Start Date</p>
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #fff;">${new Date(event.start_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
          </div>
          ${event.end_time ? `
          <div>
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #78716c; font-weight: bold;">End Date</p>
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #fff;">${new Date(event.end_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
          </div>
          ` : ''}
          ${event.location || event.city ? `
          <div style="grid-column: 1 / -1;">
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #78716c; font-weight: bold;">Location</p>
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #fff;">${event.location || ''} ${event.city ? `, ${event.city}` : ''} ${event.country ? `, ${event.country}` : ''}</p>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Footer & URL -->
      <div style="margin-top: auto; padding-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #78716c; font-weight: bold;">Register / View Event at:</p>
          <p style="margin: 0; font-size: 18px; font-weight: 900; color: ${primaryColor};">event-io.me/events/${event.slug}</p>
        </div>
        <div style="text-align: right; opacity: 0.5;">
          <p style="margin: 0; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: bold;">Generated by EventIO</p>
        </div>
      </div>
    </div>
    
    <!-- Decorative background glow -->
    <div style="position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: ${primaryColor}; filter: blur(200px); opacity: 0.15; border-radius: 50%; pointer-events: none; z-index: 1;"></div>
    <div style="position: absolute; bottom: -200px; left: -200px; width: 600px; height: 600px; background: ${primaryColor}; filter: blur(200px); opacity: 0.1; border-radius: 50%; pointer-events: none; z-index: 1;"></div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1c1917',
      logging: false,
    });

    if (format === 'jpg') {
      const link = document.createElement('a');
      link.download = `eventio-${event.slug}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`eventio-${event.slug}.pdf`);
    }
  } catch (error) {
    console.error('Error generating export:', error);
  } finally {
    document.body.removeChild(container);
  }
};
