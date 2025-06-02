export const CURRENT_VERSION = "1.4.2";

export const UPDATE_CHANGES = {
  "1.0.1": [
    "ABI (Ability) is now a stat that can be increased by evolving or devolving Digimon",
    "ABI determines the cap for total bonus stats (50 + ABI / 2)",
    "ABI is now a requirement for some evolutions",
    "Tasks now give all reserve Digimon 50% of the experience. (ex. active Digimon gets 100 exp, all reserve Digimon get 50 exp)",
    "Users may notice website being slower, this will return to normal after May 9th.",
  ],
  "1.0.2": [
    "Digimon created before the update recieved ABI depending on their stage. Rookie: 5, Champion: 8, Ultimate: 15, Mega: 20",
    "Digimon with bonus stats that exceeded their ABI cap were granted the ABI needed to reach the cap (at most 25 ABI).",
    "Note: Digimon were not granted both of these ABI rewards, only whichever was higher.",
    "Fixed bug where Digimon did not recieve happiness from tasks",
    "Fixed bug where Digimon on Dashboard was not visually updated when task was completed",
    "Thank you for the suggestions, please continue to send in any feedback!",
  ],
  "1.0.3": [
    "Performance optimizations and fixed bug where turn animations would get out of sync.",
    "Campaign mode is in development, where you fight a series of progressively harder pre-made battles.",
    "Rewards will probably(?) just be titles or achievements, so it won't be required to complete the campaign.",
    "Let us know what you want to see in campaign mode in the feedback form!",
  ],
  "1.0.4": [
    "Final stat calculations fixed, bonus stats were being applied multiplicatively instead of additively.",
    "Users are now suggested a category in task creation, but can change it freely during creation.",
    "Campaign mode is in development, please send any suggestions for enemy teams or rewards through the feedback form!",
    "A preview of the new campaign mode is available if you go to https://digitask-pi.vercel.app/campaign.",
  ],
  "1.1.1": [
    "Campaign mode is now available!",
    "Titles are now available! Gained from certain achievements and display up to 3 on your profile.",
    "DNA Digivolution is now implemented!",
    "HP Bonus is now effectively 10x.",
    "Expect bugs and balancing issues (with the campaign), report any issues in the feedback form!",
  ],
  "1.1.2": [
    "Completed tasks that are recurring or daily can now still be edited.",
    "Improved Digimon team card UI.",
    "Added 3 new Digimon: BlitzGreymon, CresGarurumon, and Omnimon Alter-S",
    "BlitzGreymon are evolved through MetalGreymon (Blue), CresGarurumon from WereGarurumon, and Omnimon Alter-S from the fusion of the two.",
  ],
  "1.1.3": [
    "Several Digimon sprites have gotten animations/new sprites (ex. idle animation, happy, sad, sleeping)",
    "Unfortunately, I couldn't find sprites for all Digimon, so many Digimon are still static.",
    "Due to influx of all these new sprites, I'm able to add more Digimon to the game! Notably a lot of the X-Antibody Digimon.",
  ],
  "1.2.0": [
    "Introducing X-Antibody Digimon! These are mutated variants of the original Digimon, providing a 10% boost to all stats.",
    "Read patch notes for more information.",
    "Added Bokomon and Neemon as guides to the game! Sprites are from @otro_jorch on twitter",
    "Added an onboarding flow for new users to get started!",
  ],
  "1.2.1": [
    "New titles are added for reaching new milestones for daily quota streaks.",
    "Updated avatar sprites and Digidex to use the new sprites from the animation update.",
    "Battle animations now use the new sprites, animating the Digimon attacking/defending, or victory/defeat.",
  ],
  "1.2.2": [
    "Added tiers to Titles, so they are visually distinct from each other based on their difficulty.",
    "Added Apollomon line and GraceNovamon to the game!",
    "Added more animated sprites for Digimon that weren't working because of naming inconsistencies.",
    "Changed Digitask Logo from Agumon to Agumon Expert.",
  ],
  "1.3.0": [
    "DigiFarm! Send Digimon that you want to keep, but don't want to use, to the DigiFarm!",
    "Bringing back Playground mode as part of DigiFarm for stored Digimon!",
    "Introducing the Store! Gain bits from Arena battles to purchase various items from Neemon!",
    "Users start with 2000 bits!",
  ],
  "1.3.1": [
    "DigiFarm! Send Digimon that you want to keep, but don't want to use, to the DigiFarm!",
    "Introducing the Store! Gain bits from Arena battles to purchase various items from Neemon!",
    "Fixed bug where users could not claim Digimon even though they had open party slots.",
  ],
  "1.4.0": [
    "X-Antibody Rework! Item now permanently allows a Digimon to switch between X-Antibody and regular.",
    "Tons of X-Antibody Digimon added! Royal Knights, Angewomon, Rosemon, and more!",
    "More items such as Personality changer and Stat extractor added!",
  ],
  "1.4.1": [
    "Better Arena battle matchmaking (strength is determined by stats not level). Bit rewards increased.",
    "New store item icons and replaced ABI booster with EXP item.",
    "Ogremon X, Craniamon X (forgot in last update), and Numemon X added.",
  ],
  "1.4.2": [
    "Nerfed Wild Digimon battles in Arena.",
    "Easy SHOULD feel like almost always win, mediums 50/50, and hard should be beatable if type/attributes counter them.",
    "If the Wild Digimon battles consistently don't follow these guidelines, please let me know!",
    "What to expect in future updates:",
    "Item requirements for some existing evolutions (ex. Armor evolutions).",
    "Mobile app version in the works, so expect slower updates.",
  ],
};
