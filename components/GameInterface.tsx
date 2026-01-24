
import React, { useMemo, useState } from 'react';
import { GameState, Difficulty, InventoryItem } from '../types';
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

import { useGameLogic } from '../hooks/useGameLogic';

interface GameInterfaceProps {
    onExit: () => void;
    initialState?: GameState;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ onExit, initialState }) => {
  const {
      gameState, setGameState,
      settings, saveSettings,
      commandQueue, pendingCommands, addToQueue, removeFromQueue,
      currentOptions, lastAIResponse, isProcessing, isStreaming,
      draftInput, setDraftInput,
      memorySummaryState, confirmMemorySummary, applyMemorySummary, cancelMemorySummary,
      handlePlayerAction, handlePlayerInput, handleSendMessage, handleCreateMoment, handleSilentWorldUpdate,
      stopInteraction, handleEditLog, handleDeleteLog, handleEditUserLog, handleUpdateLogText, handleUserRewrite,
      manualSave, loadGame, handleReroll, handleDeleteTask
  } = useGameLogic(initialState, onExit);

  // Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'CHAT' | 'CHAR' | 'INV' | 'MAP' | 'MENU'>('CHAT');
  const [settingsView, setSettingsView] = useState<string>('MAIN');

  const closeModal = () => setActiveModal(null);
  const openSettings = (view: string = 'MAIN') => {
      setSettingsView(view);
      setActiveModal('SETTINGS');
  };

  // Helper to handle commands that need to update state directly (like equipping)
  const handleUpdateConfidant = (id: string, updates: any) => {
      const newConfidants = gameState.社交.map(c => c.id === id ? { ...c, ...updates } : c);
      setGameState({ ...gameState, 社交: newConfidants });
  };

  const queueEquipItem = (item: InventoryItem) => {
      const slotKey = item.装备槽位 || (item.类型 === 'weapon' ? '主手' : '身体');
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

  const previewState = useMemo(() => {
      if (!activeCommands || activeCommands.length === 0) return gameState;

      const next = {
          ...gameState,
          角色: { ...gameState.角色, 装备: { ...(gameState.角色?.装备 || {}) } },
          背包: Array.isArray(gameState.背包) ? gameState.背包.map(item => ({ ...item })) : []
      };

      const findItemIndex = (itemId?: string, itemName?: string) => {
          if (itemId) {
              const idx = next.背包.findIndex(i => i.id === itemId);
              if (idx >= 0) return idx;
          }
          if (itemName) return next.背包.findIndex(i => i.名称 === itemName);
          return -1;
      };

      const resolveSlotKey = (cmd: any, item?: any) => {
          if (cmd.slotKey) return cmd.slotKey;
          if (item?.装备槽位) return item.装备槽位;
          if (item?.类型 === 'weapon') return '主手';
          if (item?.类型 === 'armor') return '身体';
          return '';
      };

      activeCommands.forEach((cmd: any) => {
          if (cmd.kind === 'EQUIP') {
              const idx = findItemIndex(cmd.itemId, cmd.itemName);
              const item = idx >= 0 ? next.背包[idx] : null;
              const slotKey = resolveSlotKey(cmd, item);
              if (slotKey) {
                  next.角色.装备[slotKey] = cmd.itemName || item?.名称 || next.角色.装备[slotKey];
              }
              if (item) {
                  item.已装备 = true;
                  if (slotKey) item.装备槽位 = slotKey;
              }
          } else if (cmd.kind === 'UNEQUIP') {
              const slotKey = cmd.slotKey;
              if (slotKey) next.角色.装备[slotKey] = '';
              const idx = findItemIndex(cmd.itemId, cmd.itemName);
              const item = idx >= 0 ? next.背包[idx] : null;
              if (item) {
                  item.已装备 = false;
                  item.装备槽位 = undefined;
              }
          } else if (cmd.kind === 'USE') {
              const idx = findItemIndex(cmd.itemId, cmd.itemName);
              if (idx >= 0) {
                  const item = next.背包[idx];
                  const nextQty = (item.数量 || 1) - (cmd.quantity || 1);
                  if (nextQty <= 0) next.背包.splice(idx, 1);
                  else item.数量 = nextQty;
              }
          }
      });

      return next;
  }, [gameState, activeCommands]);

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
                    <LeftPanel stats={previewState.角色} isHellMode={isHellMode} difficulty={gameState.游戏难度} />
                    
                    <CenterPanel 
                        logs={gameState.日志} 
                        combatState={gameState.战斗}
                        playerStats={previewState.角色}
                        skills={gameState.角色.技能}
                        inventory={previewState.背包} 
                        confidants={gameState.社交} 
                        onSendMessage={handlePlayerInput}
                        onReroll={handleReroll}
                        lastRawResponse={lastAIResponse}
                        onPlayerAction={handlePlayerAction}
                        isProcessing={isProcessing}
                        isStreaming={isStreaming}
                        commandQueue={activeCommands}
                        onRemoveCommand={isProcessing ? undefined : removeFromQueue}
                        
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
                        chatLogLimit={settings.chatLogLimit ?? 30}
                        enableCombatUI={settings.enableCombatUI} 
                        isHellMode={isHellMode}
                    />

                    <RightPanel 
                        onOpenInventory={() => setActiveModal('INVENTORY')}
                        onOpenEquipment={() => setActiveModal('EQUIPMENT')}
                        onOpenSettings={() => openSettings('MAIN')}
                        onOpenSocial={() => setActiveModal('SOCIAL')}
                        onOpenTasks={() => setActiveModal('TASKS')}
                        onOpenSkills={() => setActiveModal('SKILLS')}
                        onOpenMap={() => setActiveModal('MAP')}
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
                floor={gameState.当前楼层} 
                weather={gameState.天气}
                isHellMode={isHellMode}
            />
            <div className="flex-1 relative overflow-hidden w-full">
                 {mobileActiveTab === 'CHAT' && (
                     <CenterPanel 
                        logs={gameState.日志} 
                        combatState={gameState.战斗}
                        playerStats={previewState.角色}
                        skills={gameState.角色.技能}
                        inventory={previewState.背包}
                        confidants={gameState.社交} 
                        onSendMessage={handlePlayerInput}
                        onReroll={handleReroll}
                        lastRawResponse={lastAIResponse}
                        onPlayerAction={handlePlayerAction}
                        isProcessing={isProcessing}
                        isStreaming={isStreaming}
                        commandQueue={activeCommands}
                        onRemoveCommand={isProcessing ? undefined : removeFromQueue}
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
                        chatLogLimit={settings.chatLogLimit ?? 30}
                        className="border-none w-full"
                        enableCombatUI={settings.enableCombatUI}
                        isHellMode={isHellMode}
                    />
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
            messages={gameState.短信}
            contacts={gameState.社交}
            moments={gameState.动态}
            phoneState={gameState.魔石通讯终端}
            hasPhone={hasMagicPhone}
            onSendMessage={(text, channel, target) => handleSendMessage(`[短信/${channel}] To ${target || 'Anyone'}: ${text}`)}
            onCreateGroup={(name, members) => addToQueue(`创建群组: ${name}, 成员: ${members.join(',')}`)}
            onCreateMoment={(content, imageDesc) => handleCreateMoment(content, imageDesc)}
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
