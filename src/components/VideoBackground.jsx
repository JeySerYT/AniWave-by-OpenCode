import { useState, useEffect } from 'react';
import { anilibriaApi } from '../api/anilibria';

const VideoBackground = () => {
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const r = await anilibriaApi.getTitleRandom(20);
        const titles = r?.data || [];
        const withVideo = titles.find(t => t.episodes?.length > 0);
        if (!withVideo) return;

        const full = await anilibriaApi.getReleaseById(withVideo.id);
        if (cancelled) return;

        const ep = full?.episodes?.[0];
        if (!ep) return;

        const url = ep.hls_720 || ep.hls_1080 || ep.hls_480;
        if (url) setVideoUrl(url);
      } catch {
        /* fail silently — gradient fallback */
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="auth-video-bg">
      {videoUrl ? (
        <video
          key={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          src={videoUrl}
        />
      ) : (
        <div className="auth-video-fallback" />
      )}
      <div className="auth-video-overlay" />
    </div>
  );
};

export default VideoBackground;
