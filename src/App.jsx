import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Skull, Users, Swords, Shield, Zap, ChevronRight, ChevronLeft, RotateCcw, Plus, Minus, Dices, AlertTriangle, Trophy, X, Settings, Play, Eye, EyeOff, LogOut, Check, RefreshCw } from 'lucide-react';
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
// ==================== SPAWN TABLES ====================
// Units organised by faction and spawn bracket (3-4 / 5-6 / 7-9 / 10+)
const SPAWN_TABLES = {
  'Space Marines': {
    '3-4': ['Scout Squad (5)', 'Infiltrator Squad (5)', 'Eliminator Squad (3)', 'Incursor Squad (5)'],
    '5-6': ['Intercessor Squad (5)', 'Assault Intercessors (5)', 'Heavy Intercessors (5)', 'Tactical Squad (10)'],
    '7-9': ['Eradicators (3)', 'Aggressors (3)', 'Outriders (3)', 'Bladeguard Veterans (3)'],
    '10+': ['Redemptor Dreadnought', 'Land Raider', 'Repulsor', 'Gladiator Lancer', 'Predator Annihilator'],
  },
  'Adepta Sororitas': {
    '3-4': ['Repentia Superior', 'Crusaders (5)', 'Battle Sisters (5)', 'Arco-flagellants (5)'],
    '5-6': ['Battle Sisters Squad (10)', 'Zephyrim (5)', 'Seraphim (5)', 'Retributors (5)'],
    '7-9': ['Sisters Repentia (9)', 'Celestian Sacresants (5)', 'Paragon Warsuits (3)', 'Arco-flagellants (10)'],
    '10+': ['Penitent Engines (2)', 'Immolator', 'Exorcist', 'Mortifiers (4)'],
  },
  'Adeptus Mechanicus': {
    '3-4': ['Skitarii Rangers (5)', 'Skitarii Vanguard (5)', 'Sicarian Ruststalkers (5)'],
    '5-6': ['Skitarii Rangers (10)', 'Pteraxii Skystalkers (5)', 'Serberys Raiders (3)', 'Serberys Sulphurhounds (3)'],
    '7-9': ['Sicarian Infiltrators (5)', 'Kataphron Breachers (3)', 'Kataphron Destroyers (3)', 'Ironstrider Ballistarii (2)'],
    '10+': ['Onager Dunecrawler', 'Kastelan Robots (2)', 'Ironstrider Cavaliers (3)', 'Archaeopter Fusilave'],
  },
  'Adeptus Custodes': {
    '3-4': ['Custodian Guard (3)', 'Prosecutors (5)', 'Sagittarum Guard (3)'],
    '5-6': ['Custodian Guard (5)', 'Vertus Praetors (3)', 'Custodian Wardens (3)'],
    '7-9': ['Allarus Custodians (3)', 'Custodian Wardens (5)', 'Vertus Praetors (5)'],
    '10+': ['Caladius Grav-tank', 'Land Raider', 'Telemon Dreadnought', 'Coronus Grav-carrier'],
  },
  'Grey Knights': {
    '3-4': ['Strike Squad (5)', 'Terminators (3)', 'Purifier Squad (5)'],
    '5-6': ['Strike Squad (10)', 'Interceptor Squad (5)', 'Purgation Squad (5)'],
    '7-9': ['Terminators (5)', 'Paladins (5)', 'Purifier Squad (10)'],
    '10+': ['Grand Master Dreadknight', 'Stormraven Gunship', 'Land Raider Crusader'],
  },
  'Astra Militarum': {
    '3-4': ['Infantry Squad (10)', 'Conscripts (10)', 'Ogryns (3)', 'Ratlings (5)'],
    '5-6': ['Infantry Squad (20)', 'Veteran Guardsmen (10)', 'Kasrkin (10)', 'Catachan Jungle Fighters (10)'],
    '7-9': ['Rough Riders (5)', 'Armoured Sentinels (3)', 'Tempestus Scions (10)', 'Heavy Weapons Squad (3)'],
    '10+': ['Leman Russ Battle Tank', 'Chimera', 'Basilisk', 'Manticore', 'Hellhound'],
  },
  'Imperial Knights': {
    '3-4': ['Armiger Warglaive (1)', 'Armiger Helverin (1)'],
    '5-6': ['Armiger Warglaives (2)', 'Armiger Helverins (2)'],
    '7-9': ['Knight Paladin', 'Knight Errant', 'Knight Gallant', 'Knight Preceptor'],
    '10+': ['Knight Castellan', 'Knight Crusader', 'Dominus Valiant', 'Canis Rex'],
  },
  'Chaos Knights': {
    '3-4': ['War Dog Karnivore (1)', 'War Dog Huntsman (1)'],
    '5-6': ['War Dog Karnivores (2)', 'War Dog Brigands (2)', 'War Dog Moirax (2)'],
    '7-9': ['Knight Abominant', 'Knight Desecrator', 'Knight Rampager'],
    '10+': ['Knight Tyrant', 'War Dog Karnivores (3)', 'War Dog Brigands (3)'],
  },
  'Chaos Space Marines': {
    '3-4': ['Cultist Mob (10)', 'Legionaries (5)', 'Chaos Cultists (10)'],
    '5-6': ['Legionaries (10)', 'Chaos Havocs (5)', 'Warp Talons (5)', 'Chaos Raptors (5)'],
    '7-9': ['Chosen (5)', 'Chaos Terminators (5)', 'Bikers (5)', 'Noise Marines (5)'],
    '10+': ['Chaos Predator Destructor', 'Chaos Vindicator', 'Chaos Land Raider', 'Maulerfiend', 'Forgefiend'],
  },
  'Chaos Daemons': {
    '3-4': ['Bloodletters (10)', 'Plaguebearers (10)', 'Daemonettes (10)', 'Pink Horrors (10)', 'Blue Horrors (20)'],
    '5-6': ['Flesh Hounds (10)', 'Beasts of Nurgle (3)', 'Seekers (10)', 'Nurglings (3)'],
    '7-9': ['Bloodcrushers (3)', 'Plague Drones (3)', 'Fiends (3)', 'Flamers (3)'],
    '10+': ['Bloodthirster', 'Great Unclean One', 'Keeper of Secrets', 'Lord of Change', 'Soul Grinder'],
  },
  'Thousand Sons': {
    '3-4': ['Tzaangors (10)', 'Rubric Marines (5)', 'Chaos Cultists (10)'],
    '5-6': ['Rubric Marines (10)', 'Tzaangors (20)', 'Tzaangor Enlightened (3)', 'Tzaangor Skyfires (3)'],
    '7-9': ['Scarab Occult Terminators (5)', 'Chaos Spawn (3)'],
    '10+': ['Mutalith Vortex Beast', 'Defiler', 'Forgefiend', 'Maulerfiend'],
  },
  'Death Guard': {
    '3-4': ['Poxwalkers (10)', 'Plague Marines (5)', 'Cultists of the Plague God (10)'],
    '5-6': ['Poxwalkers (20)', 'Plague Marines (7)', 'Deathshroud Terminators (3)'],
    '7-9': ['Deathshroud Terminators (5)', 'Blightlord Terminators (5)', 'Chaos Spawn (3)'],
    '10+': ['Foetid Bloat-drone', 'Plagueburst Crawler', 'Blight Hauler (2)', 'Defiler'],
  },
  'World Eaters': {
    '3-4': ['Jakhals (10)', 'Khorne Berzerkers (5)', 'Chaos Cultists (10)'],
    '5-6': ['Khorne Berzerkers (8)', 'Jakhals (20)', 'Chaos Bikers (5)'],
    '7-9': ['Eightbound (3)', 'Exalted Eightbound (3)', 'World Eaters Terminators (5)'],
    '10+': ['Lord of Skulls', 'Defiler', 'Maulerfiend', 'Chaos Land Raider'],
  },
  'Aeldari': {
    '3-4': ['Guardian Defenders (10)', 'Storm Guardians (10)', 'Rangers (5)', 'Windriders (3)'],
    '5-6': ['Dire Avengers (10)', 'Howling Banshees (5)', 'Fire Dragons (5)', 'Striking Scorpions (5)', 'Swooping Hawks (5)'],
    '7-9': ['Dark Reapers (5)', 'Shining Spears (3)', 'Warp Spiders (5)', 'Wraithblades (5)'],
    '10+': ['Wraithlord', 'Falcon', 'Fire Prism', 'Wave Serpent', 'Wraithknight'],
  },
  'Drukhari': {
    '3-4': ['Kabalite Warriors (10)', 'Wyches (10)', 'Mandrakes (5)'],
    '5-6': ['Kabalite Warriors (20)', 'Wyches (10)', 'Hellions (10)', 'Reavers (6)'],
    '7-9': ['Incubi (5)', 'Grotesques (3)', 'Scourges (5)', 'Haemoxytes (10)'],
    '10+': ['Talos Pain Engine (2)', 'Cronos (2)', 'Ravager', 'Raider'],
  },
  'Necrons': {
    '3-4': ['Necron Warriors (10)', 'Immortals (5)', 'Scarab Swarms (3)'],
    '5-6': ['Necron Warriors (20)', 'Immortals (10)', 'Tomb Blades (6)', 'Flayed Ones (10)'],
    '7-9': ['Lychguard (5)', 'Deathmarks (10)', 'Triarch Praetorians (5)', 'Wraiths (3)'],
    '10+': ['Doomsday Ark', 'Doomstalker', 'Monolith', 'Tesseract Ark'],
  },
  'T\'au Empire': {
    '3-4': ['Fire Warriors (10)', 'Kroot Carnivores (10)', 'Kroot Hounds (10)'],
    '5-6': ['Fire Warriors (20)', 'Pathfinder Team (10)', 'Stealth Battlesuits (3)', 'Kroot Farstalkers (10)'],
    '7-9': ['Crisis Battlesuits (3)', 'Broadside Battlesuits (3)', 'Ghostkeel Battlesuit'],
    '10+': ['Hammerhead Gunship', 'Riptide Battlesuit', 'Stormsurge'],
  },
  'Orks': {
    '3-4': ['Boyz (10)', 'Gretchin (20)', 'Kommandos (5)'],
    '5-6': ['Boyz (20)', 'Flash Gitz (5)', 'Stormboyz (10)', 'Tank Bustas (10)'],
    '7-9': ['Nobz (10)', 'Meganobz (3)', 'Lootas (10)', 'Burna Boyz (10)'],
    '10+': ['Deff Dread', 'Battlewagon', 'Gorkanaut', 'Morkanaut'],
  },
  'Leagues of Votann': {
    '3-4': ['Hearthkyn Warriors (10)', 'Cthonian Beserks (5)'],
    '5-6': ['Hearthkyn Warriors (20)', 'Hernkyn Pioneers (3)', 'Hearthkyn Salvagers (10)'],
    '7-9': ['Cthonian Beserks (10)', 'Hernkyn Yaegir (5)', 'Brôkhyr Thunderkyn (3)'],
    '10+': ['Hekaton Land Fortress', 'Sagitaur (2)', 'Colossus'],
  },
  'Tyranids': {
    '3-4': ['Termagants (10)', 'Hormagaunts (10)', 'Von Ryan\'s Leapers (3)', 'Barbgaunts (5)'],
    '5-6': ['Gargoyles (20)', 'Genestealers (10)', 'Neurogaunts (20)', 'Ripper Swarms (6)'],
    '7-9': ['Tyranid Warriors (6)', 'Raveners (6)', 'Zoanthropes (3)', 'Tyranid Shrikes (6)'],
    '10+': ['Carnifex', 'Exocrine', 'Hive Tyrant', 'Trygon', 'Tyrannofex', 'Haruspex'],
  },
  'Genestealer Cults': {
    '3-4': ['Neophyte Hybrids (10)', 'Acolyte Hybrids (5)', 'Brood Brothers (10)'],
    '5-6': ['Neophyte Hybrids (20)', 'Acolyte Hybrids (10)', 'Hybrid Metamorphs (10)'],
    '7-9': ['Aberrants (5)', 'Atalan Jackals (5)', 'Kelermorph', 'Nexos'],
    '10+': ['Achilles Ridgerunner', 'Goliath Truck', 'Goliath Rockgrinder', 'Cult Ambush (2 units)'],
  },
};
// ==================== FACTION VISUAL DATA ====================
const FACTION_COLORS = {
  'Space Marines':       { primary: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)' },
  'Adepta Sororitas':    { primary: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)' },
  'Adeptus Mechanicus':  { primary: '#dc2626', bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.35)' },
  'Adeptus Custodes':    { primary: '#d97706', bg: 'rgba(217,119,6,0.15)',   border: 'rgba(217,119,6,0.4)' },
  'Grey Knights':        { primary: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' },
  'Astra Militarum':     { primary: '#65a30d', bg: 'rgba(101,163,13,0.12)',  border: 'rgba(101,163,13,0.35)' },
  'Imperial Knights':    { primary: '#2563eb', bg: 'rgba(37,99,235,0.12)',   border: 'rgba(37,99,235,0.35)' },
  'Chaos Knights':       { primary: '#b91c1c', bg: 'rgba(185,28,28,0.15)',   border: 'rgba(185,28,28,0.4)' },
  'Chaos Space Marines': { primary: '#dc2626', bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.35)' },
  'Chaos Daemons':       { primary: '#9333ea', bg: 'rgba(147,51,234,0.12)',  border: 'rgba(147,51,234,0.35)' },
  'Thousand Sons':       { primary: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  'Death Guard':         { primary: '#65a30d', bg: 'rgba(101,163,13,0.1)',   border: 'rgba(101,163,13,0.3)' },
  'World Eaters':        { primary: '#dc2626', bg: 'rgba(220,38,38,0.15)',   border: 'rgba(220,38,38,0.45)' },
  'Aeldari':             { primary: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.35)' },
  'Drukhari':            { primary: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.35)' },
  'Necrons':             { primary: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)' },
  "T'au Empire":         { primary: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',   border: 'rgba(14,165,233,0.3)' },
  'Orks':                { primary: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)' },
  'Leagues of Votann':   { primary: '#78716c', bg: 'rgba(120,113,108,0.1)', border: 'rgba(120,113,108,0.3)' },
  'Tyranids':            { primary: '#c026d3', bg: 'rgba(192,38,211,0.12)',  border: 'rgba(192,38,211,0.35)' },
  'Genestealer Cults':   { primary: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.35)' },
};

// ==================== FACTION BADGE IMAGE URLS ====================
// Confirmed HTTP-200 public URLs (GitHub SVG repo + Lexicanum wiki)
const FACTION_IMAGE_URLS = {
  'Space Marines':        'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/adeptus-astartes.svg',
  'Adepta Sororitas':     'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/sisters-of-battle.svg',
  'Adeptus Mechanicus':   'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/adeptus-mechanicus.svg',
  'Adeptus Custodes':     'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/adeptus-custodes.svg',
  'Grey Knights':         'https://wh40k.lexicanum.com/mediawiki/images/9/94/Simple_Badge_Grey_Knights.png',
  'Astra Militarum':      'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/astra-militarum.svg',
  'Imperial Knights':     'https://wh40k.lexicanum.com/mediawiki/images/4/48/Simple_Badge_Imperial_Knights.png',
  'Chaos Knights':        'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/chaos-star-01.svg',
  'Chaos Space Marines':  'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/black-legion.svg',
  'Chaos Daemons':        'https://wh40k.lexicanum.com/mediawiki/images/b/b8/Simple_Badge_Chaos_Daemons.png',
  'Thousand Sons':        'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/thousand-sons.svg',
  'Death Guard':          'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/death-guard.svg',
  'World Eaters':         'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/world-eaters.svg',
  'Aeldari':              'https://wh40k.lexicanum.com/mediawiki/images/6/66/Simple_Badge_Eldar.png',
  'Drukhari':             'https://wh40k.lexicanum.com/mediawiki/images/7/79/Simple_Badge_Dark_Eldar.png',
  'Necrons':              'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/Xenos/Necrons/necrons.svg',
  "T'au Empire":          'https://raw.githubusercontent.com/Warhammer40kGroup/wh40k-icon/master/src/svgs/Xenos/TauEmpire/tau.svg',
  'Orks':                 'https://wh40k.lexicanum.com/mediawiki/images/d/d8/Simple_Badge_Orks.png',
  'Leagues of Votann':    'https://wh40k.lexicanum.com/mediawiki/images/0/0e/Simple_Badge_Leagues_of_Votann.png',
  'Tyranids':             'https://wh40k.lexicanum.com/mediawiki/images/0/0a/Simple_Badge_Tyranids.png',
  'Genestealer Cults':    'https://wh40k.lexicanum.com/mediawiki/images/0/04/Tyranids.png',
};

// ==================== FACTION SVG ICONS (fallback) ====================
// Rendered if the image URL fails to load
const FactionSVGFallback = ({ faction, size, col }) => {
  const icons = {
    'Space Marines': (
      // Kite shield + lightning bolt
      <><polygon points="12,1.5 21,7 21,15 12,22.5 3,15 3,7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 6l-5 7h3.5l-2.5 8 6-9h-3.5z" fill="currentColor"/></>
    ),
    'Adepta Sororitas': (
      // Fleur-de-lis
      <><path d="M12 3c0 0-3 4-3 7 0 2 1.5 2 3 2s3 0 3-2c0-3-3-7-3-7z" fill="currentColor"/>
        <path d="M7 10c-3 1-4 3.5-3 5.5s3.5 1.5 4.5.5 1.5-3.5 0.5-4.5c-1-1-2-1.5-2-1.5z" fill="currentColor" opacity="0.85"/>
        <path d="M17 10c3 1 4 3.5 3 5.5s-3.5 1.5-4.5.5-1.5-3.5-0.5-4.5c1-1 2-1.5 2-1.5z" fill="currentColor" opacity="0.85"/>
        <rect x="9.5" y="17.5" width="5" height="2" rx="1" fill="currentColor"/></>
    ),
    'Adeptus Mechanicus': (
      // Cog wheel with skull eyes
      <>{[0,45,90,135,180,225,270,315].map(a => {
          const r = Math.PI/180*a;
          return <line key={a} x1={12+5.5*Math.cos(r)} y1={12+5.5*Math.sin(r)} x2={12+8.5*Math.cos(r)} y2={12+8.5*Math.sin(r)} stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>;
        })}
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10.5" cy="11" r="1" fill="currentColor"/>
        <circle cx="13.5" cy="11" r="1" fill="currentColor"/>
        <path d="M10.5 13.5 Q12 15.5 13.5 13.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/></>
    ),
    'Adeptus Custodes': (
      // Winged spear / shield
      <><path d="M12 2 Q17 5 17 10 Q17 17 12 22 Q7 17 7 10 Q7 5 12 2Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="12" y1="2" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5"/>
        <polygon points="12,2 10,7 14,7" fill="currentColor"/>
        <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.2"/></>
    ),
    'Grey Knights': (
      // Crossed swords
      <><line x1="5" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="19" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="5"  cy="4"  r="1.5" fill="currentColor"/>
        <circle cx="19" cy="4"  r="1.5" fill="currentColor"/>
        <rect x="10" y="10.5" width="4" height="2.5" rx="0.8" fill="currentColor" transform="rotate(45 12 12)"/></>
    ),
    'Astra Militarum': (
      // 5-pointed star
      <><polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" fill="currentColor"/></>
    ),
    'Imperial Knights': (
      // Knight kite shield with quartered pattern
      <><path d="M8 2h8v14l-4 6-4-6z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="12" y1="2" x2="12" y2="16" stroke="currentColor" strokeWidth="1"/>
        <line x1="8"  y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1"/>
        <circle cx="10" cy="5.5" r="1" fill="currentColor"/>
        <circle cx="14" cy="12.5" r="1" fill="currentColor"/></>
    ),
    'Chaos Knights': (
      // 8-pointed chaos star
      <>{[0,45,90,135,180,225,270,315].map(a => {
          const r=Math.PI/180*a;
          return <line key={a} x1="12" y1="12" x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>;
        })}
        <circle cx="12" cy="12" r="2.5" fill="currentColor"/></>
    ),
    'Chaos Space Marines': (
      // Skull with chaos horns
      <><circle cx="12" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 6.5L4.5 3M17 6.5L19.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor"/>
        <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor"/>
        <path d="M9 13.5h6l-.5 2h-5z" fill="currentColor"/></>
    ),
    'Chaos Daemons': (
      // 4-armed chaos symbol with arrowheads
      <><path d="M12 2v8M12 14v8M2 12h8M14 12h8" stroke="currentColor" strokeWidth="2"/>
        <polygon points="12,2 10,6 14,6" fill="currentColor"/>
        <polygon points="12,22 14,18 10,18" fill="currentColor"/>
        <polygon points="2,12 6,10 6,14" fill="currentColor"/>
        <polygon points="22,12 18,14 18,10" fill="currentColor"/>
        <circle cx="12" cy="12" r="2.5" fill="currentColor"/></>
    ),
    'Thousand Sons': (
      // Eye of fate with flame
      <><path d="M4 12 Q12 5 20 12 Q12 19 4 12Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        <path d="M10 9 Q12 3 14 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></>
    ),
    'Death Guard': (
      // Three overlapping circles (Nurgle)
      <><circle cx="8.5"  cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="15.5" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12"   cy="8"  r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/></>
    ),
    'World Eaters': (
      // Skull with rage marks
      <><circle cx="12" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9.5"  cy="9"  r="1.5" fill="currentColor"/>
        <circle cx="14.5" cy="9"  r="1.5" fill="currentColor"/>
        <path d="M10 13.5h4l-.5 3.5h-3z" fill="currentColor"/>
        <path d="M6 5L4 3M18 5L20 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M5 8L3 7M19 8L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>
    ),
    'Aeldari': (
      // Crystal gem / Eldar rune
      <><polygon points="12,2 18,8 18,16 12,22 6,16 6,8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <polygon points="12,5 16,9 16,15 12,19 8,15 8,9" fill="none" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="12" y1="2"  x2="12" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
        <line x1="6"  y1="8"  x2="18" y2="16" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
        <line x1="18" y1="8"  x2="6"  y2="16" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/></>
    ),
    'Drukhari': (
      // Spiked crescent claw
      <><path d="M6 4 Q14 2 20 8 L17.5 10 Q13 5 7 6.5z" fill="currentColor"/>
        <path d="M7.5 7 L6 21 Q11 19 13 17 Q11 12 7.5 7z" fill="currentColor" opacity="0.8"/>
        <line x1="20" y1="8"  x2="22" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="11" x2="22" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="17" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
    ),
    'Necrons': (
      // Angular geometric skull
      <><rect x="6"   y="5"  width="12" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="8.5"  y="8"  width="2.5" height="3"  rx="0.5" fill="currentColor"/>
        <rect x="13"   y="8"  width="2.5" height="3"  rx="0.5" fill="currentColor"/>
        <line x1="6"  y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1"/>
        <rect x="8"   y="15" width="3" height="4" rx="0.5" fill="currentColor"/>
        <rect x="13"  y="15" width="3" height="4" rx="0.5" fill="currentColor"/></>
    ),
    "T'au Empire": (
      // Circle with T symbol (Tau caste)
      <><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="6.5" y1="8" x2="17.5" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="12"  y1="8" x2="12"   y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="9"   y1="13" x2="15"  y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>
    ),
    'Orks': (
      // Skull with tusks
      <><circle cx="12" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9"  cy="9"  r="2" fill="currentColor"/>
        <circle cx="15" cy="9"  r="2" fill="currentColor"/>
        <path d="M9 14h6l-.5 2h-5z" fill="currentColor"/>
        <line x1="8"  y1="15" x2="5.5" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="16" y1="15" x2="18.5" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></>
    ),
    'Leagues of Votann': (
      // Runic tablet with angular inscription
      <><rect x="7" y="2" width="10" height="20" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7"  y1="9"  x2="17" y2="9"  stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7"  y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9.5 6L9 9 M12 5v4 M14.5 6L15 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M9 12l3 2 3-2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M9.5 17L9 20 M14.5 17L15 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>
    ),
    'Tyranids': (
      // Two curved scything talons
      <><path d="M12 2 Q17 4 19 9 Q21 15 19 20 L17 18 Q18.5 13 17 9 Q15 5 12 5z" fill="currentColor"/>
        <path d="M12 2 Q7 4 5 9 Q3 15 5 20 L7 18 Q5.5 13 7 9 Q9 5 12 5z"          fill="currentColor"/>
        <circle cx="12" cy="20" r="2.5" fill="currentColor"/></>
    ),
    'Genestealer Cults': (
      // 6-armed rising star
      <><circle cx="12" cy="12" r="3" fill="currentColor"/>
        <line x1="12" y1="2"  x2="12" y2="9"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="2.5" y1="7.5" x2="9"  y2="10.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="15"  y1="13.5" x2="21.5" y2="16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="2.5" y1="16.5" x2="9"   y2="13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="15"  y1="10.5" x2="21.5" y2="7.5"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></>
    ),
  };

  const iconJsx = icons[faction] || (
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  );

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`faction-icon ${className}`}
      style={{ color: col, flexShrink: 0 }}
      aria-label={faction}
    >
      {iconJsx}
    </svg>
  );
};

// FactionIcon — prefers real badge image, falls back to hand-drawn SVG
const FactionIcon = ({ faction, size = 24, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const col = FACTION_COLORS[faction]?.primary || '#6b7280';
  const imgUrl = FACTION_IMAGE_URLS[faction];

  if (imgUrl && !imgFailed) {
    return (
      <img
        src={imgUrl}
        alt={faction}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        className={`faction-icon ${className}`}
        style={{
          flexShrink: 0,
          filter: `drop-shadow(0 0 5px ${col}90) brightness(1.1)`,
          objectFit: 'contain',
        }}
      />
    );
  }

  return <FactionSVGFallback faction={faction} size={size} col={col} className={className} />;
};

// ── Unit type classification for spawn suggestions ─────────────
const getUnitType = (unitName) => {
  const n = unitName.toLowerCase();
  if (/tyrant|carnifex|greater daemon|bloodthirster|lord of change|great unclean|keeper of|dreadknight|wraithlord|wraithknight|gorkanaut|morkanaut|trygon|exocrine|tyrannofex|haruspex|mutalith|soul grinder|defiler|forgefiend|maulerfiend|bloat.drone|plagueburst|lord of skulls/i.test(n)) return 'monster';
  if (/land raider|predator|leman russ|basilisk|manticore|hellhound|hammerhead|riptide|stormsurge|repulsor|gladiator|caladius|coronus|telemon|doomsday|monolith|doomstalker|battlewagon|hekaton|colossus|sagitaur|dunecrawler|kastelan|archaeopter|blight hauler|vindicator|chimera|immolator|exorcist|raider|ravager|falcon|fire prism|wave serpent|rhino/i.test(n)) return 'vehicle';
  if (/outriders|bikers|rough rider|reavers|hellions|serberys|hernkyn|war dog|armiger|knight paladin|knight errant|knight gallant|knight preceptor|knight castellan|knight crusader|dominus|canis rex|stormraven|vertus praetor/i.test(n)) return 'cavalry';
  if (/gargoyle|swooping hawk|pteraxii|stormboyz/i.test(n)) return 'flyer';
  if (/\(1\)$|superior|repentia superior|kelermorph|nexos/i.test(n)) return 'character';
  return 'infantry';
};

const UNIT_TYPE_LABELS = {
  infantry:  { label: 'Infantry',  color: '#86efac', Icon: Users },
  cavalry:   { label: 'Cavalry',   color: '#fde68a', Icon: Swords },
  vehicle:   { label: 'Armour',    color: '#93c5fd', Icon: Shield },
  monster:   { label: 'Monster',   color: '#f87171', Icon: Skull },
  flyer:     { label: 'Flyer',     color: '#c4b5fd', Icon: Zap },
  character: { label: 'Character', color: '#fcd34d', Icon: Trophy },
};

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

const BRACKET_ORDER = ['3-4', '5-6', '7-9', '10+'];
const getBracketBelow = (bracket) => {
  const idx = BRACKET_ORDER.indexOf(bracket);
  return idx > 0 ? BRACKET_ORDER[idx - 1] : null;
};
const pickUnit = (faction, bracket, exclude = []) => {
  const units = SPAWN_TABLES[faction]?.[bracket] || [];
  const available = units.filter(u => !exclude.includes(u));
  const pool = available.length > 0 ? available : units;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};
const pickUnits = (faction, bracket, count, exclude = []) => {
  const units = SPAWN_TABLES[faction]?.[bracket] || [];
  const available = units.filter(u => !exclude.includes(u));
  const pool = available.length > 0 ? available : units;
  return shuffle([...pool]).slice(0, count);
};
// ==================== COMPONENTS ====================
const Card = ({ children, className = '', onClick, faction }) => {
  const fCol = faction ? FACTION_COLORS[faction] : null;
  const style = fCol
    ? { background: fCol.bg, borderColor: fCol.border }
    : {};
  return (
    <div
      className={`gothic-card gothic-corners bg-gray-900 rounded-lg border border-gray-700 ${onClick ? 'cursor-pointer hover:border-purple-500 transition-colors' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
  const baseClasses = 'gothic-subheading font-semibold rounded-lg transition-all flex items-center justify-center gap-2 tracking-wide';
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variantClasses = {
    primary:   'bg-purple-800 hover:bg-purple-700 text-purple-100 border border-purple-600',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600',
    danger:    'bg-red-900 hover:bg-red-800 text-red-100 border border-red-700',
    success:   'bg-green-900 hover:bg-green-800 text-green-100 border border-green-700',
    ghost:     'bg-transparent hover:bg-gray-800 text-gray-400 border border-transparent',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const PlayerCard = ({ player, onUpdateSP, onUpdateCP, isActive, isMyPlayer }) => (
<Card className={`p-4 ${isActive ? 'ring-1' : ''}`} style={isActive ? { boxShadow: `0 0 12px ${FACTION_COLORS[player.faction]?.border || 'rgba(147,51,234,0.4)'}` } : {}}>
<div className="flex items-center justify-between gap-2 mb-3 min-w-0">
<div className="flex items-center gap-2 min-w-0">
  <FactionIcon faction={player.faction} size={20} />
  <span className="font-bold text-white truncate text-sm gothic-subheading" style={{ letterSpacing: '0.05em' }}>{player.name}</span>
  {isMyPlayer && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(147,51,234,0.3)', color: '#c4b5fd', fontSize: '0.6rem' }}>YOU</span>}
</div>
<span className="text-xs text-gray-600 truncate shrink-0 max-w-[40%]">{player.faction}</span>
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
  <div className="misery-card-bg gothic-card gothic-corners rounded-lg p-4 border blood-border relative">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <Skull className="blood-glow" size={20} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 6px rgba(220,0,0,0.8))' }} />
        <span className="text-red-500 text-xs gothic-subheading tracking-widest">MISERY CARD #{card.id}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-red-400 transition-colors">
          <X size={16} />
        </button>
      )}
    </div>
    <div className="gothic-divider mb-2" />
    <h3 className="text-red-200 font-bold mb-2 gothic-subheading tracking-wide" style={{ fontSize: '1rem' }}>{card.name}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{card.effect}</p>
  </div>
);

const SecondaryCard = ({ mission, status, onComplete, onFail }) => {
  const statusStyle = {
    success: { border: 'rgba(34,197,94,0.4)', glow: 'rgba(34,197,94,0.15)', icon: '#22c55e' },
    failed:  { border: 'rgba(239,68,68,0.4)',  glow: 'rgba(239,68,68,0.15)', icon: '#ef4444' },
    active:  { border: 'rgba(234,179,8,0.4)',  glow: 'rgba(234,179,8,0.08)', icon: '#eab308' },
  }[status] || { border: 'rgba(234,179,8,0.4)', glow: 'rgba(234,179,8,0.08)', icon: '#eab308' };
  return (
    <div className="gothic-card gothic-corners rounded-lg p-4 border" style={{ borderColor: statusStyle.border, background: `linear-gradient(135deg, rgba(15,12,25,0.95) 0%, rgba(8,5,15,0.98) 100%)`, boxShadow: `0 0 15px ${statusStyle.glow}` }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: statusStyle.icon }} />
          <span className="text-xs gothic-subheading tracking-widest" style={{ color: statusStyle.icon }}>SECONDARY #{mission.id}</span>
        </div>
        {status !== 'active' && (
          <span className="text-xs px-2 py-0.5 rounded gothic-subheading" style={{ background: `${statusStyle.icon}20`, color: statusStyle.icon }}>
            {status === 'success' ? 'COMPLETED' : 'FAILED'}
          </span>
        )}
      </div>
      <div className="gothic-divider mb-2" />
      <h3 className="text-white font-bold mb-2 gothic-subheading" style={{ letterSpacing: '0.06em' }}>{mission.name}</h3>
      <p className="text-gray-400 text-sm mb-3 leading-relaxed">{mission.condition}</p>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="p-2 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="text-green-500 block mb-1 gothic-subheading tracking-widest text-xs">REWARD</span>
          <span className="text-gray-300">{mission.reward}</span>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="text-red-500 block mb-1 gothic-subheading tracking-widest text-xs">PUNISHMENT</span>
          <span className="text-gray-300">{mission.punishment}</span>
        </div>
      </div>
      {status === 'active' && (
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={onComplete} className="flex-1">Complete</Button>
          <Button variant="danger" size="sm" onClick={onFail} className="flex-1">Fail</Button>
        </div>
      )}
    </div>
  );
};

const getBracket = (value) => {
  if (value <= 2) return 'No Spawn';
  if (value <= 4) return '3-4';
  if (value <= 6) return '5-6';
  if (value <= 9) return '7-9';
  return '10+';
};
const BRACKET_PTS = { '3-4': '~75 pts', '5-6': '80-170 pts', '7-9': '175-295 pts', '10+': '300+ pts' };
const SpawnRoller = ({ round, spawnModifier, hardMode, faction, onLogSpawn }) => {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [sugg, setSugg] = useState(null);
  // sugg: null | { bracket, unit, shown: string[], phase: 'initial'|'alts', altSame?, altLower? }
  const getBaseModifier = () => {
    if (hardMode) {
      if (round === 1) return 0;
      if (round === 2) return 1;
      if (round === 3) return 2;
      return 3;
    } else {
      if (round <= 2) return 0;
      if (round <= 4) return 1;
      return 2;
    }
  };
  const baseModifier = getBaseModifier();
  const totalModifier = baseModifier + spawnModifier;
  const handleRoll = () => {
    setRolling(true);
    setSugg(null);
    setTimeout(() => {
      const roll = roll2D6();
      const modified = roll + totalModifier;
      const isNoSpawn = roll === 2;
      const bracket = isNoSpawn ? 'No Spawn' : getBracket(modified);
      setResult({ roll, modified, isNoSpawn, bracket });
      setRolling(false);
      if (!isNoSpawn) {
        const unit = pickUnit(faction, bracket);
        if (unit) setSugg({ bracket, unit, shown: [unit], phase: 'initial' });
      }
    }, 500);
  };
  const handleAccept = (units) => {
    onLogSpawn?.({ round, bracket: sugg.bracket, units: Array.isArray(units) ? units : [units] });
    setSugg(null);
  };
  const buildAlts = (currentShown, bracket) => {
    const shown = [...currentShown];
    const altSame = pickUnit(faction, bracket, shown);
    if (altSame) shown.push(altSame);
    const bracketBelow = getBracketBelow(bracket);
    const altLower = bracketBelow ? pickUnits(faction, bracketBelow, 2, []) : null;
    return { altSame, altLower, shown };
  };
  const handleRefuse = () => {
    const { altSame, altLower, shown } = buildAlts(sugg.shown, sugg.bracket);
    setSugg({ ...sugg, phase: 'alts', altSame, altLower, shown });
  };
  const handleNewAlts = () => {
    const extraShown = [...sugg.shown];
    if (sugg.altSame) extraShown.push(sugg.altSame);
    const { altSame, altLower, shown } = buildAlts(extraShown, sugg.bracket);
    setSugg({ ...sugg, phase: 'alts', altSame, altLower, shown });
  };
  // Bracket threat-level config
  const BRACKET_THEME = {
    'No Spawn': { color: '#6b7280', label: 'No Spawn',    glow: 'rgba(107,114,128,0.3)' },
    '3-4':      { color: '#86efac', label: 'Skirmish',    glow: 'rgba(134,239,172,0.3)' },
    '5-6':      { color: '#fde68a', label: 'Assault',     glow: 'rgba(253,230,138,0.35)' },
    '7-9':      { color: '#fb923c', label: 'Onslaught',   glow: 'rgba(251,146,60,0.4)' },
    '10+':      { color: '#f87171', label: 'OVERWHELMING', glow: 'rgba(248,113,113,0.5)' },
  };

  const UnitEntry = ({ unit, onAccept, label, tierColor }) => {
    const type = getUnitType(unit);
    const typeInfo = UNIT_TYPE_LABELS[type] || UNIT_TYPE_LABELS.infantry;
    const TypeIcon = typeInfo.Icon;
    return (
      <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(20,15,30,0.8)', border: `1px solid ${tierColor}40` }}>
        {label && <div className="text-xs mb-1 gothic-subheading tracking-widest" style={{ color: tierColor }}>{label}</div>}
        <div className="flex items-center gap-2 mb-2">
          <TypeIcon size={14} style={{ color: typeInfo.color, flexShrink: 0 }} />
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>{typeInfo.label}</span>
          <span className="text-white font-bold text-sm">{unit}</span>
        </div>
        <Button variant="success" size="sm" onClick={() => onAccept(unit)} className="w-full">
          <Check size={13} /> Deploy
        </Button>
      </div>
    );
  };

  const factionCol = FACTION_COLORS[faction] || {};

  return (
    <Card className="p-4">
      {/* Header with faction identity */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: factionCol.bg, border: `1px solid ${factionCol.border}` }}>
          <FactionIcon faction={faction} size={28} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Dices className="text-purple-400" size={16} />
            <span className="text-white font-bold gothic-subheading tracking-wide text-sm">SPAWN ROLLER</span>
          </div>
          <span className="text-gray-500 text-xs">{faction}</span>
        </div>
      </div>

      {/* Modifier strip */}
      <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gray-950 border border-gray-800">
        <div className="text-xs text-gray-500 flex gap-1 items-center">
          <span>Round</span>
          <span className="text-purple-400 font-bold">+{baseModifier}</span>
        </div>
        {spawnModifier !== 0 && (
          <div className="text-xs text-gray-500 flex gap-1 items-center">
            <span>Extra</span>
            <span className={`font-bold ${spawnModifier > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {spawnModifier > 0 ? '+' : ''}{spawnModifier}
            </span>
          </div>
        )}
        <div className="text-xs text-gray-500 flex gap-1 items-center ml-auto">
          <span>Total</span>
          <span className="text-amber-400 font-bold">+{totalModifier}</span>
        </div>
      </div>

      <Button onClick={handleRoll} disabled={rolling} className={`w-full mb-4 ${rolling ? 'dice-rolling' : ''}`}>
        <Dices size={18} className={rolling ? 'dice-rolling' : ''} />
        {rolling ? 'Rolling...' : 'Roll 2D6 — Spawn'}
      </Button>

      {/* Result display */}
      {result && (() => {
        const theme = BRACKET_THEME[result.bracket] || BRACKET_THEME['No Spawn'];
        return (
          <div
            className={`p-4 rounded-lg mb-4 ${result.isNoSpawn ? 'dim-pulse' : 'spawn-pulse'}`}
            style={{
              background: result.isNoSpawn
                ? 'rgba(20,20,30,0.8)'
                : `linear-gradient(135deg, rgba(20,10,30,0.9) 0%, rgba(40,5,5,0.8) 100%)`,
              border: `1px solid ${theme.glow}`,
              boxShadow: result.isNoSpawn ? 'none' : `0 0 20px ${theme.glow}`,
            }}
          >
            {/* Dice values */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">RAW</span>
                <span className="text-white font-mono font-bold text-lg">{result.roll}</span>
              </div>
              <div className="text-gray-600 text-xs">+{totalModifier} mod</div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">TOTAL</span>
                <span className="font-mono font-bold text-lg" style={{ color: theme.color }}>{result.modified}</span>
              </div>
            </div>

            <div className="gothic-divider mb-3" />

            {/* Bracket result */}
            <div className="text-center">
              <div className="text-xs gothic-subheading tracking-widest mb-1" style={{ color: theme.color, opacity: 0.7 }}>
                THREAT LEVEL
              </div>
              <div className="gothic-subheading font-bold mb-1" style={{ fontSize: '2rem', color: theme.color, lineHeight: 1 }}>
                {result.isNoSpawn ? 'NO SPAWN' : result.bracket}
              </div>
              <div className="text-xs font-semibold mb-1" style={{ color: theme.color }}>
                {theme.label}
              </div>
              {!result.isNoSpawn && (
                <div className="text-xs text-gray-500">{BRACKET_PTS[result.bracket]}</div>
              )}
              {result.isNoSpawn && (
                <div className="text-xs text-gray-500 italic mt-1">Unmodified 2 — no reinforcements</div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Initial suggestion */}
      {sugg && sugg.phase === 'initial' && (() => {
        const theme = BRACKET_THEME[sugg.bracket] || {};
        return (
          <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(10,5,20,0.95)', border: `1px solid ${theme.glow || '#444'}` }}>
            <div className="text-xs gothic-subheading tracking-widest mb-2" style={{ color: theme.color }}>
              SUGGESTED SPAWN — {sugg.bracket}
            </div>
            <UnitEntry unit={sugg.unit} onAccept={handleAccept} tierColor={theme.color || '#888'} />
            <Button variant="secondary" size="sm" onClick={handleRefuse} className="w-full">
              <RefreshCw size={13} /> Request Alternatives
            </Button>
          </div>
        );
      })()}

      {/* Alternatives */}
      {sugg && sugg.phase === 'alts' && (() => {
        const theme = BRACKET_THEME[sugg.bracket] || {};
        const lowerBracket = getBracketBelow(sugg.bracket);
        const lowerTheme = lowerBracket ? BRACKET_THEME[lowerBracket] : null;
        return (
          <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(10,5,20,0.95)', border: `1px solid ${theme.glow || '#444'}` }}>
            <div className="text-xs gothic-subheading tracking-widest mb-3" style={{ color: theme.color }}>
              ALTERNATIVE REINFORCEMENTS
            </div>
            {sugg.altSame && (
              <UnitEntry
                unit={sugg.altSame}
                onAccept={handleAccept}
                label={`SAME TIER — ${sugg.bracket}`}
                tierColor={theme.color || '#888'}
              />
            )}
            {sugg.altLower && sugg.altLower.length > 0 && (
              <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(20,15,30,0.8)', border: `1px solid ${lowerTheme?.glow || '#444'}40` }}>
                <div className="text-xs mb-1 gothic-subheading tracking-widest" style={{ color: lowerTheme?.color }}>
                  TIER BELOW — {lowerBracket} ({BRACKET_PTS[lowerBracket]})
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {sugg.altLower.map(u => {
                    const type = getUnitType(u);
                    const typeInfo = UNIT_TYPE_LABELS[type] || UNIT_TYPE_LABELS.infantry;
                    const TypeIcon = typeInfo.Icon;
                    return (
                      <span key={u} className="flex items-center gap-1">
                        <TypeIcon size={12} style={{ color: typeInfo.color }} />
                        <span className="text-white text-sm font-bold">{u}</span>
                      </span>
                    );
                  })}
                </div>
                <Button variant="success" size="sm" onClick={() => handleAccept(sugg.altLower)} className="w-full">
                  <Check size={13} /> Deploy Both
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleNewAlts} className="w-full mt-1">
              <RefreshCw size={13} /> Show More Options
            </Button>
          </div>
        );
      })()}
    </Card>
  );
};

// ==================== FOOTER ====================
const Footer = () => (
  <div className="py-6 px-4 text-center border-t border-gray-800 mt-8">
    <p className="text-gray-500 text-sm mb-3">If you're enjoying Horde Mode Companion, consider buying me a coffee!</p>
    <a
      href="https://paypal.me/joshbe2802"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
    >
      ☕ Support on PayPal
    </a>
    <p className="text-gray-700 text-xs mt-3">paypal.me/joshbe2802</p>
  </div>
);

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
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #09090f 60%, #120510 100%)' }}>
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          {/* Gothic skull with glow */}
          <div className="relative inline-block mb-4">
            <Skull className="text-red-700 mx-auto" size={64} style={{ filter: 'drop-shadow(0 0 18px rgba(180,0,0,0.7))' }} />
          </div>
          <h1 className="gothic-decorative text-5xl font-bold mb-1 gold-shimmer" style={{ color: '#c9a84c', letterSpacing: '0.18em' }}>
            HORDE
          </h1>
          <h2 className="gothic-decorative text-3xl font-bold mb-3" style={{ color: '#c9a84c', letterSpacing: '0.22em', opacity: 0.85 }}>
            MODE
          </h2>
          <div className="gothic-divider mx-8 mb-3" />
          <p className="text-gray-500 text-xs gothic-subheading tracking-widest">40K COOPERATIVE COMPANION</p>
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
        <Footer />
      </div>
    </div>
  );
};

// ==================== WAITING SCREEN ====================
const WaitingScreen = ({ sessionCode }) => (
  <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(160deg, #09090f 60%, #120510 100%)' }}>
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 border-2 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{ borderTopColor: 'transparent', borderColor: 'rgba(147,51,234,0.6)' }}></div>
      <h2 className="gothic-subheading text-xl font-bold text-gray-300 mb-2 tracking-widest">AWAITING COMMAND</h2>
      <p className="text-gray-600 mb-6 text-sm">The host is preparing the battlefield...</p>
      <div className="rounded-xl p-5 imperial-border gothic-card gothic-corners" style={{ background: 'rgba(15,10,25,0.9)' }}>
        <p className="text-gray-600 text-xs gothic-subheading tracking-widest mb-2">SESSION CODE</p>
        <p className="text-5xl font-mono font-bold tracking-widest gold-shimmer" style={{ color: '#c9a84c' }}>{sessionCode}</p>
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
<div className="min-h-screen p-4" style={{ background: 'linear-gradient(160deg, #09090f 60%, #120510 100%)' }}>
<div className="max-w-2xl mx-auto">
<div className="text-center mb-6">
  <Skull className="text-red-700 mx-auto mb-2" size={36} style={{ filter: 'drop-shadow(0 0 10px rgba(180,0,0,0.6))' }} />
  <h1 className="gothic-decorative text-4xl font-bold gold-shimmer mb-1" style={{ color: '#c9a84c', letterSpacing: '0.18em' }}>HORDE MODE</h1>
  <div className="gothic-divider mx-16 mb-2" />
  <p className="text-gray-600 text-xs gothic-subheading tracking-widest">GAME SETUP</p>
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
<label className="block text-gray-400 mb-3 text-xs gothic-subheading tracking-widest uppercase">Horde Faction</label>
{/* Faction grid picker */}
<div className="grid grid-cols-3 gap-2 mb-3">
  {FACTIONS.map(f => {
    const fc = FACTION_COLORS[f];
    const isSelected = hordeFaction === f;
    return (
      <button
        key={f}
        onClick={() => setHordeFaction(f)}
        className="flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center"
        style={{
          background: isSelected ? fc?.bg : 'rgba(30,30,40,0.6)',
          borderColor: isSelected ? fc?.border : 'rgba(75,75,90,0.4)',
          boxShadow: isSelected ? `0 0 12px ${fc?.border}` : 'none',
        }}
        title={f}
      >
        <FactionIcon faction={f} size={22} />
        <span className="text-gray-300 leading-tight" style={{ fontSize: '0.55rem', lineHeight: '1.2' }}>{f}</span>
      </button>
    );
  })}
</div>
{HORDE_FACTION_RULES[hordeFaction] && (
<div className="mt-2 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
<span className="text-purple-400 font-bold">{HORDE_FACTION_RULES[hordeFaction].name}</span>
<p className="text-gray-300 text-sm mt-1">{HORDE_FACTION_RULES[hordeFaction].effect}</p>
</div>
              )}
</div>
<div className="flex items-center flex-wrap gap-3">
<button
onClick={() => setHardMode(!hardMode)}
className={`w-12 h-6 shrink-0 rounded-full transition-colors ${hardMode ? 'bg-red-600' : 'bg-gray-600'}`}
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
<div key={player.id} className="flex flex-col gap-2">
  <div className="flex items-center gap-3">
    <div className={`w-4 h-4 shrink-0 rounded-full ${player.color}`}></div>
    <input
      type="text"
      value={player.name}
      onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
      className="flex-1 min-w-0 bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
      placeholder="Player name"
    />
  </div>
  <select
    value={player.faction}
    onChange={(e) => updatePlayer(player.id, 'faction', e.target.value)}
    className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
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
<Footer />
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
const logSpawn = (entry) => {
  onUpdateState({
    ...gameState,
    spawnLog: [...(gameState.spawnLog || []), entry]
  });
};
return (
<div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #09090f 60%, #120510 100%)' }}>
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
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-3 h-3 shrink-0 rounded-full ${player.color}`}></div>
                  <span className="font-bold truncate">{player.name}</span>
                  <span className="text-sm opacity-70 truncate">{player.faction}</span>
                </div>
                {status === 'taken' && <span className="text-xs text-gray-500 shrink-0">Taken</span>}
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
<div className="border-b p-3" style={{ background: 'linear-gradient(180deg, #0f0010 0%, #09090f 100%)', borderColor: 'rgba(100,60,150,0.3)' }}>
<div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
<div className="flex items-center gap-3 min-w-0">
  <div className="p-1.5 rounded" style={{ background: FACTION_COLORS[hordeFaction]?.bg, border: `1px solid ${FACTION_COLORS[hordeFaction]?.border}` }}>
    <FactionIcon faction={hordeFaction} size={26} />
  </div>
  <div className="min-w-0">
    <h1 className="gothic-decorative font-bold leading-none" style={{ color: '#c9a84c', fontSize: '1.1rem', letterSpacing: '0.15em' }}>HORDE MODE</h1>
    <p className="text-gray-500 text-xs truncate gothic-subheading" style={{ letterSpacing: '0.05em' }}>
      vs {hordeFaction}{hardMode && ' • ⚠ HARD'} • <span className="text-purple-400 font-mono">{sessionCode}</span>
    </p>
  </div>
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
<Card key={player.id} className="p-4" faction={player.faction}>
<div className="flex items-center gap-3 mb-4 min-w-0">
<FactionIcon faction={player.faction} size={32} />
<div className="min-w-0">
  <h3 className="text-lg font-bold text-white truncate gothic-subheading" style={{ letterSpacing: '0.08em' }}>{player.name}</h3>
  <span className="text-gray-500 text-xs">{player.faction}</span>
</div>
{isMe && <span className="ml-auto shrink-0 px-2 py-0.5 rounded text-xs gothic-subheading" style={{ background: 'rgba(147,51,234,0.3)', color: '#c4b5fd' }}>YOU</span>}
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
faction={hordeFaction}
onLogSpawn={logSpawn}
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
{gameState.spawnLog && gameState.spawnLog.length > 0 && (
<Card className="p-4">
<h3 className="text-white font-bold mb-3">Spawn Log</h3>
<div className="space-y-2">
{gameState.spawnLog.map((entry, idx) => (
<div key={idx} className="flex items-center gap-3 bg-gray-900 rounded-lg p-2 text-sm">
<span className="text-gray-500 w-6">R{entry.round}</span>
<span className="px-2 py-0.5 bg-purple-800 text-purple-200 rounded text-xs font-bold">{entry.bracket}</span>
<span className="text-white flex-1">{entry.units.join(' + ')}</span>
</div>
                ))}
</div>
</Card>
            )}
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
<div className="flex items-center justify-center gap-1.5 min-w-0">
<div className={`w-3 h-3 shrink-0 rounded-full ${p.color}`}></div>
<span className="text-sm truncate">{p.name}</span>
<span className="text-yellow-400 font-bold shrink-0">{p.sp}SP</span>
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
<Footer />
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
      spawnLog: [],
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
