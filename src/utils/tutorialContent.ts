export const tutorialContent = {
  title: "Welcome to DigiTask!",
  sections: [
    {
      title: "What is DigiTask?",
      content: `DigiTask is a task management application that combines the fun of Digimon with productivity. 
      Completing tasks will make your Digimon stronger and happier.`,
    },
    {
      title: "Task Management",
      content: `Create real-life tasks for yourself. These can be anything from studying, working out, or even just getting enough sleep. You can create, edit, and delete tasks in the dashboard page. As you complete tasks, your Digimon will gain experience, level up, and get stronger. 
      There are 3 types of tasks:
      - Daily Tasks: Tasks that you can complete once a day and get reset
      - Recurring Tasks: Tasks that repeat on specific days of the week
      - One-time Tasks: Tasks that have a specific due date and time`,
    },
    {
      title: "Task Categories",
      content: `Each task can be assigned a category indicating the stat that it affects. On completion, the user gains 1 point in the stat that can be applied to a Digimon.`,
    },
    {
      title: "Happiness",
      content: `Happiness is a measure of how happy your Digimon is. It is affected by the tasks you complete and the habits you maintain. 
      Completing tasks increases happiness, while missing tasks decreases it. It affects how much experience your Digimon gains from tasks.`,
    },
    {
      title: "Daily Quota",
      content: `There is a daily quota of 3 tasks that should try to complete a day. Maintaining a streak of this will grant an experience multiplier, up to 2.5x.`,
    },
    {
      title: "Digimon Evolution",
      content: `Your Digimon can evolve into different, stronger Digimon. An evolution usually requires a certain level to be reached and some stat amounts. Special evolutions may require
      an item or another Digimon.`,
    },
    {
      title: "X-Antibody",
      content: `Some Digimon can transform to a stronger, mutated form called the X-Antibody. This form requires the X-Antibody item from the shop. Once a Digimon has the X-antibody, they can freely transform from and to this form.`,
    },
    {
      title: "Digimon Shop",
      content: `The Digimon Shop is a place where you can buy items for your Digimon. The currency is called bits. Some items are required for evolutions, while others are used to boost your Digimon's stats.`,
    },
    {
      title: "Stats and Attributes",
      content: `Digimon have various stats that affect their performance:
      - HP (Health Points): Represents your max health
      - SP (Skill Points): Increases your critical damage
      - ATK (Attack): Increases your physical damage
      - DEF (Defense): Resistance to physical damage
      - INT (Intelligence): Special damage and special defense
      - SPD (Speed): Determines your turn order
      - ABI (Ability): Determines max bonus stats`,
    },
    {
      title: "Types/Attributes",
      content: `Every Digimon has a Type and an Attribute, that determine their strengths and weaknesses:
      - Type: Vaccine, Virus, Data, Free
      - Attribute: Fire, Water, Plant, Earth, Wind, Electric, Light, Dark, Neutral
      - Type Advantages/Weaknesses: provide a 2x or 0.5x damage multiplier (2x is strong, 0.5x is weak):
        - Vaccine: Weak against Data, Strong against Virus
        - Virus: Weak against Vaccine, Strong against Data
        - Data: Weak against Virus, Strong against Vaccine
        - Free: Neutral to all types
      - Attribute Advantages: advantages are 1.5x damage, 1x otherwise:
        - Fire: Weak against Water, Strong against Plant
        - Water: Weak against Plant, Strong against Fire
        - Plant: Weak against Fire, Strong against Water
        - Earth: Weak against Wind, Strong against Electric
        - Wind: Weak against Electric, Strong against Earth
        - Electric: Weak against Earth, Strong against Wind
        - Light: Weak against Dark, Strong against Dark
        - Dark: Weak against Light, Strong against Light
        - Neutral: Neutral to all attributes
      `,
    },
    {
      title: "Battles",
      content: `Battles are up to 3v3 and are turns are automatically done. The first team to have all 3 Digimon KOed loses. Turn order is determined by the Speed stat and keep repeating.
      Each Digimon attacks using either their ATK or INT stat, whichever is higher and attacks a random digimon on the enemy team. Then, the target Digmion will use its DEF/INT stat (dpeending on the attack type)
      along with type/attribute advantages/weaknesses to calculate the damage. Attacks can also crit whose multiplier is determiend by the SP stat. Attacks also have a chance to miss.
      `,
    },

    {
      title: "Arena",
      content: `The Battle Arena is a place where you can battle against other players teams, randomly chosen for 3 difficulties: Easy, Medium, and Hard. These battles will grant experience and bits (currency rewards)
      depending on the difficulty. However, losses will grant much less experience and bits. Players get 5 battles per day.
      `,
    },
    {
      title: "Campaign",
      content: `The Campaign is a series of battles, following a linear story line, with each stage being a preset team and gets progressively harder. Completing the campaign will grant titles that can be displayed on the profile.
      `,
    },
    {
      title: "Weekly Boss Raids",
      content: `Every week, a powerful boss appears that requires the entire community to work together to defeat! The event has two phases:
      - Phase 1 (Monday-Friday PST): Complete tasks to weaken the boss and contribute to the global progress goal
      - Phase 2 (Saturday-Sunday PST): Battle the weakened boss with your team to deal damage
      Players can battle the boss up to 5 times per day during Phase 2 (10 total for the weekend). Participation rewards include bits, experience, titles, and special items based on your contribution level. The boss rotates weekly with 6 different challenging opponents!`,
    },
  ],
};
