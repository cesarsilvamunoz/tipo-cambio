import AppShell from './_components/AppShell';

export default function Page() {
  const referenceDate = new Date().toISOString();
  return <AppShell referenceDate={referenceDate} />;
}