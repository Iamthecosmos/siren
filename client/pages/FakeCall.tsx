import { Phone } from "lucide-react";
import Placeholder from "./Placeholder";

export default function FakeCall() {
  return (
    <Placeholder
      title="Fake Call"
      description="Simulate incoming calls to safely exit uncomfortable situations with pre-recorded conversations and realistic caller interfaces."
      icon={Phone}
    />
  );
}
