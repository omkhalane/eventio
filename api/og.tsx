import React from 'react';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Missing slug', { status: 400 });
    }

    // Fetch event data from the API
    const apiUrl = `${origin}/api/v1/events/${slug}`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    const event = json.data;

    if (!event) {
      return new Response('Event not found', { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#050505',
            padding: '80px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '20%',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: '100px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {event.platform}
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: '100px',
                  color: '#999',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {event.event_type}
              </div>
            </div>

            <h1
              style={{
                fontSize: '80px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1,
                margin: '20px 0',
                textTransform: 'uppercase',
                letterSpacing: '-0.05em',
                maxWidth: '900px',
              }}
            >
              {event.title}
            </h1>

            <p
              style={{
                fontSize: '32px',
                color: '#888',
                lineHeight: 1.4,
                maxWidth: '800px',
              }}
            >
              {event.shortDescription || event.description?.slice(0, 150) + '...'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '40px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ color: '#555', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Event Date</span>
               <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{new Date(event.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: 'black', borderRadius: '50%' }} />
               </div>
               <span style={{ color: 'white', fontSize: '24px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em' }}>EventIO</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
