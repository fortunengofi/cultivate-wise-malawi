import { CROPS, LOCATIONS, CROP_PLANS } from "@/services/farmData";
import { useFarm } from "@/contexts/FarmContext";

const CropLocationPicker = ({ showCrop = true, showLocation = true }: { showCrop?: boolean; showLocation?: boolean }) => {
  const { crop, setCrop, locationId, setLocationId } = useFarm();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {showCrop && (
        <label className="block">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Crop</span>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="mt-1 w-full h-11 rounded-lg border border-border bg-card px-3 text-base font-semibold text-foreground"
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>{`${CROP_PLANS[c]?.emoji ?? "🌾"} ${c}`}</option>
            ))}
          </select>
        </label>
      )}
      {showLocation && (
        <label className="block">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Location</span>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="mt-1 w-full h-11 rounded-lg border border-border bg-card px-3 text-base font-semibold text-foreground"
          >
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{`${l.name} (${l.region})`}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

export default CropLocationPicker;
