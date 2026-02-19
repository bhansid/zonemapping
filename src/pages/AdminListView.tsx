import { useState } from "react";
import { formatDate } from "../utils/date";

const GRID = "1.6fr 2fr 1.6fr 3fr 1.5fr 1fr 1fr";

export default function AdminListView({ retailers, onSelect }: any) {
  const [images, setImages] = useState<string[] | null>(null);

  return (
    <div style={{ padding: 20, background: "#f8fafc", height: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          padding: "12px 16px",
          fontWeight: 600,
          background: "#fff",
          borderRadius: 10,
          marginBottom: 8,
        }}
      >
        <div>Added On</div>
        <div>Retailer</div>
        <div>Owner</div>
        <div>Address</div>
        <div>Agent</div>
        <div>Map</div>
        <div>Images</div>
      </div>

      {retailers.map((r: any, i: number) => (
        <div
          key={i}
          onClick={() => onSelect(r)}
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            padding: "14px 16px",
            background: "#fff",
            borderRadius: 10,
            marginBottom: 6,
            cursor: "pointer",
            alignItems: "center",
          }}
        >
          <div>{formatDate(r["Added On"])}</div>
          <div><b>{r.Retailer_Name}</b></div>
          <div>{r.Owner_Name}</div>
          <div>{r.Area}, {r.City}, {r.State}</div>
          <div>{r.Assigned_Agent}</div>
          <div>📍</div>
          <div>
            {r.Shop_Images && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setImages(
                    r.Shop_Images
                      .split(",")
                      .map((x: string) => x.trim())
                      .filter(Boolean)
                  );
                }}
              >
                Images
              </button>
            )}
          </div>
        </div>
      ))}

      {images && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setImages(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              width: 360,
              borderRadius: 12,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3>Shop Images</h3>

            {images.map((url, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563eb" }}
                >
                  Image {i + 1}
                </a>
              </div>
            ))}

            <button onClick={() => setImages(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}




// import { useState, useEffect } from "react";
// import ImageWithLoader from "../components/ImageWithLoader";
// import { driveToThumbnail } from "../utils/drive";
// import { formatDate } from "../utils/date";


// const GRID = "1.6fr 2fr 1.6fr 3fr 1.5fr 1fr 1fr";

// export default function AdminListView({ retailers, onSelect }: any) {
//   const [images, setImages] = useState<string[] | null>(null);
//   const [index, setIndex] = useState(0);

//   useEffect(() => {
//     if (images && images[index + 1]) {
//       const img = new Image();
//       img.src = driveToThumbnail(images[index + 1], false);
//     }
//   }, [index, images]);

//   return (
//     <div style={{ padding: 20, background: "#f8fafc", height: "100%" }}>
//       <div style={{ display: "grid", gridTemplateColumns: GRID, padding: "12px 16px", fontWeight: 600, background: "#fff", borderRadius: 10, marginBottom: 8 }}>
//         <div>Added On</div>
//         <div>Retailer</div>
//         <div>Owner</div>
//         <div>Address</div>
//         <div>Agent</div>
//         <div>Map</div>
//         <div>Images</div>
//       </div>

//       {retailers.map((r: any, i: number) => (
//         <div
//           key={i}
//           onClick={() => onSelect(r)}
//           style={{ display: "grid", gridTemplateColumns: GRID, padding: "14px 16px", background: "#fff", borderRadius: 10, marginBottom: 6, cursor: "pointer", alignItems: "center" }}
//         >
//         <div>{formatDate(r["Added On"])}</div>

//           <div><b>{r.Retailer_Name}</b></div>
//           <div>{r.Owner_Name}</div>
//           <div>{r.Area}, {r.City}, {r.State}</div>
//           <div>{r.Assigned_Agent}</div>
//           <div>📍</div>
//           <div>
//             {r.Shop_Images && (
//               <button
//                 onClick={e => {
//                   e.stopPropagation();
//                   const imgs = r.Shop_Images.split(",").map((x: string) => x.trim()).filter(Boolean);
//                   setImages(imgs);
//                   setIndex(0);
//                 }}
//               >
//                 View
//               </button>
//             )}
//           </div>
//         </div>
//       ))}

//       {images && (
//         <div style={{ position: "fixed" as const, inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setImages(null)}>
//           <div style={{ background: "#fff", padding: 16, width: 420, borderRadius: 12 }} onClick={e => e.stopPropagation()}>
//             <ImageWithLoader src={driveToThumbnail(images[index])} />

//             <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
//               <button disabled={index === 0} onClick={() => setIndex(i => i - 1)}>‹</button>
//               <span>{index + 1} / {images.length}</span>
//               <button disabled={index === images.length - 1} onClick={() => setIndex(i => i + 1)}>›</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
