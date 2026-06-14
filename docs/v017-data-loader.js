// Prototype v0.17 Browser Integration Pass.
// Loads the v0.16 tabletop CSV files into the live browser board game.
// This file runs before play.js and replaces the older built-in 40-space/3-stat data.

(function loadV017Data() {
  const DATA_VERSION = "v0.17";

  const CHARACTER_CSV = `id,name,starting_money,starting_sanity,starting_freedom,starting_influence,power,weakness,flavor
CHAR001,The Prepper,5,5,6,2,"Start with 2 Survival cards instead of 1.","Lose 1 Influence whenever a Scandal card targets you directly.","You were early. Annoyingly early."
CHAR002,The Influencer,4,4,5,6,"Once per game, turn any Influence loss into an equal Influence gain.","Lose 1 extra Sanity from Scandal cards.","Your ring light is emergency equipment."
CHAR003,The Crypto Bro,6,4,4,4,"When you gain Money from a card, gain +1 extra Money.","When Market collapses, lose 1 extra Money.","You are either early or ruined. Often both."
CHAR004,The Remote Worker,5,6,4,3,"Ignore the first Pandemic Panic penalty that hits you.","Tech Leap spaces force you to choose Influence over movement.","Your commute is twelve steps and an existential crisis."
CHAR005,The Activist,4,4,5,5,"When Control rises, you may gain 1 Influence once per round.","When Panic collapses, lose 1 extra Sanity.","You cannot log off because the timeline needs you."
CHAR006,The Normie,5,5,5,3,"Once per game, reroll the die or redraw a card.","No passive bonus.","You just wanted groceries and a normal decade."`;

  const BOARD_CSV = `space_number,year,label,space_type,effect,red_cycle_effect,blue_cycle_effect
1,2020,Normal Was Cancelled,Timeline,"Start here. Welcome to the decade.","No effect.","No effect."
2,2020,Lockdown Begins,Pandemic Panic,"Lose 1 Sanity or 1 Freedom.","Gain 1 Freedom if you protest the rules.","Gain 1 Influence if you post the rules."
3,2020,Toilet Paper Economy,Market Crash,"Lose 1 Money or discard a Survival card.","Gain 1 Money if you have The Prepper.","Lower Panic by 1 if you share supplies."
4,2020,Square And Compass,Square & Compass,"Draw one Conspiracy card.","Panic rises by 1.","Control rises by 1."
5,2020,Remote Everything,Tech Leap,"Gain 1 Influence or move forward 1.","Gain 1 Money if your Influence is 4+.","Gain 1 Influence if your Sanity is 4+."
6,2020,Murder Hornet Panic,Breaking News,"Draw one Headline card.","Panic rises by 1.","Panic rises by 1."
7,2021,New Year Same Timeline,Timeline,"Recover 1 Sanity.","Gain 1 Freedom.","Gain 1 Influence."
8,2021,Expert Panel Weekend,Breaking News,"Draw one Headline card.","Lose 1 Sanity unless Money is 5+.","Control rises by 1."
9,2021,Side Hustle Season,Survival Check,"Draw one Survival card.","Gain 1 Money.","Gain 1 Influence."
10,2021,Algorithm Rabbit Hole,Square & Compass,"Draw one Conspiracy card.","Panic rises by 1.","Panic rises by 1."
11,2021,Crypto Candle Worship,Market Crash,"Roll. 1-3 lose 1 Money. 4-6 gain 1 Money.","Gain +1 Money on a win.","Market rises by 1 either way."
12,2021,Comment Section Court,Scandal,"Draw one Scandal card.","Lose 1 Influence if Panic is 4+.","Lose 1 Sanity if Control is 4+."
13,2022,Inflation Goblin,Market Crash,"Lose 1 Money.","Gain 1 Freedom if Money is still 5+.","Gain 1 Influence if you lower Market by 1."
14,2022,Supply Chain Side Quest,Breaking News,"Draw one Headline card.","Draw a Survival card if you lose Money.","Control rises by 1 if anyone loses Money."
15,2022,Touch Grass Moment,Awakening,"Recover 1 Sanity or 1 Freedom.","Recover Freedom.","Recover Sanity."
16,2022,War Rumour Cycle,Breaking News,"Draw one Headline card.","Panic rises by 1.","Panic rises by 1."
17,2022,The Podcast Era,Tech Leap,"Gain 1 Influence and lose 1 Sanity.","Gain +1 Influence.","Lose no Sanity if Influence is 5+."
18,2022,Secret Door In The Feed,Square & Compass,"Draw one Conspiracy card.","Move forward 1 after resolving.","Control rises by 1 after resolving."
19,2023,Bank App Sweats,Market Crash,"Market rises by 1. Lose 1 Money if Market is already 4+.","Gain 1 Money if you are The Crypto Bro.","Lower Market by 1 if you discard a Survival card."
20,2023,Everything Is A Subscription,Timeline,"Lose 1 Money or 1 Sanity.","Lose Money.","Lose Sanity."
21,2023,Celebrity Apology Loop,Scandal,"Draw one Scandal card.","Gain 1 Influence if you have Influence 3 or less.","Lose 1 Influence if you have Influence 6+."
22,2023,AI Demo Day,Tech Leap,"Choose: gain 1 Influence or move forward 2 and lose 1 Money.","Gain 1 Money if you choose Influence.","Gain +1 Influence if you choose Influence."
23,2023,Square And Compass,Square & Compass,"Draw one Conspiracy card.","Panic rises by 1.","Control rises by 1."
24,2023,Offline Weekend,Awakening,"Recover 2 Sanity but skip any Influence gain this turn.","Recover 1 Freedom too.","Lower Panic by 1 too."
25,2024,Election Year,Election Year,"Apply current cycle effect, then switch cycles.","Gain 1 Freedom. Panic rises by 1.","Gain 1 Influence. Control rises by 1."
26,2024,Deepfake Debate,Breaking News,"Draw one Headline card.","Lose 1 Sanity if Influence 5+.","Lose 1 Influence if Sanity 3 or less."
27,2024,Polling Error Portal,Timeline,"Move forward 1 or backward 1. Your choice.","If backward, gain 1 Money.","If forward, gain 1 Influence."
28,2024,Media Meltdown,Scandal,"Draw one Scandal card.","Panic rises by 1.","Control rises by 1."
29,2024,The Timeline Glitches,Square & Compass,"Draw one Conspiracy card.","Switch places with the player behind you if any.","Switch places with the player ahead of you if any."
30,2024,Victory Speech Confusion,Timeline,"Everyone gains 1 Influence and loses 1 Sanity.","Gain 1 Freedom.","Control rises by 1."
31,2025,New Normal DLC,Timeline,"Recover 1 of any stat.","Recover Money or Freedom.","Recover Sanity or Influence."
32,2025,Smart Fridge Snitches,Tech Leap,"Gain 1 Influence but Control rises by 1.","Gain 1 Money too.","Control rises by +1 more."
33,2025,Global Summit Photo Op,Breaking News,"Draw one Headline card.","Gain 1 Money if Control is 3+.","Gain 1 Influence if Control is 3+."
34,2025,Scandal Weather System,Scandal,"Draw one Scandal card.","Panic rises by 1 if you lose Influence.","Control rises by 1 if you lose Influence."
35,2025,Community Garden Patch,Survival Check,"Draw one Survival card or lower Market by 1.","Gain 1 Freedom.","Lower Panic by 1."
36,2025,Conspiracy Corkboard,Square & Compass,"Draw one Conspiracy card.","Gain 1 Influence if Panic is 4+.","Gain 1 Sanity if Control is 4+."
37,2026,Attention Recession,Timeline,"Lose 1 Sanity or 1 Influence.","Lose Sanity.","Lose Influence."
38,2026,Market Optimism Mirage,Market Crash,"Gain 1 Money, then Market rises by 1.","Gain +1 Money.","Market rises by +1 more."
39,2026,AI Replaces The Meeting,Tech Leap,"Move forward 1 and gain 1 Sanity.","Gain 1 Money.","Gain 1 Influence."
40,2026,Square And Compass,Square & Compass,"Draw one Conspiracy card.","Panic rises by 1.","Control rises by 1."
41,2027,The Wellness Pivot,Awakening,"Recover 1 Sanity and draw one Survival card.","Recover Freedom too if Freedom is 3 or less.","Gain Influence too if Influence is 3 or less."
42,2027,Subscription Apocalypse,Market Crash,"Lose 1 Money or discard a Survival card.","Gain 1 Money if you have no held cards.","Lower Market by 1 if you discard."
43,2027,Public Apology Speedrun,Scandal,"Draw one Scandal card.","Gain 1 Influence if you pay 1 Money.","Lose 1 Sanity if you do not pay 1 Money."
44,2027,Drone Footage Goes Viral,Breaking News,"Draw one Headline card.","Gain 1 Influence.","Gain 1 Influence."
45,2027,Digital Detox Dare,Awakening,"Lose 1 Influence and recover 2 Sanity.","Recover 1 Freedom too.","Lower Panic by 1 too."
46,2027,Ancient Tablet Update,Square & Compass,"Draw one Conspiracy card.","Move forward 1 if Sanity is 5+.","Recover 1 Sanity if Freedom is 5+."
47,2028,Election Year Again,Election Year,"Apply current cycle effect, then switch cycles.","Gain 1 Money. Panic rises by 1.","Gain 1 Influence. Control rises by 1."
48,2028,Policy Patch Notes,Timeline,"Control rises by 1. Recover 1 Money.","Recover +1 Money.","Recover 1 Sanity."
49,2028,Everything Is Historic,Breaking News,"Draw one Headline card.","Panic rises by 1.","Control rises by 1."
50,2028,Social Credit Oops,Scandal,"Draw one Scandal card.","Lose 1 Influence if Control is 4+.","Lose 1 Freedom if Control is 4+."
51,2028,Off Grid Rumour,Survival Check,"Draw one Survival card.","Recover 1 Freedom.","Recover 1 Sanity."
52,2028,Reality Patch Failure,Square & Compass,"Draw one Conspiracy card.","Panic rises by 1.","Panic rises by 1."
53,2029,Final Boss Inflation,Market Crash,"Lose 1 Money. Market rises by 1.","Gain 1 Freedom if Money remains above 3.","Gain 1 Influence if you lower Market this turn."
54,2029,AI Campaign Manager,Tech Leap,"Gain 2 Influence but lose 1 Sanity.","Gain 1 Money too.","Control rises by 1."
55,2029,Last Scandal Before 2030,Scandal,"Draw one Scandal card.","Panic rises by 1.","Control rises by 1."
56,2029,The Algorithm Apologizes,Breaking News,"Draw one Headline card.","Recover 1 Sanity if Panic is 4+.","Recover 1 Freedom if Control is 4+."
57,2029,Touch Grass Finale,Awakening,"Recover 1 Sanity and 1 Freedom.","Gain 1 Money.","Gain 1 Influence."
58,2029,Square And Compass,Square & Compass,"Draw one Conspiracy card.","Move forward 1 after resolving.","Lower one meter by 1 after resolving."
59,2030,Almost Made It,Timeline,"All players check stats. If any stat is 0, enter NPC Mode before finishing.","Gain 1 Freedom.","Gain 1 Sanity."
60,2030,You Survived The 2020s,Finish,"Win if every stat is at least 1. Otherwise enter NPC Mode and try again.","Award Survivor Ending or Bunker Ending.","Award Survivor Ending or Awakened Ending."`;

  const CARD_CSV = `id,deck,name,type,effect_text,money_delta,sanity_delta,freedom_delta,influence_delta,panic_delta,control_delta,market_delta,holdable,choice_required,tags
H001,Headline,Murder Hornets Arrive,event,"Everyone loses 1 Sanity. Active player may move forward 1 if they spend 1 Money on ridiculous protective gear.",0,-1,0,0,1,0,0,false,true,pandemic|absurd
H002,Headline,Emergency Press Conference,event,"Choose: lose 1 Sanity from confusion or lose 1 Freedom by complying immediately.",0,0,0,0,1,1,0,false,true,panic|control
H003,Headline,Supply Chain Side Quest,event,"Lose 1 Money or discard a Survival card to ignore this.",-1,0,0,0,0,0,1,false,true,market|survival
H004,Headline,AI Takes Your Job,event,"Lose 1 Money. Then choose: gain 1 Influence by rebranding yourself or recover 1 Sanity by logging off.",-1,0,0,0,0,0,0,false,true,tech|choice
H005,Headline,Crypto Pumps Overnight,event,"Roll again. 1-3: lose 1 Money. 4-6: gain 2 Money. Market rises by 1.",0,0,0,0,0,0,1,false,false,market|crypto
H006,Headline,Another Historic Election,event,"Switch Red Cycle and Blue Cycle. Everyone gains 1 Influence and loses 1 Sanity.",0,-1,0,1,1,0,0,false,false,politics|cycle
H007,Headline,War Rumour Trends,event,"Everyone rolls. Lowest roll moves back 2 spaces. Panic rises by 1.",0,0,0,0,1,0,0,false,false,news|panic
H008,Headline,Expert Panel Contradicts Last Panel,event,"Choose: lose 1 Sanity or raise Control by 1 and gain 1 Influence for sounding informed.",0,0,0,0,0,0,0,false,true,media|control
H009,Headline,Inflation Has Entered The Chat,event,"Everyone loses 1 Money. Market rises by 1.",-1,0,0,0,0,0,1,false,false,market
H010,Headline,Celebrity Apology Video,event,"Choose: gain 1 Influence by reacting publicly or recover 1 Sanity by ignoring it.",0,0,0,0,0,0,0,false,true,social|influence
H011,Headline,Platform Changes The Rules,event,"Everyone with Influence 5 or higher loses 1 Influence. Everyone else gains 1 Influence.",0,0,0,0,0,0,0,false,false,tech|social
H012,Headline,Lockdown Nostalgia Spiral,event,"Lose 1 Sanity or lose 1 Freedom. Panic and Control each rise by 1.",0,0,0,0,1,1,0,false,true,pandemic|control
H013,Headline,New App Owns Your Attention,event,"Gain 1 Influence and lose 1 Sanity. Panic rises by 1.",0,-1,0,1,1,0,0,false,false,tech|social
H014,Headline,Market Recovery Narrative,event,"Choose: gain 1 Money now or lower Market by 1.",0,0,0,0,0,0,0,false,true,market|choice
H015,Headline,Drone Footage Goes Viral,event,"Gain 1 Influence. Then draw a Scandal card if your Influence is now 6 or higher.",0,0,0,1,0,0,0,false,false,social|scandal
H016,Headline,Energy Prices Spike,event,"Lose 1 Money or lose 1 Freedom by staying home for a round.",-1,0,0,0,0,0,1,false,true,market|freedom
H017,Headline,Everything Is A Subscription,event,"Lose 1 Money. If you have no Survival cards, lose 1 extra Sanity.",-1,0,0,0,0,0,1,false,false,market|modernlife
H018,Headline,The Algorithm Picks A Villain,event,"Choose any player with the highest Influence. That player loses 1 Influence and 1 Sanity.",0,-1,0,-1,1,0,0,false,true,social|panic
H019,Headline,Global Summit Photo Op,event,"Control rises by 1. Active player may gain 1 Influence by pretending to understand the agenda.",0,0,0,0,0,1,0,false,true,politics|control
H020,Headline,Good News Gets Buried,event,"Recover 1 Sanity, then Panic rises by 1 because nobody believes it.",0,1,0,0,1,0,0,false,false,absurd|sanity
C001,Conspiracy,You Found The Hidden Hand,event,"Move forward 2 spaces but lose 1 Sanity.",0,-1,0,0,0,0,0,false,false,conspiracy|movement
C002,Conspiracy,Do Your Own Research,event,"Draw 2 cards from any deck. Keep 1 and discard 1.",0,0,0,0,0,0,0,false,true,conspiracy|choice
C003,Conspiracy,Algorithm Rabbit Hole,event,"Lose 1 Sanity and gain 1 Influence.",0,-1,0,1,1,0,0,false,false,conspiracy|social
C004,Conspiracy,Secret Meeting In Davos,event,"Control rises by 2. If Control reaches 6, active player also loses 1 Freedom.",0,0,0,0,0,2,0,false,false,control|conspiracy
C005,Conspiracy,Flat Earth Shortcut,event,"Skip to the next corner. Lose 1 Influence because your map is terrible.",0,0,0,-1,0,0,0,false,false,absurd|movement
C006,Conspiracy,Red String Corkboard,event,"Choose: recover 1 Sanity by cleaning your room or gain 1 Influence by explaining the whole thing.",0,0,0,0,0,0,0,false,true,conspiracy|choice
C007,Conspiracy,The Birds Seem Suspicious,event,"Panic rises by 1. Draw a Survival card.",0,0,0,0,1,0,0,false,false,absurd|survival
C008,Conspiracy,Symbol On The Dollar,event,"Gain 1 Money and lose 1 Sanity.",1,-1,0,0,0,0,0,false,false,money|conspiracy
C009,Conspiracy,Podcast At 2x Speed,event,"Gain 1 Influence. If Panic is 4 or higher, lose 1 Sanity.",0,0,0,1,0,0,0,false,false,social|panic
C010,Conspiracy,The Timeline Glitches,event,"Swap places with the player directly ahead of you. If you are first, move back 1.",0,0,0,0,0,0,0,false,false,movement|chaos
C011,Conspiracy,Anonymous Thread Appears,event,"Choose: gain 2 Influence and raise Panic by 1 or ignore it and recover 1 Sanity.",0,0,0,0,0,0,0,false,true,social|choice
C012,Conspiracy,Ancient Tablet Update,event,"Recover 1 Sanity. Then choose one meter to lower by 1.",0,1,0,0,0,0,0,false,true,awakening|control
C013,Conspiracy,Black Helicopter Feeling,event,"Lose 1 Freedom or discard a Survival card.",0,0,-1,0,1,1,0,false,true,control|panic
C014,Conspiracy,Follow The Money,event,"Gain 1 Money. Market rises by 1.",1,0,0,0,0,0,1,false,false,money|market
C015,Conspiracy,Secret Door In The Feed,event,"Draw one Headline card and one Survival card. Resolve the Headline first.",0,0,0,0,0,0,0,false,false,chaos|survival
C016,Conspiracy,Too Many Coincidences,event,"Lose 1 Sanity. If you are The Normie, ignore this loss.",0,-1,0,0,1,0,0,false,false,conspiracy|character
C017,Conspiracy,Hidden Symbol Bingo,event,"Gain 1 Influence for each chaos meter currently at 4 or higher.",0,0,0,0,0,0,0,false,false,conspiracy|influence
C018,Conspiracy,They Changed The Definition,event,"Control rises by 1. Choose: lose 1 Sanity or lose 1 Influence.",0,0,0,0,0,1,0,false,true,control|media
C019,Conspiracy,The Group Chat Knows,event,"All players may discard 1 card to recover 1 Sanity.",0,0,0,0,0,0,0,false,true,social|recovery
C020,Conspiracy,You Were Right Too Early,event,"Gain 2 Influence and lose 1 Money.",-1,0,0,2,0,0,0,false,false,conspiracy|influence
S001,Survival,Canned Food Stash,reaction,"Hold. Ignore one Supply Chain or Market penalty.",0,0,0,0,0,0,0,true,false,survival|market
S002,Survival,Noise Cancelling Headphones,reaction,"Hold. Prevent up to 2 Sanity loss from one card.",0,0,0,0,0,0,0,true,false,survival|sanity
S003,Survival,Side Hustle,item,"Hold. Use on your turn to gain 2 Money.",2,0,0,0,0,0,0,true,false,money|survival
S004,Survival,Off Grid Weekend,item,"Hold. Use on your turn to recover 2 Sanity, then skip your next Influence gain.",0,2,0,0,0,0,0,true,false,sanity|survival
S005,Survival,Bug Out Bag,reaction,"Hold. Ignore one move-back effect.",0,0,0,0,0,0,0,true,false,survival|movement
S006,Survival,Media Spin,reaction,"Hold. Prevent one Influence loss from a Scandal card.",0,0,0,0,0,0,0,true,false,influence|scandal
S007,Survival,Mutual Aid Network,reaction,"Hold. When any player loses Money, discard this so both gain 1 Money.",1,0,0,0,0,0,0,true,true,money|social
S008,Survival,Deep Breathing App,item,"Hold. Use anytime to recover 1 Sanity and lower Panic by 1.",0,1,0,0,-1,0,0,true,false,sanity|panic
S009,Survival,Encrypted Group Chat,reaction,"Hold. Prevent 1 Freedom loss or 1 Influence loss.",0,0,0,0,0,0,0,true,false,freedom|influence
S010,Survival,Reusable Water Bottle,item,"Hold. Use to ignore one Pandemic Panic space.",0,0,0,0,0,0,0,true,false,pandemic|survival
S011,Survival,Local Farmer Friend,item,"Hold. Use when Market rises to gain 1 Money instead.",1,0,0,0,0,0,0,true,false,market|survival
S012,Survival,Offline Hobby,item,"Hold. Use on your turn to recover 1 Sanity and 1 Freedom.",0,1,1,0,0,0,0,true,false,sanity|freedom
S013,Survival,Receipts Folder,reaction,"Hold. Cancel one Scandal card targeting you.",0,0,0,0,0,0,0,true,false,scandal|defense
S014,Survival,Emergency Fund,item,"Hold. Use to prevent up to 2 Money loss.",0,0,0,0,0,0,0,true,false,money|defense
S015,Survival,Old Phone With No Apps,item,"Hold. Use to ignore one social media or algorithm effect.",0,0,0,0,0,0,0,true,false,sanity|social
S016,Survival,Community Garden,item,"Hold. Use to lower Market by 1 and recover 1 Sanity.",0,1,0,0,0,0,-1,true,false,market|sanity
S017,Survival,Backup Generator,item,"Hold. Use to prevent one Freedom loss from an Energy or Control effect.",0,0,0,0,0,0,0,true,false,freedom|survival
S018,Survival,Actual Book,item,"Hold. Use to recover 1 Sanity. If Panic is 5, recover 2 Sanity instead.",0,1,0,0,0,0,0,true,false,sanity|recovery
S019,Survival,Helpful Neighbor,reaction,"Hold. Give another player 1 Money or 1 Sanity; you gain 1 Influence.",0,0,0,1,0,0,0,true,true,social|choice
S020,Survival,Digital Detox,item,"Hold. Use to recover 2 Sanity, but lose 1 Influence.",0,2,0,-1,0,0,0,true,false,sanity|influence
X001,Scandal,Leaked Emails,event,"Lose 1 Influence unless you discard Media Spin or Receipts Folder.",0,0,0,-1,0,0,0,false,true,scandal|influence
X002,Scandal,Offshore Rumour,event,"Lose 1 Money or draw a Conspiracy card.",-1,0,0,0,0,0,0,false,true,scandal|money
X003,Scandal,Lobbyist Lunch Exposed,event,"Control rises by 1. Active player loses 1 Influence unless they pay 1 Money.",0,0,0,-1,0,1,0,false,true,scandal|control
X004,Scandal,Influencer Hypocrisy Clip,event,"If you have Influence 5 or higher, lose 2 Influence. Otherwise lose 1 Sanity.",0,0,0,0,1,0,0,false,false,scandal|social
X005,Scandal,Mystery Laptop Appears,event,"Everyone draws 1 card from any deck. Nobody may explain why.",0,0,0,0,0,0,0,false,false,absurd|scandal
X006,Scandal,Old Post Resurfaces,event,"Lose 1 Influence or lose 1 Money on reputation repair.",0,0,0,0,0,0,0,false,true,scandal|choice
X007,Scandal,Fact Check Frenzy,event,"Choose: lose 1 Influence or raise Control by 1 and recover 1 Sanity.",0,0,0,0,0,0,0,false,true,media|control
X008,Scandal,Group Chat Screenshot,event,"Lose 1 Sanity. If you have Influence 6 or higher, lose 1 Influence too.",0,-1,0,0,0,0,0,false,false,social|scandal
X009,Scandal,Emergency Rebrand,event,"Pay 1 Money to gain 2 Influence or do nothing and lose 1 Influence.",0,0,0,0,0,0,0,false,true,influence|money
X010,Scandal,Committee Hearing,event,"Lose 1 Freedom unless you have Influence 5 or higher.",0,0,-1,0,0,1,0,false,false,control|scandal
X011,Scandal,Sponsor Panic,event,"Lose 1 Money for each Scandal card in your personal discard pile.",0,0,0,0,0,0,1,false,false,money|scandal
X012,Scandal,Anonymous Source,event,"Draw a Conspiracy card. Then lose 1 Influence unless Panic is 4 or higher.",0,0,0,-1,0,0,0,false,false,media|conspiracy
X013,Scandal,Public Apology Tour,event,"Lose 1 Money and recover 1 Influence.",-1,0,0,1,0,0,0,false,false,scandal|recovery
X014,Scandal,Blue Check Dogpile,event,"Lose 1 Sanity or discard a Survival card.",0,-1,0,0,1,0,0,false,true,social|panic
X015,Scandal,Consultant Class Arrives,event,"Lose 1 Money. Control rises by 1.",-1,0,0,0,0,1,0,false,false,control|money
X016,Scandal,Receipts Are Receipting,event,"If you have Receipts Folder, gain 2 Influence. Otherwise lose 1 Influence.",0,0,0,0,0,0,0,false,false,scandal|item
X017,Scandal,Comment Section Trial,event,"All players vote thumbs up or down. If down wins, active player loses 1 Influence. If up wins, active player gains 1 Influence.",0,0,0,0,0,0,0,false,true,social|table
X018,Scandal,Institutional Memo Leak,event,"Control rises by 2. Everyone with Freedom 3 or lower loses 1 Sanity.",0,0,0,0,0,2,0,false,false,control|panic
X019,Scandal,Podcast Clip Out Of Context,event,"Lose 1 Influence. Then gain 1 Influence if you can summarize your defense in 10 seconds.",0,0,0,0,0,0,0,false,true,social|table
X020,Scandal,Nobody Reads The Correction,event,"Recover 1 Influence, but Panic rises by 1 because the damage is already done.",0,0,0,1,1,0,0,false,false,media|recovery`;

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"' && quoted && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = !quoted;
      } else if (ch === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((ch === "\n" || ch === "\r") && !quoted) {
        if (ch === "\r" && next === "\n") i++;
        row.push(cell);
        if (row.some(value => value !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += ch;
      }
    }
    row.push(cell);
    if (row.some(value => value !== "")) rows.push(row);
    const [headers, ...records] = rows;
    return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  }

  function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  const characters = parseCsv(CHARACTER_CSV).map(c => ({
    id: c.id,
    name: c.name,
    stats: {
      money: toNumber(c.starting_money),
      sanity: toNumber(c.starting_sanity),
      freedom: toNumber(c.starting_freedom),
      influence: toNumber(c.starting_influence)
    },
    ability: c.power,
    power: c.power,
    weakness: c.weakness,
    flavor: c.flavor
  }));

  const board = parseCsv(BOARD_CSV).map(s => ({
    n: toNumber(s.space_number),
    year: s.year,
    name: s.label,
    label: s.label,
    type: s.space_type,
    space_type: s.space_type,
    effect: s.effect,
    red_cycle_effect: s.red_cycle_effect,
    blue_cycle_effect: s.blue_cycle_effect
  }));

  const decks = parseCsv(CARD_CSV).reduce((acc, card) => {
    const deck = card.deck;
    if (!acc[deck]) acc[deck] = [];
    acc[deck].push({
      id: card.id,
      deck,
      title: card.name,
      name: card.name,
      type: card.type,
      text: card.effect_text,
      effect_text: card.effect_text,
      money_delta: toNumber(card.money_delta),
      sanity_delta: toNumber(card.sanity_delta),
      freedom_delta: toNumber(card.freedom_delta),
      influence_delta: toNumber(card.influence_delta),
      panic_delta: toNumber(card.panic_delta),
      control_delta: toNumber(card.control_delta),
      market_delta: toNumber(card.market_delta),
      holdable: card.holdable === "true",
      choice_required: card.choice_required === "true",
      tags: card.tags ? card.tags.split("|") : []
    });
    return acc;
  }, {});

  GAME.version = DATA_VERSION;
  GAME.sourceFiles = [
    "data/prototype/characters-v0.16.csv",
    "data/prototype/card-decks-v0.16.csv",
    "data/prototype/board-spaces-v0.16.csv"
  ];
  GAME.characters = characters;
  GAME.board = board;
  GAME.decks = decks;
  GAME.deckAliases = {
    "Global Chaos": "Headline",
    "Media Meltdown": "Scandal",
    "Hidden Hand": "Conspiracy",
    "Political Flip": "Headline",
    "Final Reckoning": "Scandal"
  };
})();
