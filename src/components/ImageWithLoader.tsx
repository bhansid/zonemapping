import { useEffect, useState } from "react";

export default function ImageWithLoader({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    setAttempt(0);
  }, [src]);

  useEffect(() => {
    if (error && attempt === 0) {
      const t = setTimeout(() => {
        setAttempt(1);
        setError(false);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [error, attempt]);

  return (
    <div style={ { position: "relative", width: "100%", minHeight: 220, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" } }>
      {!loaded && !error && (
        <div style={ { display: "flex", flexDirection: "column", alignItems: "center" } }>
          <div style={ { width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" } } />
          <div style={{ fontSize: 12 }}>Loading…</div>
        </div>
      )}

      {error && attempt === 1 && <div style={{ fontSize: 12 }}>Image unavailable</div>}

      <img
        key={attempt}
        src={src}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? "block" : "none", width: "100%", borderRadius: 8 }}
      />
    </div>
  );
}
