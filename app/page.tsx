import AuctionForm from '@/components/AuctionForm';
import { getConfig } from '@/lib/config';

export default function Home() {
  const config = getConfig();

  return <AuctionForm config={config} />;
}
