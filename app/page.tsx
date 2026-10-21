import { redirect } from 'next/navigation';

// Print one QR code pointing to the site's root URL. Everyone enters through this route.
export default function Home() {
  redirect('/r/main');
}
