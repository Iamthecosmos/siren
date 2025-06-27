import { MapPin } from "lucide-react";
import Placeholder from "./Placeholder";

export default function Location() {
  return (
    <Placeholder
      title="Live Location Sharing"
      description="Share your real-time location with trusted contacts and emergency services for continuous safety monitoring."
      icon={MapPin}
    />
  );
}
