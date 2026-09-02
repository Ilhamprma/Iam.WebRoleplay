import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { WorldbuildingWizard } from './components/WorldbuildingWizard';
import { RoleplayArena } from './components/RoleplayArena';
import { WorldCodexDrawer } from './components/WorldCodexDrawer';
import { SettingsModal } from './components/SettingsModal';
import { StoryPortalModal } from './components/StoryPortalModal';
import { SaveCheckpointModal } from './components/SaveCheckpointModal';
import { useCampaignStore } from './hooks/useCampaignStore';
import { useTheme } from './hooks/useTheme';

export const App: React.FC = () => {
  const {
    campaigns,
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    createNewCampaign,
    deleteCampaign,
    addMessage,
    deleteMessage,
    updateMessage,
    transitionToRoleplay,
    returnToWorldbuilding,
    updateLore,
    updatePlayer,
    apiConfig,
    setApiConfig,
    exportActiveCampaign,
    importCampaign,
    createSaveCheckpoint,
    restoreSaveCheckpoint,
    deleteSaveCheckpoint,
    triggerManualSave,
    exportWorldbuildingMarkdown,
  } = useCampaignStore();

  const { theme, toggleTheme } = useTheme();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleSwitchToSimulator = () => {
    setApiConfig((prev) => ({
      ...prev,
      provider: 'simulation',
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#08090d] dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navigation */}
      <Navbar
        campaign={activeCampaign}
        apiConfig={apiConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCampaigns={() => setIsPortalOpen(true)}
        onToggleCodex={() => setIsCodexOpen(!isCodexOpen)}
        isCodexOpen={isCodexOpen}
        onSwitchPhase={(phase) => {
          if (phase === 'worldbuilding') {
            returnToWorldbuilding();
          } else {
            transitionToRoleplay();
          }
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      {/* Workspace Area: Phase A (Worldbuilding) or Phase B (Roleplay Arena) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeCampaign.phase === 'worldbuilding' ? (
          <WorldbuildingWizard
            campaign={activeCampaign}
            apiConfig={apiConfig}
            onAddMessage={(msg) => addMessage('worldbuilding', msg)}
            onLockLoreAndPlay={(extractedLore) => transitionToRoleplay(extractedLore)}
            onSaveProgress={triggerManualSave}
            onExportMarkdown={exportWorldbuildingMarkdown}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSwitchToSimulator={handleSwitchToSimulator}
          />
        ) : (
          <RoleplayArena
            campaign={activeCampaign}
            apiConfig={apiConfig}
            onAddMessage={(msg) => addMessage('roleplay', msg)}
            onUpdateMessage={(id, content) => updateMessage('roleplay', id, content)}
            onDeleteMessage={(id) => deleteMessage('roleplay', id)}
            onOpenCodex={() => setIsCodexOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSwitchToSimulator={handleSwitchToSimulator}
          />
        )}
      </main>

      {/* Living World Codex Drawer */}
      <WorldCodexDrawer
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        campaign={activeCampaign}
        onUpdateLore={updateLore}
        onUpdatePlayer={updatePlayer}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={(newCfg) => setApiConfig(newCfg)}
      />

      {/* Story Selection & Creation Portal Modal */}
      <StoryPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        campaigns={campaigns}
        activeCampaignId={activeCampaignId}
        onSelectCampaign={(id) => setActiveCampaignId(id)}
        onCreateCampaign={(name, genre) => createNewCampaign(name, genre)}
        onDeleteCampaign={(id) => deleteCampaign(id)}
        onExportCampaign={exportActiveCampaign}
        onImportCampaign={(json) => importCampaign(json)}
      />

      {/* Save Progress & Checkpoints Modal */}
      <SaveCheckpointModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        campaign={activeCampaign}
        onCreateCheckpoint={createSaveCheckpoint}
        onRestoreCheckpoint={restoreSaveCheckpoint}
        onDeleteCheckpoint={deleteSaveCheckpoint}
        onExportMarkdown={exportWorldbuildingMarkdown}
        onExportJson={exportActiveCampaign}
        onManualSave={triggerManualSave}
      />
    </div>
  );
};
export default App;
