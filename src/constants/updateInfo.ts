export const CURRENT_VERSION = "1.1.3";

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
};
