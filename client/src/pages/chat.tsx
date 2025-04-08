import Header from '@/components/layout/header';
import MobileNavigation from '@/components/layout/mobile-navigation';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useCurrentView } from '@/hooks/use-current-view';

export default function ChatPage() {
  const { activeView, setActiveView } = useCurrentView();

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
} 