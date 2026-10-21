import AdminDashboard from './dashboard';
import { isAdmin } from '@/lib/session';
export const dynamic = 'force-dynamic';
export default async function AdminPage() { return <AdminDashboard loggedIn={await isAdmin()} />; }
