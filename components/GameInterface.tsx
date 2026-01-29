
import React, { useMemo, useState } from 'react';
import { GameState, Difficulty, InventoryItem, Confidant } from '../types';
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
import { SaveManagerModal } from './game/modals/SaveManagerModal';
import { EquipmentModal } from './game/modals/EquipmentModal';
import { SocialModal } from './game/modals/SocialModal';
import { SocialPhoneModal } from './game/modals/SocialPhoneModal';
import { TasksModal } from './game/modals/TasksModal';
import { SkillsModal } from './game/modals/SkillsModal';
import { StoryModal } from './game/modals/StoryModal';
import { ContractModal } from './game/modals/ContractModal';
import { LootModal } from './game/modals/LootModal';
import { LootVaultModal } from './game/modals/LootVaultModal';
import { FamiliaModal } from './game/modals/FamiliaModal';
import { PresentCharactersModal } from './game/modals/PresentCharactersModal';
import { PartyModal } from './game/modals/PartyModal';
import { MapModal } from './game/modals/MapModal';
import { MemoryModal } from './game/modals/MemoryModal';
import { DynamicWorldModal } from './game/modals/DynamicWorldModal';
import { MemorySummaryModal } from './game/modals/MemorySummaryModal';
import { NotesModal } from './game/modals/NotesModal';

import { useGameLogic } from '../hooks/useGameLogic';
import { buildPreviewState } from '../utils/previewState';
import { resolveLocationHierarchy } from '../utils/mapSystem';
import { getDefaultEquipSlot } from '../utils/itemUtils';
import { computeInventoryWeight, computeMaxCarry } from '../utils/characterMath';

interface GameInterfaceProps {
    onExit: () => void;
    initialState?: GameState;
}

type ActiveModal =
    | 'INVENTORY'
    | 'EQUIPMENT'
    | 'SETTINGS'
    | 'SOCIAL'
    | 'PHONE'
    | 'TASKS'
    | 'SKILLS'
    | 'STORY'
    | 'CONTRACT'
    | 'LOOT'
    | 'LOOT_VAULT'
    | 'FAMILIA'
    | 'PRESENT'
    | 'PARTY'
    | 'MAP'
    | 'MEMORY'
    | 'WORLD'
    | 'SAVE_MANAGER'
    | 'NOTES'
    | null;

export const GameInterface: React.FC<GameInterfaceProps> = ({ onExit, initialState }) => {
  const {
      gameState, setGameState,
      settings, saveSettings,
      commandQueue, pendingCommands, addToQueue, removeFromQueue,
      currentOptions, lastAIResponse, lastAIThinking, isProcessing, isStreaming, isPhoneProcessing, phoneProcessingThreadId, phoneProcessingScope,
      draftInput, setDraftInput,
      memorySummaryState, confirmMemorySummary, applyMemorySummary, cancelMemorySummary,
      handlePlayerAction, handlePlayerInput, handleSendMessage, handleCreateMoment, handleCreatePublicPost, handleCreateThread, handleMarkThreadRead, handleSilentWorldUpdate, handleWaitForPhoneReply,
      stopInteraction, handleEditLog, handleDeleteLog, handleEditUserLog, handleUpdateLogText, handleUserRewrite,
      manualSave, loadGame, handleReroll, handleDeleteTask,
      handleEditPhoneMessage, handleDeletePhoneMessage,
      phoneNotifications,
  } = useGameLogic(initialState, onExit);

  // Modal States
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'CHAT' | 'CHAR' | 'INV' | 'MAP' | 'MENU'>('CHAT');
  const [settingsView, setSettingsView] = useState<string>('MAIN');

  const closeModal = () => setActiveModal(null);
  const openSettings = (view: string = 'MAIN') => {
      setSettingsView(view);
      setActiveModal('SETTINGS');
  };

  // Helper to handle commands that need to update state directly (like equipping)
  const handleUpdateConfidant = (id: string, updates: Partial<Confidant>) => {
      const newConfidants = gameState.社交.map(c => c.id === id ? { ...c, ...updates } : c);
      setGameState({ ...gameState, 社交: newConfidants });
  };

  const queueEquipItem = (item: InventoryItem) => {
      const slotKey = getDefaultEquipSlot(item);
      addToQueue(`装备物品: ${item.名称}`, undefined, `equip_${slotKey}`, {
          kind: 'EQUIP',
          slotKey,
          itemId: item.id,
          itemName: item.名称
      });
  };

  const queueUnequipItem = (slotKey: string, itemName?: string, itemId?: string) => {
      addToQueue(`卸下装备: ${itemName || slotKey}`, undefined, `equip_${slotKey}`, {
          kind: 'UNEQUIP',
          slotKey,
          itemId,
          itemName
      });
  };

  const queueUseItem = (item: InventoryItem) => {
      addToQueue(`使用物品: ${item.名称}`, undefined, undefined, {
          kind: 'USE',
          itemId: item.id,
          itemName: item.名称,
          quantity: 1
      });
  };

  const handleEquipItem = (item: InventoryItem) => {
      queueEquipItem(item);
  };

  const isHellMode = gameState.游戏难度 === Difficulty.HELL;
  const hasMagicPhone = (gameState.背包 || []).some(item => item.名称 === '魔石通讯终端');
  const activeCommands = isProcessing ? pendingCommands : commandQueue;

  const previewState = useMemo(
      () => buildPreviewState(gameState, activeCommands as any),
      [gameState, activeCommands]
  );
  const locationHierarchy = useMemo(
      () => resolveLocationHierarchy(gameState.地图, gameState.当前地点),
      [gameState.地图, gameState.当前地点]
  );

  const activeTaskCount = (gameState.任务 || []).filter(t => t.状态 === 'active').length;
  const unreadPhoneCount = (gameState.手机?.对话
      ? [...(gameState.手机?.对话?.私聊 || []), ...(gameState.手机?.对话?.群聊 || []), ...(gameState.手机?.对话?.公共频道 || [])]
            .reduce((sum, t) => sum + (t.未读 || 0), 0)
      : 0);
  const partyCount = (gameState.社交 || []).filter(c => c.是否队友).length + 1;
  const presentCount = (gameState.社交 || []).filter(c => c.是否在场).length;
  const inventoryWeight = computeInventoryWeight(previewState.背包 || []);
  const maxCarry = computeMaxCarry(previewState.角色);
  const lootCount = (gameState.公共战利品?.length || 0) + (gameState.战利品?.length || 0);

  const centerPanelProps = {
      logs: gameState.日志,
      combatState: gameState.战斗,
      playerStats: previewState.角色,
      skills: gameState.角色.技能,
      magic: gameState.角色.魔法,
      inventory: previewState.背包,
      confidants: gameState.社交,
      onSendMessage: handlePlayerInput,
      onReroll: handleReroll,
      lastRawResponse: lastAIResponse,
      lastThinking: lastAIThinking,
      onPlayerAction: handlePlayerAction,
      isProcessing,
      isStreaming,
      commandQueue: activeCommands,
      onRemoveCommand: isProcessing ? undefined : removeFromQueue,
      onEditLog: handleEditLog,
      onDeleteLog: handleDeleteLog,
      onEditUserLog: handleEditUserLog,
      onUpdateLogText: handleUpdateLogText,
      handleUserRewrite: handleUserRewrite,
      onStopInteraction: stopInteraction,
      draftInput,
      setDraftInput,
      actionOptions: currentOptions,
      fontSize: settings.fontSize,
      chatLogLimit: settings.chatLogLimit ?? 30,
      enableCombatUI: settings.enableCombatUI,
      isHellMode,
  };

  return (
    <div 
        data-theme={isHellMode ? 'hell' : 'default'}
        className="w-full h-dvh flex flex-col bg-zinc-950 overflow-hidden relative" 
        style={{ backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
    >
        {phoneNotifications.length > 0 && (
            <div className="absolute top-4 right-4 z-50 space-y-2 pointer-events-none">
                {phoneNotifications.map(note => (
                    <div key={note.id} className="bg-black/90 border border-blue-500 text-white px-4 py-2 rounded shadow-lg text-xs">
                        <div className="font-bold uppercase tracking-widest text-blue-300">{note.title}</div>
                        <div className="text-zinc-300 mt-1">{note.message}</div>
                    </div>
                ))}
            </div>
        )}
        <div className="hidden md:flex flex-col h-full">
            <TopNav 
                time={gameState.游戏时间} 
                location={gameState.当前地点}
                locationHierarchy={locationHierarchy}
                floor={gameState.当前楼层} 
                weather={gameState.天气} 
                coords={gameState.世界坐标}
                isHellMode={isHellMode}
            />
            
            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden z-10">
                <div className="contents animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <LeftPanel stats={previewState.角色} isHellMode={isHellMode} difficulty={gameState.游戏难度} />
                    
                    <CenterPanel {...centerPanelProps} />

                    <RightPanel 
                        onOpenInventory={() => setActiveModal('INVENTORY')}
                        onOpenEquipment={() => setActiveModal('EQUIPMENT')}
                        onOpenSettings={() => openSettings('MAIN')}
                        onOpenSocial={() => setActiveModal('SOCIAL')}
                        onOpenTasks={() => setActiveModal('TASKS')}
                        onOpenSkills={() => setActiveModal('SKILLS')}
                        onOpenMap={() => setActiveModal('MAP')}
                        onOpenLibrary={() => openSettings('LIBRARY')}
                        onOpenPhone={() => hasMagicPhone && setActiveModal('PHONE')}
                        onOpenWorld={() => setActiveModal('WORLD')}
                        onOpenFamilia={() => setActiveModal('FAMILIA')}
                        onOpenStory={() => setActiveModal('STORY')}
                        onOpenContract={() => setActiveModal('CONTRACT')}
                        onOpenLoot={() => setActiveModal('LOOT')}
                        onOpenLootVault={() => setActiveModal('LOOT_VAULT')}
                        onOpenMemory={() => setActiveModal('MEMORY')}
                        onOpenPresent={() => setActiveModal('PRESENT')}
                        onOpenParty={() => setActiveModal('PARTY')}
                        onOpenSaveManager={() => setActiveModal('SAVE_MANAGER')}
                        isHellMode={isHellMode}
                        hasPhone={hasMagicPhone}
                        phoneProcessing={isPhoneProcessing}
                        phoneProcessingScope={phoneProcessingScope}
                        summary={{
                            activeTasks: activeTaskCount,
                            unreadMessages: unreadPhoneCount,
                            partySize: partyCount,
                            presentCount,
                            inventoryWeight: Math.round(inventoryWeight * 10) / 10,
                            maxCarry: Math.round(maxCarry * 10) / 10,
                            lootCount
                        }}
                        onOpenNotes={() => setActiveModal('NOTES')}
                    />
                </div>
            </div>
            <BottomBanner isHellMode={isHellMode} announcements={gameState.世界?.头条新闻} />
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col h-full w-full">
            <MobileTopNav 
                time={gameState.游戏时间} 
                location={gameState.当前地点}
                locationHierarchy={locationHierarchy}
                floor={gameState.当前楼层} 
                weather={gameState.天气}
                coords={gameState.世界坐标}
                isHellMode={isHellMode}
            />
            <div className="flex-1 relative overflow-hidden w-full">
                 {mobileActiveTab === 'CHAT' && (
                     <CenterPanel {...centerPanelProps} className="border-none w-full" />
                 )}
                 {mobileActiveTab === 'INV' && (
                     <MobileInventoryView 
                        items={previewState.背包}
                        equipment={previewState.角色.装备}
                        onEquipItem={queueEquipItem}
                        onUnequipItem={queueUnequipItem}
                        onUseItem={queueUseItem}
                     />
                 )}
                 {mobileActiveTab === 'CHAR' && (
                     <div className="h-full overflow-y-auto bg-zinc-950 p-4">
                         <LeftPanel stats={previewState.角色} className="w-full border-none shadow-none" isHellMode={isHellMode} difficulty={gameState.游戏难度} />
                     </div>
                 )}
                 {mobileActiveTab === 'MAP' && (
                     <MobileMapView 
                        worldMap={gameState.地图}
                        currentPos={gameState.世界坐标}
                        playerName={gameState.角色.姓名}
                        confidants={gameState.社交}
                        floor={gameState.当前楼层} 
                        location={gameState.当前地点}
                     />
                 )}
                 {mobileActiveTab === 'MENU' && (
                     <MobileMenuOverlay 
                        isOpen={true} 
                        onClose={() => setMobileActiveTab('CHAT')}
                        hasPhone={hasMagicPhone}
                        actions={{
                            onOpenSettings: () => openSettings('MAIN'),
                            onOpenEquipment: () => setActiveModal('EQUIPMENT'),
                            onOpenSocial: () => setActiveModal('SOCIAL'),
                            onOpenTasks: () => setActiveModal('TASKS'),
                            onOpenSkills: () => setActiveModal('SKILLS'),
                            onOpenPhone: () => hasMagicPhone && setActiveModal('PHONE'),
                            onOpenWorld: () => setActiveModal('WORLD'),
                            onOpenFamilia: () => setActiveModal('FAMILIA'),
                            onOpenStory: () => setActiveModal('STORY'),
                            onOpenContract: () => setActiveModal('CONTRACT'),
                            onOpenLoot: () => setActiveModal('LOOT'),
                            onOpenLootVault: () => setActiveModal('LOOT_VAULT'),
                            onOpenSaveManager: () => setActiveModal('SAVE_MANAGER'),
                            onOpenMemory: () => setActiveModal('MEMORY'),
                            onOpenLibrary: () => openSettings('LIBRARY'),
                            onOpenPresent: () => setActiveModal('PRESENT'),
                            onOpenParty: () => setActiveModal('PARTY'),
                            onOpenNotes: () => setActiveModal('NOTES'),
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
            items={previewState.背包} 
            equipment={previewState.角色.装备} 
            onEquipItem={handleEquipItem} 
            onUnequipItem={queueUnequipItem} 
            onUseItem={queueUseItem}
        />

        <EquipmentModal 
            isOpen={activeModal === 'EQUIPMENT'} 
            onClose={closeModal} 
            equipment={previewState.角色.装备}
            inventory={previewState.背包}
            onUnequipItem={queueUnequipItem}
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
            phoneState={gameState.手机}
            contacts={gameState.社交}
            npcTracking={gameState.世界?.NPC后台跟踪}
            playerName={gameState.角色.姓名}
            hasPhone={hasMagicPhone}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditPhoneMessage}
            onDeleteMessage={handleDeletePhoneMessage}
            onCreateThread={handleCreateThread}
            onReadThread={handleMarkThreadRead}
            onCreateMoment={(content, imageDesc) => handleCreateMoment(content, imageDesc)}
            onCreatePublicPost={(content, imageDesc, topic) => handleCreatePublicPost(content, imageDesc, topic)}
            onWaitReply={handleWaitForPhoneReply}
            isPhoneProcessing={isPhoneProcessing}
            phoneProcessingThreadId={phoneProcessingThreadId}
            phoneProcessingScope={phoneProcessingScope}
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
            magic={gameState.角色.魔法}
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
            items={gameState.公共战利品} 
            carrier={gameState.战利品背负者}
        />

        <LootVaultModal
            isOpen={activeModal === 'LOOT_VAULT'}
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

        <NotesModal
            isOpen={activeModal === 'NOTES'}
            onClose={closeModal}
            notes={gameState.笔记}
            onUpdateNotes={(notes) => setGameState(prev => ({ ...prev, 笔记: notes }))}
        />

        <DynamicWorldModal 
            isOpen={activeModal === 'WORLD'} 
            onClose={closeModal} 
            worldState={gameState.世界}
            gameTime={gameState.游戏时间}
            onSilentWorldUpdate={handleSilentWorldUpdate}
        />

        <MemorySummaryModal
            isOpen={!!memorySummaryState}
            phase={memorySummaryState?.phase || 'preview'}
            type={memorySummaryState?.type || 'S2M'}
            entries={memorySummaryState?.entries || []}
            summary={memorySummaryState?.summary}
            onConfirm={confirmMemorySummary}
            onApply={applyMemorySummary}
            onCancel={cancelMemorySummary}
        />

        <SaveManagerModal
            isOpen={activeModal === 'SAVE_MANAGER'}
            onClose={closeModal}
            gameState={gameState}
            onSaveGame={manualSave}
            onLoadGame={loadGame}
            onUpdateGameState={setGameState}
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
            initialView={settingsView as any}
        />
    </div>
  );
};
