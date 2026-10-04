import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Dashboard } from '@/screens/Dashboard';
import { Chat } from '@/screens/Chat';
import { Resources, ResourceDetail } from '@/screens/Resources';
import { AttackLab } from '@/screens/AttackLab';
import { Research, ResearchDetail } from '@/screens/Research';
import { Models, ModelDetail } from '@/screens/Models';
import { AdminReview, PromptReview } from '@/screens/AdminReview';
import { Training } from '@/screens/Training';
import { SecurityLogs } from '@/screens/SecurityLogs';
import { Settings } from '@/screens/Settings';
import { DemoProvider } from '@/demoStore';
import type { Screen } from '@/types';

function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [resourceId, setResourceId] = useState('banking');
  const [modelId, setModelId] = useState('banking-model');
  const [researchId, setResearchId] = useState('prompt-injection');
  const [reviewId, setReviewId] = useState('r1');

  function navigate(s: Screen) {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectResource(id: string) {
    setResourceId(id);
    navigate('resource-detail');
  }

  function selectModel(id: string) {
    setModelId(id);
    navigate('model-detail');
  }

  function selectResearch(id: string) {
    setResearchId(id);
    navigate('research-detail');
  }

  function selectReview(id: string) {
    setReviewId(id);
    navigate('prompt-review');
  }

  // Keyboard shortcut for search is handled in Navbar

  const isAdminScreen = ['admin-review', 'prompt-review', 'training', 'logs', 'settings'].includes(screen);

  return (
    <DemoProvider>
    <div className="min-h-screen bg-ink-50">
      <Navbar current={screen} onNavigate={navigate} />
      <main className="animate-fade-in" key={screen}>
        {screen === 'dashboard' && <Dashboard onNavigate={navigate} onSelectResource={selectResource} />}
        {screen === 'chat' && <Chat />}
        {screen === 'resources' && <Resources onSelectResource={selectResource} onNavigate={navigate} />}
        {screen === 'resource-detail' && <ResourceDetail resourceId={resourceId} onBack={() => navigate('resources')} />}
        {screen === 'attack-lab' && <AttackLab />}
        {screen === 'research' && <Research onSelectTopic={selectResearch} onNavigate={navigate} />}
        {screen === 'research-detail' && <ResearchDetail topicId={researchId} onBack={() => navigate('research')} />}
        {screen === 'models' && <Models onSelectModel={selectModel} onNavigate={navigate} />}
        {screen === 'model-detail' && <ModelDetail modelId={modelId} onBack={() => navigate('models')} onNavigate={navigate} />}
        {screen === 'admin-review' && <AdminReview onSelectReview={selectReview} onNavigate={navigate} />}
        {screen === 'prompt-review' && <PromptReview reviewId={reviewId} onBack={() => navigate('admin-review')} />}
        {screen === 'training' && <Training />}
        {screen === 'logs' && <SecurityLogs />}
        {screen === 'settings' && <Settings />}
      </main>
    </div>
    </DemoProvider>
  );
}

export default App;
