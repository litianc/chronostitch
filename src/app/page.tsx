import { OnboardingScreen } from "@/components/screens/OnboardingScreen";

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function Home() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return (
    <OnboardingScreen
      initialStartDate={toDateInputValue(today)}
      initialEndDate={toDateInputValue(nextWeek)}
    />
  );
}
