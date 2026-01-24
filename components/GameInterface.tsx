
import React, { useState } from 'react';
import { GameState, Difficulty } from '../types';
import { TopNav } from './game/TopNav';
import { LeftPanel } from './game/LeftPanel';
import { CenterPanel } from './game/CenterPanel';
import { RightPanel } from './game/RightPanel';
import { BottomBanner } from './game/BottomBanner';
import { MobileTopNav } from './mobile/MobileTopNav';
import { MobileBottomNav } from './mobile/MobileBottomNav';
import { MobileInventoryView } from './mobile/MobileInventoryView';
import { MobileMenuOverlay } from './mobile/MobileMenuOverlay';
import { MobileMapView } from './mobile/MobileMapView'; // Import MobileMapView

// Modals
import { InventoryModal } from './game/modals/InventoryModal';
import { SettingsModal } from './game/modals/SettingsModal';
import { EquipmentModal } from './game/modals/EquipmentModal';
import { SocialModal } from './game/modals/SocialModal';
import { SocialPhoneModal } from './game/modals/SocialPhoneModal';
import { TasksModal } from './game/modals/TasksModal';
import { SkillsModal } from './game/modals/SkillsModal';
import { StoryModal } from './game/modals/StoryModal';
import { ContractModal } from './game/modals/ContractModal';
import { LootModal } from './game/modals/LootModal';
import { FamiliaModal } from './game/modals/FamiliaModal';
import { PresentCharactersModal } from './game/modals/PresentCharactersModal';
import { PartyModal } from './game/modals/PartyModal';
import { MapModal } from './game/modals/MapModal';
import { MemoryModal } from './game/modals/MemoryModal';
import { DynamicWorldModal } from './game/modals/DynamicWorldModal';

import { useGameLogic } from '../hooks/useGameLogic';

interface GameInterfaceProps {
    onExit: () => void;
    initialState?: GameState;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ onExit, initialState }) => {
  const {
      gameState, setGameState,
      settings, saveSettings,
      commandQueue, addToQueue, removeFromQueue,
      currentOptions, lastAIResponse, isProcessing, isStreaming,
      draftInput, setDraftInput,
      handlePlayerAction, handleSendMessage,
      stopInteraction, handleEditLog, handleDeleteLog, handleEditUserLog, handleUpdateLogText, handleUserRewrite,
      manualSave, loadGame, handleReroll, handleDeleteTask
  } = useGameLogic(initialState, onExit);

  // Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'CHAT' | 'CHAR' | 'INV' | 'MAP' | 'MENU'>('CHAT');

  const closeModal = () => setActiveModal(null);

  // Helper to handle commands that need to update state directly (like equipping)
  const handleUpdateConfidant = (id: string, updates: any) => {
      const newConfidants = gameState.社交.map(c => c.id === id ? { ...c, ...updates } : c);
      setGameState({ ...gameState, 社交: newConfidants });
  };

  const handleEquipItem = (item: any) => {
      // Simple frontend feedback, real logic should be AI driven or robust state update
  };

  const isHellMode = gameState.游戏难度 === Difficulty.HELL;

  return (
    <div 
        className="w-full h-dvh flex flex-col bg-zinc-950 overflow-hidden relative" 
        style={{ backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
    >
        <div className="hidden md:flex flex-col h-full">
            <TopNav 
                time={gameState.游戏时间} 
                location={gameState.当前地点} 
                floor={gameState.当前楼层} 
                weather={gameState.天气} 
                coords={gameState.世界坐标}
                isHellMode={isHellMode}
            />
            
            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden z-10">
                <div className="contents animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <LeftPanel stats={gameState.角色} isHellMode={isHellMode} />
                    
                    <CenterPanel 
                        logs={gameState.日志} 
                        combatState={gameState.战斗}
                        playerStats={gameState.角色}
                        skills={gameState.角色.技能}
                        inventory={gameState.背包} 
                        confidants={gameState.社交} 
                        onSendMessage={handleSendMessage}
                        onReroll={handleReroll}
                        lastRawResponse={lastAIResponse}
                        onPlayerAction={handlePlayerAction}
                        isProcessing={isProcessing}
                        isStreaming={isStreaming}
                        commandQueue={commandQueue}
                        onRemoveCommand={removeFromQueue}
                        
                        onEditLog={handleEditLog}
                        onDeleteLog={handleDeleteLog}
                        onEditUserLog={handleEditUserLog}
                        onUpdateLogText={handleUpdateLogText}
                        handleUserRewrite={handleUserRewrite}
                        onStopInteraction={stopInteraction}
                        draftInput={draftInput}
                        setDraftInput={setDraftInput}

                        actionOptions={currentOptions}
                        fontSize={settings.fontSize}
                        enableCombatUI={settings.enableCombatUI} 
                        isHellMode={isHellMode}
                    />

                    <RightPanel 
                        onOpenInventory={() => setActiveModal('INVENTORY')}
                        onOpenEquipment={() => setActiveModal('EQUIPMENT')}
                        onOpenSettings={() => setActiveModal('SETTINGS')}
                        onOpenSocial={() => setActiveModal('SOCIAL')}
                        onOpenTasks={() => setActiveModal('TASKS')}
                        onOpenSkills={() => setActiveModal('SKILLS')}
                        onOpenMap={() => setActiveModal('MAP')}
                        onOpenPhone={() => setActiveModal('PHONE')}
                        onOpenWorld={() => setActiveModal('WORLD')}
                        onOpenFamilia={() => setActiveModal('FAMILIA')}
                        onOpenStory={() => setActiveModal('STORY')}
                        onOpenContract={() => setActiveModal('CONTRACT')}
                        onOpenLoot={() => setActiveModal('LOOT')}
                        onOpenMemory={() => setActiveModal('MEMORY')}
                        onOpenPresent={() => setActiveModal('PRESENT')}
                        onOpenParty={() => setActiveModal('PARTY')}
                        isHellMode={isHellMode}
                    />
                </div>
            </div>
            <BottomBanner isHellMode={isHellMode} />
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col h-full w-full">
            <MobileTopNav 
                time={gameState.游戏时间} 
                location={gameState.当前地点} 
                floor={gameState.当前楼层} 
                weather={gameState.天气}
                isHellMode={isHellMode}
            />
            <div className="flex-1 relative overflow-hidden w-full">
                 {mobileActiveTab === 'CHAT' && (
                     <CenterPanel 
                        logs={gameState.日志} 
                        combatState={gameState.战斗}
                        playerStats={gameState.角色}
                        skills={gameState.角色.技能}
                        inventory={gameState.背包}
                        confidants={gameState.社交} 
                        onSendMessage={handleSendMessage}
                        onReroll={handleReroll}
                        onPlayerAction={handlePlayerAction}
                        isProcessing={isProcessing}
                        isStreaming={isStreaming}
                        className="border-none w-full"
                        enableCombatUI={settings.enableCombatUI}
                        isHellMode={isHellMode}
                    />
                 )}
                 {mobileActiveTab === 'INV' && (
                     <MobileInventoryView 
                        items={gameState.背包}
                        equipment={gameState.角色.装备}
                        onEquipItem={(item) => handlePlayerAction('item', item)} 
                        onUnequipItem={(slot) => handlePlayerAction('item', slot)} 
                        onUseItem={(item) => handlePlayerAction('item', item)}
                     />
                 )}
                 {mobileActiveTab === 'CHAR' && (
                     <div className="h-full overflow-y-auto bg-zinc-950 p-4">
                         <LeftPanel stats={gameState.角色} className="w-full border-none shadow-none" isHellMode={isHellMode} />
                     </div>
                 )}
                 {mobileActiveTab === 'MAP' && (
                     <MobileMapView 
                        worldMap={gameState.地图}
                        currentPos={gameState.世界坐标}
                        playerName={gameState.角色.姓名}
                        confidants={gameState.社交}
                        floor={gameState.当前楼层} 
                     />
                 )}
                 {mobileActiveTab === 'MENU' && (
                     <MobileMenuOverlay 
                        isOpen={true} 
                        onClose={() => setMobileActiveTab('CHAT')}
                        actions={{
                            onOpenSettings: () => setActiveModal('SETTINGS'),
                            onOpenEquipment: () => setActiveModal('EQUIPMENT'),
                            onOpenSocial: () => setActiveModal('SOCIAL'),
                            onOpenTasks: () => setActiveModal('TASKS'),
                            onOpenSkills: () => setActiveModal('SKILLS'),
                            onOpenPhone: () => setActiveModal('PHONE'),
                            onOpenWorld: () => setActiveModal('WORLD'),
                            onOpenFamilia: () => setActiveModal('FAMILIA'),
                            onOpenStory: () => setActiveModal('STORY'),
                            onOpenContract: () => setActiveModal('CONTRACT'),
                            onOpenLoot: () => setActiveModal('LOOT'),
                            onOpenMemory: () => setActiveModal('MEMORY'),
                            onOpenPresent: () => setActiveModal('PRESENT'),
                            onOpenParty: () => setActiveModal('PARTY'),
                        }}
                     />
                 )}
            </div>
            <MobileBottomNav onTabSelect={setMobileActiveTab} activeTab={mobileActiveTab} isHellMode={isHellMode} />
        </div>

        {/* --- Modals --- */}
        {/* Modals remain mostly neutral in style, except where internal specific theming applies */}
        
        <InventoryModal 
            isOpen={activeModal === 'INVENTORY'} 
            onClose={closeModal} 
            items={gameState.背包} 
            equipment={gameState.角色.装备} 
            onAddToQueue={addToQueue} 
            onEquipItem={handleEquipItem} 
            onUnequipItem={(slot) => addToQueue(`卸下${slot}`)} 
        />

        <EquipmentModal 
            isOpen={activeModal === 'EQUIPMENT'} 
            onClose={closeModal} 
            equipment={gameState.角色.装备}
            inventory={gameState.背包}
            onAddToQueue={addToQueue}
            onUnequipItem={(slot) => addToQueue(`卸下${slot}`)}
        />
        
        <SocialModal 
            isOpen={activeModal === 'SOCIAL'}
            onClose={closeModal}
            confidants={gameState.社交}
            onAddToQueue={addToQueue}
            onUpdateConfidant={handleUpdateConfidant}
        />

        <SocialPhoneModal 
            isOpen={activeModal === 'PHONE'}
            onClose={closeModal}
            messages={gameState.短信}
            contacts={gameState.社交}
            moments={gameState.动态}
            onSendMessage={(text, channel, target) => handleSendMessage(`[短信/${channel}] To ${target || 'Anyone'}: ${text}`)}
            onCreateGroup={(name, members) => addToQueue(`创建群组: ${name}, 成员: ${members.join(',')}`)}
            onReroll={handleReroll}
        />

        {/* Updated Tasks Modal */}
        <TasksModal 
            isOpen={activeModal === 'TASKS'} 
            onClose={closeModal} 
            tasks={gameState.任务} 
            onDeleteTask={handleDeleteTask}
        />

        <SkillsModal 
            isOpen={activeModal === 'SKILLS'} 
            onClose={closeModal} 
            skills={gameState.角色.技能} 
        />

        <StoryModal 
            isOpen={activeModal === 'STORY'} 
            onClose={closeModal} 
            story={gameState.剧情} 
        />

        <ContractModal 
            isOpen={activeModal === 'CONTRACT'} 
            onClose={closeModal} 
            contracts={gameState.契约} 
        />

        <LootModal 
            isOpen={activeModal === 'LOOT'} 
            onClose={closeModal} 
            items={gameState.战利品} 
        />

        <FamiliaModal 
            isOpen={activeModal === 'FAMILIA'} 
            onClose={closeModal} 
            familia={gameState.眷族} 
        />

        <PresentCharactersModal 
            isOpen={activeModal === 'PRESENT'} 
            onClose={closeModal} 
            characters={gameState.社交.filter(c => c.是否在场)} 
        />

        <PartyModal 
            isOpen={activeModal === 'PARTY'} 
            onClose={closeModal} 
            characters={gameState.社交} 
        />

        <MapModal 
            isOpen={activeModal === 'MAP'} 
            onClose={closeModal}
            worldMap={gameState.地图}
            currentPos={gameState.世界坐标}
            floor={gameState.当前楼层}
            location={gameState.当前地点}
            playerName={gameState.角色.姓名}
            confidants={gameState.社交}
        />

        <MemoryModal 
            isOpen={activeModal === 'MEMORY'} 
            onClose={closeModal} 
            memory={gameState.记忆}
            logs={gameState.日志}
            onUpdateMemory={(mem) => setGameState({...gameState, 记忆: mem})} 
        />

        <DynamicWorldModal 
            isOpen={activeModal === 'WORLD'} 
            onClose={closeModal} 
            worldState={gameState.世界} 
        />
        
        <SettingsModal 
            isOpen={activeModal === 'SETTINGS'} 
            onClose={closeModal} 
            settings={settings} 
            avatarUrl={gameState.角色.头像} 
            onSaveSettings={saveSettings} 
            onSaveGame={manualSave} 
            onLoadGame={loadGame} 
            onUpdateAvatar={(url) => setGameState({...gameState, 角色: {...gameState.角色, 头像: url}})} 
            onExitGame={onExit} 
            gameState={gameState} 
            onUpdateGameState={setGameState} 
        />
    </div>
  );
};
