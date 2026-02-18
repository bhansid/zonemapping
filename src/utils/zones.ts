import L from "leaflet";

export function serializeLayer(layer: any) {
  if (layer instanceof L.Circle) {
    return {
      type: "circle",
      data: {
        center: layer.getLatLng(),
        radius: layer.getRadius(),
      },
    };
  }

  if (layer instanceof L.Polygon) {
    return {
      type: "polygon",
      data: layer.getLatLngs(),
    };
  }

  return null;
}
