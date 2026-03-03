import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Skull, Users, Swords, Shield, Zap, ChevronRight, ChevronLeft, RotateCcw, Plus, Minus, Dices, AlertTriangle, Trophy, X, Settings, Play, Eye, EyeOff, LogOut } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, get } from 'firebase/database';

// ==================== FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyAxNrnadFwBriZhwpLBdszENbU9j7XTde4",
  authDomain: "hordmod-3de14.firebaseapp.com",
  databaseURL: "https://hordmod-3de14-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hordmod-3de14",
  storageBucket: "hordmod-3de14.firebasestorage.app",
  messagingSenderId: "783226109508",
  appId: "1:783226109508:web:22f1def2c0d6b20e1f8611",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ==================== GAME DATA ====================
const FACTIONS = [
'Space Marines', 'Adepta Sororitas', 'Adeptus Mechanicus', 'Adeptus Custodes',
'Grey Knights', 'Astra Militarum', 'Imperial Knights', 'Chaos Knights',
'Chaos Space Marines', 'Chaos Daemons', 'Thousand Sons', 'Death Guard',
'World Eaters', 'Aeldari', 'Drukhari', 'Necrons', 'T\'au Empire', 'Orks',
'Leagues of Votann', 'Tyranids', 'Genestealer Cults'
];
const HORDE_FACTION_RULES = {
'Space Marines': { name: 'Transhuman Skills', effect: 'Reroll hit rolls of 1 for Horde Adeptus Astartes models.' },
'Adepta Sororitas': { name: 'Martyrs and Miracles', effect: 'In round 4+, first Spawn Roll is automatically 12.' },
'Adeptus Mechanicus': { name: 'Third Try\'s the Charm', effect: 'Improve BS by 1. Ranged weapons have Assault.' },
'Adeptus Custodes': { name: 'Best of the Best', effect: 'Melee weapons have [Lethal Hits].' },
'Grey Knights': { name: 'Poor Hammers', effect: 'Melee vs Vehicle/Monster: -1 hit, +4 Strength.' },
'Astra Militarum': { name: 'Unanimous Orders', effect: 'Within 6" of Officer: +1 BS.' },
'Imperial Knights': { name: 'Passive Ion Shields', effect: 'Feel no Pain 6+.' },
'Chaos Knights': { name: 'God I Wish We Had A Different Theme', effect: 'Vs Battle-shocked: +1 Hit and Wound.' },
'Chaos Space Marines': { name: 'Wonton Slaughter', effect: '+1 Attacks on charge turn.' },
'Chaos Daemons': { name: 'Shadow Forms', effect: '-1 to hit from 12"+ ranged attacks.' },
'Thousand Sons': { name: 'Psychic Storms', effect: 'Start of Shooting: D3 MW to units within 12".' },
'Death Guard': { name: 'Don\'t You Miss DR?', effect: 'Enemies within 6": -1 T, BS, WS.' },
'World Eaters': { name: 'Bloodthirsty', effect: '+2" Move.' },
'Aeldari': { name: 'Monomolecular Ammunition', effect: 'Ranged attacks: +1 AP.' },
'Drukhari': { name: 'Monomolecular Edges', effect: 'Melee attacks: +1 AP.' },
'Necrons': { name: 'We\'re So Back', effect: 'Non-Character Infantry/Beast/Swarm: FNP 5+.' },
'T\'au Empire': { name: 'Glasses', effect: 'When shooting, 4+: +1 BS.' },
'Orks': { name: 'High (Green) Tide', effect: 'Round 3: +1 Misery, +1 Spawn, +3" Move.' },
'Leagues of Votann': { name: 'Grudge Game', effect: 'Mark units that destroy Votann. +1 Hit/Wound vs marked.' },
'Tyranids': { name: 'Neurons Activated', effect: 'Battle-shock on 3D6. Melee: +1 Strength.' },
'Genestealer Cults': { name: 'Should Have Just Been A 5+ FNP', effect: 'Destroyed Infantry/Mounted: 5+ returns next round.' }
};
const MISERY_CARDS = [
  { id: 1, name: 'Unnatural Stamina', effect: 'Horde units can shoot and charge after advancing.' },
  { id: 2, name: 'Grudge Match', effect: '+1 to hit and wound for Horde attacks.' },
  { id: 3, name: 'Rip and Tear', effect: '+1 AP for Horde attacks.' },
  { id: 4, name: 'Blistering Speed', effect: 'Horde advance = 6, charge = 12 (no rolling).' },
  { id: 5, name: 'Untouchable', effect: 'Horde models have 3+ invulnerable save.' },
  { id: 6, name: 'Stray Orbital Bombardment', effect: 'Split battlefield 2x3. Roll D6, units in that area take 2D3 MW.' },
  { id: 7, name: 'Unlucky Night', effect: 'Spawn Rolls: roll 3D6, drop lowest.' },
  { id: 8, name: 'Death Denied', effect: 'All Horde units return to starting strength and full wounds.' },
  { id: 9, name: 'Terrifying Shockwave', effect: 'Player units auto-fail Battle-shock.' },
  { id: 10, name: 'Planetquake', effect: 'Random terrain: units inside take 2D3 MW, destroy terrain.' },
  { id: 11, name: 'Errant Explosion', effect: 'Destroy one random objective in No Man\'s Land.' },
  { id: 12, name: 'Nowhere is Safe', effect: 'Destroy all objectives in Defender\'s deployment zone.' },
  { id: 13, name: 'Pincer Maneuver', effect: 'Spawn extra Horde unit via Deep Strike in player deployment if possible.' },
  { id: 14, name: 'No Hard Feelings', effect: 'Random player\'s SP set to 0. (Solo: draw 2 more Misery)' },
  { id: 15, name: 'Bad Investment', effect: 'Remove 5SP from all players.' },
  { id: 16, name: 'Fair and Balanced', effect: 'Horde weapons have [Devastating Wounds].' },
  { id: 17, name: 'Unfettered Fury', effect: 'Horde weapons have [Sustained Hits 1] and [Lethal Hits].' },
  { id: 18, name: 'A Worthless Sacrifice', effect: 'Vote to destroy a player unit. If not unanimous, random from voted.' },
  { id: 19, name: 'Fog of War', effect: 'Horde gains Stealth and Benefit of Cover.' },
  { id: 20, name: 'Lamentable Luck', effect: 'Reveal 2 more Misery cards.' },
  { id: 21, name: 'Bunkers Busted', effect: 'Remove all Fortified markers. No Fortify purchases.' },
  { id: 22, name: 'Comms Jammed', effect: 'No Stratagems or CP. No Supply/Spawn/Strike purchases.' },
  { id: 23, name: 'The Mind Killer', effect: 'Remove all Enhancements. All units test Battle-shock. No Tactics purchases.' },
  { id: 24, name: 'Seller\'s Market', effect: 'SP costs doubled.' },
  { id: 25, name: 'Hotter Shots', effect: 'Non-Melta ranged weapons have [Melta 1].' },
  { id: 26, name: 'Sinking Showboats', effect: 'Horde ranged weapons have Precision.' },
  { id: 27, name: 'Chitinous Growths', effect: 'Attacks against Horde: -1 AP.' },
  { id: 28, name: 'They Fly Now', effect: 'Horde has Fly, ignores vertical, ignores terrain for visibility.' },
  { id: 29, name: 'Fate\'s Fetters', effect: '-4SP from highest player. Reveal 3 extra Secondaries. No Secondary purchases.' },
  { id: 30, name: 'Aim for the Heads', effect: 'Destroyed Horde model: 4+ stays, fights/shoots, then removed.' },
  { id: 31, name: 'Debris Storm', effect: 'Ranged vs Horde needs unmodified 6 unless within 12".' },
  { id: 32, name: 'Glowing Eyes', effect: 'Horde attacks may reroll hit rolls.' }
];
const SECONDARY_MISSIONS = [
  { id: 1, name: 'Secure Drop Zones', condition: 'Control 2 random No Man\'s Land objectives at end of round.', reward: '3SP + Tactics card', punishment: '+1 Misery' },
  { id: 2, name: 'Back To Basics', condition: 'Destroy at least 1 Horde unit this round.', reward: '(X+1)SP where X=units destroyed', punishment: '+2 Misery' },
  { id: 3, name: 'Show No Fear', condition: 'No player units Battle-shocked at end of round.', reward: '3SP, -1 Spawn Roll', punishment: '+2 Misery, +1 Spawn' },
  { id: 4, name: 'Establish Orbital Comms', condition: 'Complete action within 6" of center.', reward: 'All players use A Change of Plans', punishment: 'Random A Change of Plans' },
  { id: 5, name: 'Search for Supplies', condition: 'Complete Search action on objectives in NML/enemy zone.', reward: '(X+1)SP + Supply card', punishment: '+2 Misery' },
  { id: 6, name: 'Clear the Evac Zone', condition: 'No Horde in Defender deployment at end of round.', reward: '3SP', punishment: 'Reinforcements Arrive removed' },
  { id: 7, name: 'Decapitation Strike', condition: 'Destroy Horde Character (or none exist).', reward: '2SP, 2CP', punishment: '+2 Misery' },
  { id: 8, name: 'Dragon Slayer', condition: 'Destroy Horde Monster/Vehicle (or none exist).', reward: 'Free Field Promotion or 2SP', punishment: '+6 first Spawn Roll' },
  { id: 9, name: 'Paint Targets', condition: 'No fallback, no moving off controlled objectives.', reward: 'Free Air Strike + Defensive Positions', punishment: 'Stray Orbital Bombardment' },
  { id: 10, name: 'Study Behaviors', condition: 'Random Horde unit takes no wounds this round.', reward: '2SP + Misery cancel card', punishment: '+3 Spawn Roll' },
  { id: 11, name: 'Use It Or Lose It', condition: 'Spend more than 6SP this round. (Not round 1)', reward: '10SP to random player', punishment: '-3SP, +1 Misery' },
  { id: 12, name: 'Control the Battlefield', condition: 'Unit in each table quarter outside 6" of center.', reward: '-1 Spawn, Secondary card', punishment: '+1 Misery, +1 Spawn' },
  { id: 13, name: 'The Smell of Napalm', condition: 'Make 2 Strike purchases. (Not round 1)', reward: '2SP, -1 Spawn', punishment: '+1 Misery, +1 Spawn' },
  { id: 14, name: 'Marching on Stomachs', condition: 'Make 2 Supply purchases. (Not round 1)', reward: '1SP + Reinforcements discount card', punishment: '+1 Misery, Horde heals 3' },
  { id: 15, name: 'Baiting the Trap', condition: 'Complete action within 6" of center.', reward: '4SP, +12 first Spawn', punishment: '+2 Misery, +2 Spawn' },
  { id: 16, name: 'Lead From the Front', condition: 'Characters deal damage (max 4) and survive.', reward: 'XSP (damage dealt)', punishment: '+1 Misery, -1 Battle-shock' },
  { id: 17, name: 'Spruce This Place Up', condition: '2+ Fortified objectives at end. (Not round 1)', reward: '1SP + Misery cancel card', punishment: '+1 Misery, remove Fortified' },
  { id: 18, name: 'Calling Shots', condition: 'Mark X Horde units, destroy exactly X.', reward: '(X×2)SP', punishment: '+X Misery, +X Spawn' },
  { id: 19, name: 'Dive Into Hell', condition: 'Unit from Reserves survives round. (Not round 1)', reward: '1SP + Strike card', punishment: '+1 Misery' },
  { id: 20, name: 'Insane Gambit', condition: 'Complete Scuttle action to destroy an objective.', reward: '4SP + Fortify card', punishment: '+2 Misery' }
];
const SECRET_OBJECTIVES = [
  { id: 1, name: 'Forward Extraction', condition: 'End game with unit wholly in Horde Spawning Zone.', tags: ['End of Game'] },
  { id: 2, name: 'A Noble Sacrifice', condition: 'Reveal when you have unit on objective in Attacker zone.', tags: ['Early Reveal'] },
  { id: 3, name: 'Cleanse Sacred Ground', condition: 'Control NML objective alone (no other players/Horde).', tags: ['End of Game'] },
  { id: 4, name: 'Take Research Subjects', condition: 'Reveal after destroying enemy in Fight in Defender zone.', tags: ['Early Reveal'] },
  { id: 5, name: 'Recover the Lost Relic', condition: 'Complete action within 6" of center (round 2+). Survive.', tags: ['Action', 'Early Reveal', 'Survival Required'] },
  { id: 6, name: 'Two Birds, One Stone', condition: 'End game with another player not surviving.', tags: ['End of Game', 'Multiplayer', 'Traitor'] },
  { id: 7, name: 'Team Player', condition: 'End game with all players surviving.', tags: ['End of Game', 'Multiplayer'] },
  { id: 8, name: 'Majority Rules', condition: 'End game with most units on battlefield.', tags: ['End of Game', 'Multiplayer', 'Traitor'] },
  { id: 9, name: 'VIP', condition: 'End game with Warlord on battlefield.', tags: ['End of Game'] },
  { id: 10, name: 'Rear Extraction', condition: 'End game with all units in Defender deployment.', tags: ['End of Game'] },
  { id: 11, name: 'Show Off', condition: 'End game with 12+ Supply Points.', tags: ['End of Game'] },
  { id: 12, name: 'Kill Confirmed', condition: 'Reveal after Horde Character dies in engagement with your Character.', tags: ['Early Reveal'] },
  { id: 13, name: 'Master Sculptor', condition: 'Use Air Strike + Defensive Positions 5 total times. Survive.', tags: ['Secret Tally', 'Early Reveal', 'Survival Required'] },
  { id: 14, name: 'Hand of Fate', condition: 'Succeed in 7+ Secondary Objectives.', tags: ['End of Game'] },
  { id: 15, name: 'Saboteur', condition: 'Reveal at end of round 5 if any Secondary failed. Survive.', tags: ['Early Reveal', 'Multiplayer', 'Traitor', 'Survival Required'] },
  { id: 16, name: 'Hold the Line', condition: 'No Horde in Defender zone at end of game.', tags: ['End of Game'] },
  { id: 17, name: 'Pure Spite', condition: 'Reveal after another player\'s Warlord dies.', tags: ['Early Reveal', 'Multiplayer', 'Traitor'] },
  { id: 18, name: 'Aspect of Change', condition: 'End game with 2 Field Promotion units on battlefield.', tags: ['End of Game'] },
  { id: 19, name: 'Benevolence', condition: 'Use Share Supplies 5 times.', tags: ['Secret Tally', 'Early Reveal', 'Multiplayer'] },
  { id: 20, name: 'Tacticool', condition: 'Use 1+ CP Stratagem 8 times. Survive.', tags: ['Secret Tally', 'Early Reveal', 'Survival Required'] },
  { id: 21, name: 'Camp Counselor', condition: 'Remove Battle-shock via Pizza Party 2 times. Survive.', tags: ['Secret Tally', 'Early Reveal', 'Multiplayer', 'Survival Required'] },
  { id: 22, name: 'Adornable', condition: 'Fortify 3 objectives. Survive.', tags: ['Secret Tally', 'Early Reveal', 'Survival Required'] },
  { id: 23, name: 'Acceptable Collateral', condition: 'Artillery Strike kills Horde AND player model. Survive.', tags: ['Early Reveal', 'Multiplayer', 'Traitor', 'Survival Required'] },
  { id: 24, name: 'Action Hero', condition: 'Complete any Secondary action (or none drawn).', tags: ['Early Reveal'] },
  { id: 25, name: 'Triangulate Signal', condition: '3 units on 3 objectives (no Horde), complete action.', tags: ['Action', 'Early Reveal'] },
  { id: 26, name: 'Destroy the Evidence', condition: 'Round 3: Destroy unit, objective, deal D6 MW in 9".', tags: ['Action', 'Early Reveal', 'Multiplayer', 'Traitor'] },
  { id: 27, name: 'Lancelot', condition: 'Destroy 4 Monster/Vehicle/Character (10W=2, Titanic=3).', tags: ['Secret Tally', 'Early Reveal'] },
  { id: 28, name: 'Chaos Incarnate', condition: '9 Misery cards activated. Another player survives, you don\'t.', tags: ['Secret Tally', 'Early Reveal', 'Multiplayer', 'Traitor'] },
  { id: 29, name: 'Deus Ex Machina', condition: 'After elimination: use 13 SP/CP helping others.', tags: ['Early Reveal', 'Multiplayer'] },
  { id: 30, name: 'Supervisor', condition: 'Destroy 4+ fewer Horde units than others combined. Survive.', tags: ['Early Reveal', 'Multiplayer', 'Traitor', 'Survival Required'] }
];
const RESUPPLY_OPTIONS = [
  { cost: 1, name: 'A Name Earned', effect: 'Add enhancement to character without one.', tags: ['Tactics'] },
  { cost: 2, name: 'Basic Tactics', effect: 'Gain 1CP.', tags: ['Tactics'] },
  { cost: 3, name: 'Air Strike', effect: 'Select area terrain: units take 2D3 MW, remove terrain.', tags: ['Strike'] },
  { cost: 3, name: 'Forward Operating Base', effect: 'Fortify objective. +1SP per round while controlled.', tags: ['Fortify'] },
  { cost: 3, name: 'Pizza Party', effect: 'Remove Battle-shock from any unit.', tags: ['Tactics', 'Supply'] },
  { cost: 3, name: 'Share Supplies', effect: 'Give 2SP to another player.', tags: ['Tactics'] },
  { cost: 3, name: 'Supply Drop', effect: 'Add new objective to No Man\'s Land.', tags: ['Supply'] },
  { cost: 4, name: 'Arm Experimental Defenses', effect: 'Fortify: Horde within 9" takes 3MW at Fight start.', tags: ['Fortify'] },
  { cost: 4, name: 'Defensive Positions', effect: 'Place 9"x9" ruin anywhere on battlefield.', tags: ['Supply', 'Fortify'] },
  { cost: 4, name: 'Field Hospital', effect: 'Fortify: Heal 3 wounds per unit wholly within range.', tags: ['Fortify'] },
  { cost: 4, name: 'Tempt Fate', effect: 'Reveal second Secondary. Rewards/punishments stack.', tags: ['Secondary'] },
  { cost: 5, name: 'Activate Jamming Station', effect: 'Fortify: -1 to Spawn Rolls while controlled.', tags: ['Fortify'] },
  { cost: 5, name: 'Advanced Tactics', effect: 'Replace active Secondary with new one.', tags: ['Secondary', 'Tactics'] },
  { cost: 5, name: 'Ammo Supplies', effect: 'Fortify: Units within 3" get Sustained Hits 1.', tags: ['Fortify'] },
  { cost: 5, name: 'Emergency Evac', effect: 'Remove unit to Reserves, returns next turn.', tags: ['Tactics'] },
  { cost: 6, name: 'Activate Shield Generator', effect: 'Fortify: 4+ FNP vs ranged from outside.', tags: ['Fortify'] },
  { cost: 6, name: 'Deploy Minefield', effect: 'D6 MW to units moving within 6". Max 10 damage.', tags: ['Supply', 'Strike'] },
  { cost: 8, name: 'A Change of Plans', effect: 'Draw 2 Secret Objectives, pick one.', tags: [] },
  { cost: 8, name: 'Artillery Strike', effect: '9" radius, D6 per model: 5+ = 1MW (3MW for Monster/Vehicle).', tags: ['Strike'] },
  { cost: 12, name: 'Reinforcements Arrive', effect: 'Roll 2D6, spawn unit from your Spawning Table.', tags: ['Spawn'] }
];

// ==================== HELPER FUNCTIONS ====================
const shuffle = (array) => {
const newArray = [...array];
for (let i = newArray.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
return newArray;
};
const rollD6 = () => Math.floor(Math.random() * 6) + 1;
const roll2D6 = () => rollD6() + rollD6();

const getDeviceId = () => {
  let id = localStorage.getItem('hm_device_id');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('hm_device_id', id);
  }
  return id;
};

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ==================== COMPONENTS ====================
const Card = ({ children, className = '', onClick }) => (
<div
className={`bg-gray-800 rounded-lg border border-gray-700 ${onClick ? 'cursor-pointer hover:border-purple-500 transition-colors' : ''} ${className}`}
onClick={onClick}
>
{children}
</div>
);
const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
const baseClasses = 'font-semibold rounded-lg transition-all flex items-center justify-center gap-2';
const sizeClasses = {
sm: 'px-3 py-1.5 text-sm',
md: 'px-4 py-2',
lg: 'px-6 py-3 text-lg'
  };
const variantClasses = {
primary: 'bg-purple-600 hover:bg-purple-700 text-white',
secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
danger: 'bg-red-600 hover:bg-red-700 text-white',
success: 'bg-green-600 hover:bg-green-700 text-white',
ghost: 'bg-transparent hover:bg-gray-700 text-gray-300'
  };
return (
<button
onClick={onClick}
disabled={disabled}
className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
>
{children}
</button>
  );
};

const PlayerCard = ({ player, onUpdateSP, onUpdateCP, isActive, isMyPlayer }) => (
<Card className={`p-4 ${isActive ? 'ring-2 ring-purple-500' : ''}`}>
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<div className={`w-3 h-3 rounded-full ${player.color}`}></div>
<span className="font-bold text-white">{player.name}</span>
</div>
<span className="text-xs text-gray-400">{player.faction}</span>
</div>
<div className="grid grid-cols-2 gap-3">
<div className="bg-gray-900 rounded-lg p-2">
<div className="flex items-center justify-between">
<span className="text-yellow-400 text-xs font-medium">SP</span>
<div className="flex items-center gap-1">
<button onClick={() => onUpdateSP(player.id, -1)} className="text-gray-400 hover:text-white p-0.5">
<Minus size={14} />
</button>
<span className="text-white font-bold w-6 text-center">{player.sp}</span>
<button onClick={() => onUpdateSP(player.id, 1)} className="text-gray-400 hover:text-white p-0.5">
<Plus size={14} />
</button>
</div>
</div>
</div>
<div className="bg-gray-900 rounded-lg p-2">
<div className="flex items-center justify-between">
<span className="text-blue-400 text-xs font-medium">CP</span>
<div className="flex items-center gap-1">
<button onClick={() => onUpdateCP(player.id, -1)} className="text-gray-400 hover:text-white p-0.5">
<Minus size={14} />
</button>
<span className="text-white font-bold w-6 text-center">{player.cp}</span>
<button onClick={() => onUpdateCP(player.id, 1)} className="text-gray-400 hover:text-white p-0.5">
<Plus size={14} />
</button>
</div>
</div>
</div>
</div>
{player.secretObjective && (
<div className="mt-3 p-2 bg-purple-900/30 rounded border border-purple-800">
<div className="flex items-center justify-between">
<span className="text-purple-300 text-xs">Secret Objective</span>
{player.secretRevealed ? <Eye size={12} className="text-purple-400" /> : <EyeOff size={12} className="text-gray-500" />}
</div>
{(isMyPlayer || player.secretRevealed)
  ? <span className="text-white text-sm font-medium">{player.secretObjective.name}</span>
  : <span className="text-gray-500 text-sm italic">Private</span>
}
</div>
    )}
</Card>
);

const MiseryCard = ({ card, onClose }) => (
<Card className="p-4 bg-gradient-to-br from-red-900/50 to-gray-800 border-red-700">
<div className="flex items-start justify-between mb-2">
<div className="flex items-center gap-2">
<Skull className="text-red-500" size={20} />
<span className="text-red-400 text-xs font-medium">MISERY #{card.id}</span>
</div>
{onClose && (
<button onClick={onClose} className="text-gray-400 hover:text-white">
<X size={16} />
</button>
      )}
</div>
<h3 className="text-white font-bold mb-2">{card.name}</h3>
<p className="text-gray-300 text-sm">{card.effect}</p>
</Card>
);

const SecondaryCard = ({ mission, status, onComplete, onFail }) => (
<Card className={`p-4 ${status === 'success' ? 'border-green-600' : status === 'failed' ? 'border-red-600' : 'border-yellow-600'}`}>
<div className="flex items-start justify-between mb-2">
<div className="flex items-center gap-2">
<Trophy className={status === 'success' ? 'text-green-500' : status === 'failed' ? 'text-red-500' : 'text-yellow-500'} size={20} />
<span className="text-yellow-400 text-xs font-medium">SECONDARY #{mission.id}</span>
</div>
</div>
<h3 className="text-white font-bold mb-2">{mission.name}</h3>
<p className="text-gray-300 text-sm mb-3">{mission.condition}</p>
<div className="grid grid-cols-2 gap-2 text-xs mb-3">
<div className="bg-green-900/30 p-2 rounded">
<span className="text-green-400 block mb-1">Reward</span>
<span className="text-gray-300">{mission.reward}</span>
</div>
<div className="bg-red-900/30 p-2 rounded">
<span className="text-red-400 block mb-1">Punishment</span>
<span className="text-gray-300">{mission.punishment}</span>
</div>
</div>
{status === 'active' && (
<div className="flex gap-2">
<Button variant="success" size="sm" onClick={onComplete} className="flex-1">Complete</Button>
<Button variant="danger" size="sm" onClick={onFail} className="flex-1">Fail</Button>
</div>
    )}
</Card>
);

const SpawnRoller = ({ round, spawnModifier, hardMode, onRoll }) => {
const [result, setResult] = useState(null);
const [rolling, setRolling] = useState(false);
const getSpawnModifier = () => {
if (hardMode) {
if (round === 1) return 0;
if (round === 2) return 1;
if (round === 3) return 2;
if (round === 4) return 3;
if (round >= 5) return 3;
    } else {
if (round <= 2) return 0;
if (round <= 4) return 1;
return 2;
    }
return 0;
  };
const baseModifier = getSpawnModifier();
const totalModifier = baseModifier + spawnModifier;
const handleRoll = () => {
setRolling(true);
setTimeout(() => {
const roll = roll2D6();
const modified = roll + totalModifier;
setResult({ roll, modified, isNoSpawn: roll === 2 });
setRolling(false);
onRoll?.(modified, roll === 2);
    }, 500);
  };
const getBracket = (value) => {
if (value <= 2) return 'No Spawn';
if (value <= 4) return '3-4';
if (value <= 6) return '5-6';
if (value <= 9) return '7-9';
return '10+';
  };
return (
<Card className="p-4">
<div className="flex items-center gap-2 mb-3">
<Dices className="text-purple-400" size={20} />
<span className="text-white font-bold">Spawn Roller</span>
</div>
<div className="flex items-center gap-4 mb-4">
<div className="text-sm text-gray-400">
          Round modifier: <span className="text-purple-400 font-bold">+{baseModifier}</span>
</div>
{spawnModifier !== 0 && (
<div className="text-sm text-gray-400">
            Extra: <span className={`font-bold ${spawnModifier > 0 ? 'text-red-400' : 'text-green-400'}`}>
{spawnModifier > 0 ? '+' : ''}{spawnModifier}
</span>
</div>
        )}
<div className="text-sm text-gray-400">
          Total: <span className="text-yellow-400 font-bold">+{totalModifier}</span>
</div>
</div>
<Button onClick={handleRoll} disabled={rolling} className="w-full mb-4">
<Dices size={18} />
{rolling ? 'Rolling...' : 'Roll Spawn'}
</Button>
{result && (
<div className={`p-4 rounded-lg ${result.isNoSpawn ? 'bg-gray-700' : 'bg-purple-900/50'}`}>
<div className="flex items-center justify-between mb-2">
<span className="text-gray-400">Roll: {result.roll}</span>
<span className="text-gray-400">Modified: {result.modified}</span>
</div>
<div className={`text-2xl font-bold text-center ${result.isNoSpawn ? 'text-gray-400' : 'text-purple-400'}`}>
{getBracket(result.isNoSpawn ? 2 : result.modified)}
</div>
{result.isNoSpawn && (
<div className="text-center text-yellow-400 text-sm mt-2">
              ⚠️ Unmodified 2 = No Spawn
</div>
          )}
</div>
      )}
</Card>
  );
};

// ==================== LOBBY SCREEN ====================
const LobbyScreen = ({ onCreateSession, onJoinSession }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    setError('');
    setLoading(true);
    try {
      const snapshot = await get(ref(db, `sessions/${code}`));
      if (!snapshot.exists()) {
        setError('Session not found. Check the code and try again.');
        setLoading(false);
        return;
      }
      const data = snapshot.val();
      if (data.phase === 'ended') {
        setError('This session has already ended.');
        setLoading(false);
        return;
      }
      onJoinSession(code, data);
    } catch (e) {
      setError('Connection error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Skull className="text-red-500 mx-auto mb-3" size={48} />
          <h1 className="text-4xl font-bold text-purple-400 mb-2">HORDE MODE</h1>
          <p className="text-gray-400">40K Cooperative Game Mode Companion</p>
        </div>
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-white font-bold text-lg mb-1">Host a Game</h2>
            <p className="text-gray-400 text-sm mb-4">Create a session and share the code with your players</p>
            <Button onClick={onCreateSession} className="w-full" size="lg">
              <Play size={18} />
              Create Session
            </Button>
          </Card>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>
          <Card className="p-6">
            <h2 className="text-white font-bold text-lg mb-1">Join a Game</h2>
            <p className="text-gray-400 text-sm mb-4">Enter the 4-letter code from your host</p>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && joinCode.length === 4 && handleJoin()}
              maxLength={4}
              placeholder="ABCD"
              className="w-full bg-gray-700 text-white text-3xl text-center font-mono tracking-widest rounded-lg p-3 border border-gray-600 mb-3 uppercase focus:outline-none focus:border-purple-500"
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <Button
              onClick={handleJoin}
              disabled={loading || joinCode.length < 4}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              {loading ? 'Connecting...' : 'Join Session'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==================== WAITING SCREEN ====================
const WaitingScreen = ({ sessionCode }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host</h2>
      <p className="text-gray-400 mb-6">The host is setting up the game...</p>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-1">Session Code</p>
        <p className="text-4xl font-mono font-bold text-purple-400 tracking-widest">{sessionCode}</p>
      </div>
    </div>
  </div>
);

// ==================== SETUP SCREEN ====================
const SetupScreen = ({ onStartGame, sessionCode }) => {
const [gameSize, setGameSize] = useState(1000);
const [playerCount, setPlayerCount] = useState(2);
const [hardMode, setHardMode] = useState(false);
const [hordeFaction, setHordeFaction] = useState('Tyranids');
const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', faction: 'Space Marines', color: 'bg-blue-500' },
    { id: 2, name: 'Player 2', faction: 'Astra Militarum', color: 'bg-green-500' }
]);
const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];
const updatePlayerCount = (count) => {
setPlayerCount(count);
const newPlayers = [];
for (let i = 0; i < count; i++) {
newPlayers.push(players[i] || {
id: i + 1,
name: `Player ${i + 1}`,
faction: FACTIONS[i % FACTIONS.length],
color: colors[i]
      });
    }
setPlayers(newPlayers);
  };
const updatePlayer = (id, field, value) => {
setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
const pointsPerPlayer = Math.floor(gameSize / playerCount);
const handleStart = () => {
const shuffledSecrets = shuffle(SECRET_OBJECTIVES);
const playersWithSecrets = players.map((p, i) => ({
...p,
sp: 0,
cp: 2,
secretObjective: shuffledSecrets[i * 2],
secretRevealed: false
    }));
onStartGame({
gameSize,
playerCount,
hardMode,
hordeFaction,
players: playersWithSecrets,
pointsPerPlayer
    });
  };
return (
<div className="min-h-screen bg-gray-900 p-4">
<div className="max-w-2xl mx-auto">
<div className="text-center mb-6">
<h1 className="text-4xl font-bold text-purple-400 mb-2">HORDE MODE</h1>
<p className="text-gray-400">40K Cooperative Game Mode Companion</p>
</div>
{sessionCode && (
  <div className="bg-gray-800 rounded-xl p-4 mb-6 text-center border-2 border-purple-600">
    <p className="text-gray-400 text-sm mb-1">Session Code — share with other players</p>
    <p className="text-5xl font-mono font-bold text-purple-400 tracking-widest">{sessionCode}</p>
  </div>
)}
<Card className="p-6 mb-6">
<h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
<Settings size={24} className="text-purple-400" />
            Game Setup
</h2>
<div className="space-y-4">
<div>
<label className="block text-gray-400 mb-2">Game Size</label>
<div className="flex gap-3">
<Button
variant={gameSize === 1000 ? 'primary' : 'secondary'}
onClick={() => setGameSize(1000)}
className="flex-1"
>
                  1,000 pts
</Button>
<Button
variant={gameSize === 2000 ? 'primary' : 'secondary'}
onClick={() => setGameSize(2000)}
className="flex-1"
>
                  2,000 pts
</Button>
</div>
</div>
<div>
<label className="block text-gray-400 mb-2">Players</label>
<div className="flex gap-3">
{[1, 2, 3, 4].map(n => (
<Button
key={n}
variant={playerCount === n ? 'primary' : 'secondary'}
onClick={() => updatePlayerCount(n)}
className="flex-1"
>
{n}
</Button>
                ))}
</div>
<p className="text-sm text-gray-500 mt-2">
{pointsPerPlayer} points per player
</p>
</div>
<div>
<label className="block text-gray-400 mb-2">Horde Faction</label>
<select
value={hordeFaction}
onChange={(e) => setHordeFaction(e.target.value)}
className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
>
{FACTIONS.map(f => (
<option key={f} value={f}>{f}</option>
                ))}
</select>
{HORDE_FACTION_RULES[hordeFaction] && (
<div className="mt-2 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
<span className="text-purple-400 font-bold">{HORDE_FACTION_RULES[hordeFaction].name}</span>
<p className="text-gray-300 text-sm mt-1">{HORDE_FACTION_RULES[hordeFaction].effect}</p>
</div>
              )}
</div>
<div className="flex items-center gap-3">
<button
onClick={() => setHardMode(!hardMode)}
className={`w-12 h-6 rounded-full transition-colors ${hardMode ? 'bg-red-600' : 'bg-gray-600'}`}
>
<div className={`w-5 h-5 bg-white rounded-full transition-transform ${hardMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
</button>
<span className="text-white">Hard Mode</span>
{hardMode && <span className="text-red-400 text-sm">(6 rounds, increased difficulty)</span>}
</div>
</div>
</Card>
<Card className="p-6 mb-6">
<h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
<Users size={24} className="text-purple-400" />
            Players
</h2>
<div className="space-y-4">
{players.map((player) => (
<div key={player.id} className="flex gap-3 items-center">
<div className={`w-4 h-4 rounded-full ${player.color}`}></div>
<input
type="text"
value={player.name}
onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
className="flex-1 bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
placeholder="Player name"
/>
<select
value={player.faction}
onChange={(e) => updatePlayer(player.id, 'faction', e.target.value)}
className="flex-1 bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
>
{FACTIONS.map(f => (
<option key={f} value={f}>{f}</option>
                  ))}
</select>
</div>
            ))}
</div>
</Card>
<Button onClick={handleStart} size="lg" className="w-full">
<Play size={24} />
          Start Game
</Button>
</div>
</div>
  );
};

// ==================== GAME SCREEN ====================
const GameScreen = ({ gameState, onUpdateState, onExitGame, myPlayerId, sessionCode, playerDeviceMap, onClaimSlot, deviceId }) => {
const [activeTab, setActiveTab] = useState('round');
const [selectedPlayer, setSelectedPlayer] = useState(gameState.players[0]?.id);
const [confirmExit, setConfirmExit] = useState(false);
const { round, players, hardMode, hordeFaction, activeMiseryCards, activeSecondary, spawnModifier, miseryDeck, secondaryDeck } = gameState;
const maxRounds = hardMode ? 6 : 5;
const getMiseryCount = () => {
if (hardMode) {
if (round <= 2) return 1;
if (round <= 4) return 2;
return 3;
    } else {
if (round <= 2) return 0;
if (round <= 4) return 1;
return 3;
    }
  };
const updatePlayer = (playerId, field, delta) => {
const newPlayers = players.map(p => {
if (p.id === playerId) {
const newValue = Math.max(0, p[field] + delta);
return { ...p, [field]: newValue };
      }
return p;
    });
onUpdateState({ ...gameState, players: newPlayers });
  };
const drawMiseryCards = () => {
const count = getMiseryCount();
if (count === 0 || miseryDeck.length === 0) return;
const drawn = miseryDeck.slice(0, count);
const remaining = miseryDeck.slice(count);
onUpdateState({
...gameState,
activeMiseryCards: drawn,
miseryDeck: remaining.length > 0 ? remaining : shuffle(MISERY_CARDS)
    });
  };
const drawSecondary = () => {
if (secondaryDeck.length === 0) return;
const [drawn, ...remaining] = secondaryDeck;
onUpdateState({
...gameState,
activeSecondary: { ...drawn, status: 'active' },
secondaryDeck: remaining.length > 0 ? remaining : shuffle(SECONDARY_MISSIONS)
    });
  };
const completeSecondary = () => {
onUpdateState({
...gameState,
activeSecondary: { ...activeSecondary, status: 'success' },
secondariesCompleted: (gameState.secondariesCompleted || 0) + 1
    });
  };
const failSecondary = () => {
onUpdateState({
...gameState,
activeSecondary: { ...activeSecondary, status: 'failed' }
    });
  };
const nextRound = () => {
if (round >= maxRounds) {
onExitGame();
return;
    }
onUpdateState({
...gameState,
round: round + 1,
activeMiseryCards: [],
activeSecondary: null,
spawnModifier: 0
    });
  };
const addSpawnModifier = (value) => {
onUpdateState({
...gameState,
spawnModifier: spawnModifier + value
    });
  };

// Claim slot overlay — shown until this device picks a player
const showClaimOverlay = myPlayerId === null;
const getSlotStatus = (playerId) => {
  const claimedBy = playerDeviceMap[playerId];
  if (!claimedBy) return 'available';
  if (claimedBy === deviceId) return 'mine';
  return 'taken';
};

return (
<div className="min-h-screen bg-gray-900">
{/* Claim Slot Overlay */}
{showClaimOverlay && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <Card className="p-6 max-w-sm w-full">
      <div className="flex items-center gap-2 mb-2">
        <Users className="text-purple-400" size={24} />
        <h2 className="text-xl font-bold text-white">Who are you?</h2>
      </div>
      <p className="text-gray-400 text-sm mb-4">Select your player slot to track your resources and see your secret objective</p>
      <div className="space-y-2">
        {players.map(player => {
          const status = getSlotStatus(player.id);
          return (
            <button
              key={player.id}
              onClick={() => status !== 'taken' && onClaimSlot(player.id)}
              disabled={status === 'taken'}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                status === 'mine' ? 'bg-purple-600 text-white' :
                status === 'taken' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' :
                'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${player.color}`}></div>
                  <span className="font-bold">{player.name}</span>
                  <span className="text-sm opacity-70">{player.faction}</span>
                </div>
                {status === 'taken' && <span className="text-xs text-gray-500">Taken</span>}
              </div>
            </button>
          );
        })}
        <button
          onClick={() => onClaimSlot(-1)}
          className="w-full p-3 rounded-lg text-left bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <span className="text-sm">Watch only (no player slot)</span>
        </button>
      </div>
    </Card>
  </div>
)}

{/* Header */}
<div className="bg-gray-800 border-b border-gray-700 p-4">
<div className="max-w-4xl mx-auto flex items-center justify-between">
<div>
<h1 className="text-2xl font-bold text-purple-400">HORDE MODE</h1>
<p className="text-gray-400 text-sm">vs {hordeFaction} {hardMode && '• HARD MODE'} • <span className="font-mono text-purple-300">{sessionCode}</span></p>
</div>
<div className="flex items-center gap-4">
<div className="text-center">
<div className="text-3xl font-bold text-white">{round}</div>
<div className="text-xs text-gray-400">ROUND</div>
</div>
{!confirmExit ? (
  <Button variant="ghost" onClick={() => setConfirmExit(true)}>
    <LogOut size={20} />
  </Button>
) : (
  <div className="flex items-center gap-2">
    <span className="text-yellow-400 text-xs">End for all?</span>
    <Button variant="danger" size="sm" onClick={onExitGame}>Yes</Button>
    <Button variant="ghost" size="sm" onClick={() => setConfirmExit(false)}>No</Button>
  </div>
)}
</div>
</div>
</div>
{/* Tabs */}
<div className="bg-gray-800 border-b border-gray-700">
<div className="max-w-4xl mx-auto flex">
{['round', 'players', 'spawn', 'resupply'].map(tab => (
<button
key={tab}
onClick={() => setActiveTab(tab)}
className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
activeTab === tab
? 'text-purple-400 border-b-2 border-purple-400'
: 'text-gray-400 hover:text-white'
}`}
>
{tab.charAt(0).toUpperCase() + tab.slice(1)}
</button>
          ))}
</div>
</div>
{/* Content */}
<div className="max-w-4xl mx-auto p-4">
{activeTab === 'round' && (
<div className="space-y-4">
{/* Round Info */}
<Card className="p-4">
<div className="flex items-center justify-between mb-4">
<h2 className="text-xl font-bold text-white">Battle Round {round}</h2>
<div className="flex gap-2">
<span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-sm">
{getMiseryCount()} Misery
</span>
<span className="px-3 py-1 bg-purple-900/50 text-purple-400 rounded-full text-sm">
                    +{hardMode ? (round <= 1 ? 0 : round <= 2 ? 1 : round <= 3 ? 2 : 3) : (round <= 2 ? 0 : round <= 4 ? 1 : 2)} Spawn
</span>
</div>
</div>
<div className="flex gap-3 mb-4">
<Button onClick={drawMiseryCards} variant="danger" className="flex-1">
<Skull size={18} />
                  Draw Misery ({getMiseryCount()})
</Button>
<Button onClick={drawSecondary} variant="secondary" className="flex-1" disabled={!!activeSecondary}>
<Trophy size={18} />
                  Draw Secondary
</Button>
</div>
<Button onClick={nextRound} variant="primary" className="w-full">
<ChevronRight size={18} />
{round >= maxRounds ? 'End Game' : 'Next Round'}
</Button>
</Card>
{/* Active Misery Cards */}
{activeMiseryCards.length > 0 && (
<div>
<h3 className="text-white font-bold mb-3 flex items-center gap-2">
<Skull className="text-red-500" size={18} />
                  Active Misery ({activeMiseryCards.length})
</h3>
<div className="grid gap-3">
{activeMiseryCards.map(card => (
<MiseryCard key={card.id} card={card} />
                  ))}
</div>
</div>
            )}
{/* Active Secondary */}
{activeSecondary && (
<div>
<h3 className="text-white font-bold mb-3 flex items-center gap-2">
<Trophy className="text-yellow-500" size={18} />
                  Secondary Mission
</h3>
<SecondaryCard
mission={activeSecondary}
status={activeSecondary.status}
onComplete={completeSecondary}
onFail={failSecondary}
/>
</div>
            )}
{/* Quick Player Overview */}
<div className="grid grid-cols-2 gap-3">
{players.map(player => (
<PlayerCard
key={player.id}
player={player}
isActive={player.id === selectedPlayer}
isMyPlayer={player.id === myPlayerId}
onUpdateSP={(id, delta) => updatePlayer(id, 'sp', delta)}
onUpdateCP={(id, delta) => updatePlayer(id, 'cp', delta)}
/>
              ))}
</div>
</div>
        )}
{activeTab === 'players' && (
<div className="space-y-4">
{players.map(player => {
  const isMe = player.id === myPlayerId;
  const canSeeSecret = isMe || player.secretRevealed;
  return (
<Card key={player.id} className="p-4">
<div className="flex items-center gap-3 mb-4">
<div className={`w-4 h-4 rounded-full ${player.color}`}></div>
<h3 className="text-xl font-bold text-white">{player.name}</h3>
<span className="text-gray-400 text-sm">{player.faction}</span>
{isMe && <span className="ml-auto px-2 py-0.5 bg-purple-800 text-purple-200 rounded text-xs">You</span>}
</div>
<div className="grid grid-cols-2 gap-4 mb-4">
<div className="bg-gray-900 rounded-lg p-4">
<div className="flex items-center justify-between mb-2">
<span className="text-yellow-400 font-medium">Supply Points</span>
</div>
<div className="flex items-center justify-center gap-4">
<Button variant="ghost" onClick={() => updatePlayer(player.id, 'sp', -1)}>
<Minus size={20} />
</Button>
<span className="text-4xl font-bold text-white">{player.sp}</span>
<Button variant="ghost" onClick={() => updatePlayer(player.id, 'sp', 1)}>
<Plus size={20} />
</Button>
</div>
</div>
<div className="bg-gray-900 rounded-lg p-4">
<div className="flex items-center justify-between mb-2">
<span className="text-blue-400 font-medium">Command Points</span>
</div>
<div className="flex items-center justify-center gap-4">
<Button variant="ghost" onClick={() => updatePlayer(player.id, 'cp', -1)}>
<Minus size={20} />
</Button>
<span className="text-4xl font-bold text-white">{player.cp}</span>
<Button variant="ghost" onClick={() => updatePlayer(player.id, 'cp', 1)}>
<Plus size={20} />
</Button>
</div>
</div>
</div>
{player.secretObjective && (
<div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700">
<div className="flex items-center justify-between mb-2">
<span className="text-purple-400 font-bold">Secret Objective</span>
{isMe && (
  <button
    onClick={() => {
      const newPlayers = players.map(p =>
        p.id === player.id ? { ...p, secretRevealed: !p.secretRevealed } : p
      );
      onUpdateState({ ...gameState, players: newPlayers });
    }}
    className="text-purple-400 hover:text-purple-300"
  >
    {player.secretRevealed ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
)}
</div>
{canSeeSecret ? (
<>
<h4 className="text-white font-bold mb-2">{player.secretObjective.name}</h4>
<p className="text-gray-300 text-sm mb-2">{player.secretObjective.condition}</p>
<div className="flex flex-wrap gap-1">
{player.secretObjective.tags.map(tag => (
<span key={tag} className="px-2 py-0.5 bg-purple-800 text-purple-200 rounded text-xs">
{tag}
</span>
                          ))}
</div>
{isMe && !player.secretRevealed && (
  <p className="text-purple-400 text-xs mt-2 italic">Tap the eye icon to reveal to all players</p>
)}
</>
) : (
<p className="text-gray-400 italic">Private objective</p>
)}
</div>
                )}
</Card>
  );
})}
</div>
        )}
{activeTab === 'spawn' && (
<div className="space-y-4">
<SpawnRoller
round={round}
spawnModifier={spawnModifier}
hardMode={hardMode}
/>
<Card className="p-4">
<h3 className="text-white font-bold mb-3">Spawn Modifier Adjustments</h3>
<div className="flex gap-2 flex-wrap">
<Button variant="danger" size="sm" onClick={() => addSpawnModifier(1)}>+1</Button>
<Button variant="danger" size="sm" onClick={() => addSpawnModifier(2)}>+2</Button>
<Button variant="danger" size="sm" onClick={() => addSpawnModifier(3)}>+3</Button>
<Button variant="success" size="sm" onClick={() => addSpawnModifier(-1)}>-1</Button>
<Button variant="secondary" size="sm" onClick={() => onUpdateState({...gameState, spawnModifier: 0})}>Reset</Button>
</div>
<p className="text-gray-400 text-sm mt-2">Current extra modifier: {spawnModifier > 0 ? '+' : ''}{spawnModifier}</p>
</Card>
<Card className="p-4">
<h3 className="text-white font-bold mb-3">Spawn Brackets Reference</h3>
<div className="space-y-2 text-sm">
<div className="flex justify-between text-gray-400">
<span>2 (unmodified)</span><span className="text-gray-500">No Spawn</span>
</div>
<div className="flex justify-between text-gray-300">
<span>3-4</span><span className="text-purple-400">~75 pts or less</span>
</div>
<div className="flex justify-between text-gray-300">
<span>5-6</span><span className="text-purple-400">80-170 pts</span>
</div>
<div className="flex justify-between text-gray-300">
<span>7-9</span><span className="text-purple-400">175-295 pts</span>
</div>
<div className="flex justify-between text-gray-300">
<span>10+</span><span className="text-purple-400">300+ pts</span>
</div>
</div>
</Card>
<Card className="p-4">
<h3 className="text-white font-bold mb-3">Horde Faction Rule</h3>
{HORDE_FACTION_RULES[hordeFaction] && (
<div className="p-3 bg-purple-900/30 rounded border border-purple-700">
<span className="text-purple-400 font-bold">{HORDE_FACTION_RULES[hordeFaction].name}</span>
<p className="text-gray-300 text-sm mt-1">{HORDE_FACTION_RULES[hordeFaction].effect}</p>
</div>
              )}
</Card>
</div>
        )}
{activeTab === 'resupply' && (
<div className="space-y-4">
<Card className="p-4 mb-4">
<h3 className="text-white font-bold mb-2">Select Player</h3>
<div className="flex gap-2">
{players.map(p => (
<button
key={p.id}
onClick={() => setSelectedPlayer(p.id)}
className={`flex-1 p-2 rounded-lg transition-colors ${
selectedPlayer === p.id
? 'bg-purple-600 text-white'
: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}`}
>
<div className="flex items-center justify-center gap-2">
<div className={`w-3 h-3 rounded-full ${p.color}`}></div>
<span className="text-sm">{p.name}</span>
<span className="text-yellow-400 font-bold">{p.sp}SP</span>
</div>
</button>
                ))}
</div>
</Card>
<div className="space-y-3">
{RESUPPLY_OPTIONS.map((option, idx) => {
const currentPlayer = players.find(p => p.id === selectedPlayer);
const canAfford = currentPlayer && currentPlayer.sp >= option.cost;
return (
<Card key={idx} className={`p-4 ${!canAfford ? 'opacity-50' : ''}`}>
<div className="flex items-start justify-between">
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="px-2 py-0.5 bg-yellow-600 text-white rounded text-sm font-bold">
{option.cost}SP
</span>
<h4 className="text-white font-bold">{option.name}</h4>
</div>
<p className="text-gray-400 text-sm">{option.effect}</p>
<div className="flex gap-1 mt-2">
{option.tags.map(tag => (
<span key={tag} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
{tag}
</span>
                          ))}
</div>
</div>
<Button
variant="primary"
size="sm"
disabled={!canAfford}
onClick={() => {
if (canAfford) {
updatePlayer(selectedPlayer, 'sp', -option.cost);
                          }
                        }}
>
                        Buy
</Button>
</div>
</Card>
                );
              })}
</div>
</div>
        )}
</div>
</div>
  );
};

// ==================== MAIN APP ====================
export default function HordeModeApp() {
  const deviceId = useMemo(() => getDeviceId(), []);
  const [phase, setPhase] = useState('lobby');
  const [sessionCode, setSessionCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerDeviceMap, setPlayerDeviceMap] = useState({});

  // Subscribe to Firebase session updates
  useEffect(() => {
    if (!sessionCode) return;
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (data.gameStateJson) {
        try {
          setGameState(JSON.parse(data.gameStateJson));
        } catch (e) {
          console.error('Failed to parse game state:', e);
        }
      }

      if (data.playerDeviceMap) {
        setPlayerDeviceMap(data.playerDeviceMap);
        // Auto-restore claimed slot on reconnect
        setMyPlayerId(prev => {
          if (prev !== null) return prev;
          const savedId = localStorage.getItem(`hm_player_${sessionCode}`);
          if (savedId && data.playerDeviceMap[savedId] === deviceId) {
            return Number(savedId);
          }
          return prev;
        });
      }

      if (data.phase === 'game') {
        setPhase('game');
      } else if (data.phase === 'ended') {
        setPhase('lobby');
        setSessionCode(null);
        setIsHost(false);
        setMyPlayerId(null);
        setGameState(null);
        setPlayerDeviceMap({});
      }
    });
    return () => unsubscribe();
  }, [sessionCode, deviceId]);

  const createSession = async () => {
    const code = generateCode();
    await set(ref(db, `sessions/${code}`), {
      hostDeviceId: deviceId,
      phase: 'setup',
      gameStateJson: null,
      playerDeviceMap: {},
    });
    setSessionCode(code);
    setIsHost(true);
    setPhase('setup');
  };

  const joinSession = (code, data) => {
    setSessionCode(code);
    setIsHost(false);
    if (data.playerDeviceMap) setPlayerDeviceMap(data.playerDeviceMap);
    if (data.phase === 'game') {
      if (data.gameStateJson) {
        try { setGameState(JSON.parse(data.gameStateJson)); } catch (e) {}
      }
      const savedId = localStorage.getItem(`hm_player_${code}`);
      if (savedId && data.playerDeviceMap?.[savedId] === deviceId) {
        setMyPlayerId(Number(savedId));
      }
      setPhase('game');
    } else {
      setPhase('waiting');
    }
  };

  const startGame = (setupData) => {
    const gs = {
      ...setupData,
      round: 1,
      activeMiseryCards: [],
      activeSecondary: null,
      spawnModifier: 0,
      miseryDeck: shuffle(MISERY_CARDS),
      secondaryDeck: shuffle(SECONDARY_MISSIONS),
      secondariesCompleted: 0,
    };
    set(ref(db, `sessions/${sessionCode}`), {
      hostDeviceId: deviceId,
      phase: 'game',
      gameStateJson: JSON.stringify(gs),
      playerDeviceMap: {},
    });
    setGameState(gs);
    setPlayerDeviceMap({});
    setMyPlayerId(null);
    setPhase('game');
  };

  const updateGameState = (newState) => {
    setGameState(newState);
    set(ref(db, `sessions/${sessionCode}/gameStateJson`), JSON.stringify(newState));
  };

  const claimPlayerSlot = (playerId) => {
    setMyPlayerId(playerId);
    if (playerId !== -1) {
      localStorage.setItem(`hm_player_${sessionCode}`, playerId);
      update(ref(db, `sessions/${sessionCode}/playerDeviceMap`), { [playerId]: deviceId });
    }
  };

  const exitGame = () => {
    set(ref(db, `sessions/${sessionCode}/phase`), 'ended');
    setPhase('lobby');
    setSessionCode(null);
    setIsHost(false);
    setMyPlayerId(null);
    setGameState(null);
    setPlayerDeviceMap({});
  };

  if (phase === 'lobby') {
    return <LobbyScreen onCreateSession={createSession} onJoinSession={joinSession} />;
  }
  if (phase === 'setup') {
    return <SetupScreen sessionCode={sessionCode} onStartGame={startGame} />;
  }
  if (phase === 'waiting') {
    return <WaitingScreen sessionCode={sessionCode} />;
  }
  return (
    <GameScreen
      gameState={gameState}
      myPlayerId={myPlayerId}
      sessionCode={sessionCode}
      playerDeviceMap={playerDeviceMap}
      isHost={isHost}
      deviceId={deviceId}
      onUpdateState={updateGameState}
      onClaimSlot={claimPlayerSlot}
      onExitGame={exitGame}
    />
  );
}
