# Digitask Documentation

## Core Data Models

### Overview

- Digimon
  - Digimon data that is scraped from digidb.io, including base stats, names, and other digimon species information
- Evolution_Paths
  - Evolution paths for the digimon, including the digimon it evolves into and the levels and stats needed to evolve
- User_Digimon
  - User's digimon, including the digimon's bonus stats, level, happiness, and other digimon information, use in conjuction with Digimon data to display the digimon in the app
- User_Discovered_Digimon
  - Digimon that the user has discovered (owned at one point by the user)
- Profiles
  - User profiles, including the user's username, avatar, and other user stats (streaks, battles won, etc.)
- Tasks
  - Tasks that the user has created: one-time tasks, daily tasks, and recurring tasks
- Daily_Quotas
  - Daily quota data for the user, including the number of tasks completed today, the number of consecutive days the quota has been missed
- User_Milestones
  - User milestones, including the number of tasks completed, the number of battles won, and the number of days in a row the daily quota has been completed
- Team_Battles
  - Team battles data for the user, including the user's team and the opponent's team, and the turns taken by the user and opponent
- Battle_Limits
  - Battle limits data for the user, including the number of battles used today and the last reset date
- Admin_Users
  - Admin users data for the admin users, including the user's username and email
- Reports
  - Reports data for the reports, including the user who reported the user, the user who was reported, the reason for the report, and the status of the report
- Users (auth.users table)
  - Users data for the users used for authentication, including the user's uid, email, and display name

### SQL Schema

- Digimon

  - id: integer (primary key)
  - digimon_id: integer (number of the digimon in the digimon dex, identical to the id)
  - request_id: integer (id of the request on the digidb.io api, used to fetch and scrape the digimon data)
  - name: string (name of the digimon)
  - stage: string (stage of the digimon, e.g. "Baby", "In Training", "Rookie", "Champion", "Ultimate", "Mega", "Ultra", "Armor")
  - type: string (type of the digimon, e.g. "Vaccine", "Data", "Virus", "Free")
  - attribute: string (attribute of the digimon, e.g. "Fire", "Water", "Plant", "Electric", "Wind", "Earth", "Light", "Dark", "Neutral")
  - sprite_url: string (url of the digimon sprite, used to display the digimon in the app)
  - hp: integer (base health points of the digimon at level 50)
  - sp: integer (base skill points of the digimon at level 50)
  - atk: integer (base attack of the digimon at level 50)
  - def: integer (base defense of the digimon at level 50)
  - int: integer (base intelligence of the digimon at level 50)
  - speed: integer (base speed of the digimon at level 50)
  - detail_url: string (url of the digimon detail page on digidb.io, where the digimon data is scraped from)
  - hp_level1: integer (base health points of the digimon at level 1)
  - sp_level1: integer (base skill points of the digimon at level 1)
  - atk_level1: integer (base attack of the digimon at level 1)
  - def_level1: integer (base defense of the digimon at level 1)
  - int_level1: integer (base intelligence of the digimon at level 1)
  - speed_level1: integer (base speed of the digimon at level 1)
  - hp_level99: integer (base health points of the digimon at level 99)
  - sp_level99: integer (base skill points of the digimon at level 99)
  - atk_level99: integer (base attack of the digimon at level 99)
  - def_level99: integer (base defense of the digimon at level 99)
  - int_level99: integer (base intelligence of the digimon at level 99)
  - speed_level99: integer (base speed of the digimon at level 99)

- Evolution_Paths

  - id: serial (primary key )
  - from_digimon_id: integer (foreign key to the digimon table)
  - to_digimon_id: integer (foreign key to the digimon table)
  - level_required: integer (minimum level at which from_digimon evolves into to_digimon)
  - stat_requirements: jsonb (json object with the stat requirements for the evolution, e.g. {"hp": 100, "sp": 100, "atk": 100, "def": 100, "int": 100, "speed": 100})

- User_Digimon

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table)
  - digimon_id: integer (foreign key to the digimon table)
  - name: string (nickname of the digimon)
  - current_level: integer (current level of the digimon)
  - experience_points: integer (current experience points of the digimon)
  - health: integer (current health points of the digimon, separate from hp stat, DEPRECATED)
  - happiness: integer (current happiness of the digimon, increases from task completion, decreases from overdue tasks)
  - created_at: timestamp (date and time when the digimon was created)
  - updated_at: timestamp (date and time when the digimon was last updated)
  - last_fed_tasks_at: timestamp (date and time when the digimon was last fed, completed task as active Digimon)
  - is_active: boolean (whether the digimon is the currently active digimon of the user, impacted by user's tasks)
  - is_on_team: boolean (whether the digimon is on the battle team)
  - hp_bonus: integer (bonus health points of the digimon, increases from evolution/devolution and points gained from tasks)
  - sp_bonus: integer (bonus skill points of the digimon, increases from evolution/devolution and points gained from tasks)
  - atk_bonus: integer (bonus attack of the digimon, increases from evolution/devolution and points gained from tasks)
  - def_bonus: integer (bonus defense of the digimon, increases from evolution/devolution and points gained from tasks)
  - int_bonus: integer (bonus intelligence of the digimon, increases from evolution/devolution and points gained from tasks)
  - speed_bonus: integer (bonus speed of the digimon, increases from evolution/devolution and points gained from tasks)
  - daily_stat_gains: integer (number of stat points gained by the digimon from tasks completed today, used to make sure it doesn't gain too many points, DEPRECATED)
  - last_stat_reset: timestamp (date and time when the digimon's stats were last reset, used to calculate daily stat gains, DEPRECATED)
  - personality: string (personality of the digimon, which increases a respective stat in final calculation by 5% e.g. Durable: Increases HP, Lively: Increases SP, Fighter: Increases ATK, Defender: Increases DEF, Brainy: Increases INT, Nimble: Increases SPD.)

- User_Discovered_Digimon

  - id: uuid (primary key)
  - user_id: integer (foreign key to the auth.users table)
  - digimon_id: integer (foreign key to the digimon table)
  - discovered_at: timestamp (date and time when the digimon was discovered)

- Profiles

  - id: uuid (primary key, foreign key of the auth.users table)
  - username: string (username of the user)
  - display_name: string (display name of the user, DEPRECATED as it is the same as username)
  - avatar_url: string (url of the user's avatar, uses same images as digimon sprites)
  - created_at: timestamp (date and time when the profile was created)
  - updated_at: timestamp (date and time when the profile was last updated)
  - saved_stats: jsonb (json object with the saved stats of the user that can be used to allocate stats to digimon, e.g. {"hp": 100, "sp": 100, "atk": 100, "def": 100, "int": 100, "speed": 100})
  - daily_stat_gains: integer (number of stat points user gained from tasks completed today, used to make sure it doesn't gain too many points)
  - last_stat_reset: timestamp (date and time when the user's stats were last reset, used to calculate daily stat gains)
  - battles_won: integer (number of battles won by the user)
  - battles_completed: integer (number of battles completed by the user)

- Tasks

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table)
  - description: string (description/title of the task)
  - is_daily: boolean (whether the task is a daily task, and should get reset at midnight PST)
  - due_date: timestamp with time zone (date and time when the task is due, only used for one-time tasks)
  - is_completed: boolean (whether the task has been completed, gets reset if daily or recurring (as needed))
  - created_at: timestamp with time zone (date and time when the task was created)
  - completed_at: timestamp with time zone (date and time when the task was completed)
  - category: string (category of the task which determines what stats it should give to user/digimon, e.g. "HP", "SP", "ATK", "DEF", "INT", "SPD")
  - notes: string (notes for the task, for the user to add any additional information)
  - recurring_days: string[] (array of days of the week when the task should be shown to the user, if it's a recurring task, e.g. ["Monday", "Wednesday", "Friday"])

- Daily_Quotas

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table AND profiles table)
  - completed_today: integer (number of tasks completed today)
  - consecutive_days_missed: integer (number of consecutive days daily quota is missed, affects how much happiness the digimon loses when daily quota is not met)
  - created_at: timestamp with time zone (date and time when row was created)
  - updated_at: timestamp with time zone (date and time when row was last updated)
  - penalized_tasks: text[] (array of task ids that were penalized for the day)
  - current_streak: integer (current streak of consecutive days daily quota was completed)
  - longest_streak: integer (longest streak of consecutive days daily quota was completed)

- User_Milestones

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table)
  - daily_quota_streak: integer (number of days daily quota was completed)
  - tasks_completed_count: integer (number of tasks completed)
  - last_digimon_claimed_at: timestamp with time zone (date and time when the last digimon was claimed)
  - created_at: timestamp with time zone (date and time when row was created)
  - updated_at: timestamp with time zone (date and time when row was last updated)

- Team_Battles

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table AND profiles table)
  - opponent_id: integer (foreign key to the profiles table)
  - winner_id: integer (foreign key to the profiles table)
  - created_at: timestamp with time zone (date and time when row was created)
  - user_team: jsonb (json array of comprehensive user_digimon data and it's associated Digimon data for user's team, ex. [{"id": "a307351f-d5df-44e4-8372-8ef2e7b86ea6", "name": "TERRIBLE", "health": 100, "digimon": {"hp": 1204, "sp": 88, "atk": 130, "def": 107, "int": 90, "spd": 116, "name": "KendoGarurumon", "type": "Free", "stage": "Ultimate", "attribute": "Light", "hp_level1": 780, "sp_level1": 52, "atk_level1": 100, "current_hp": 323, "def_level1": 65, "hp_level99": 2050, "int_level1": 60, "sp_level99": 159, "spd_level1": 85, "sprite_url": "/assets/digimon/dot681.png", "atk_level99": 188, "def_level99": 192, "int_level99": 148, "spd_level99": 163}, "user_id": "5bdcb85e-1a54-43df-8649-ebd6d94dd933", "hp_bonus": 0, "sp_bonus": 0, "atk_bonus": 0, "def_bonus": 0, "happiness": 100, "int_bonus": 0, "is_active": false, "spd_bonus": 0, "created_at": "2025-04-11T20:46:17.778721+00:00", "digimon_id": 155, "is_on_team": true, "personality": "Nimble", "current_level": 34, "last_stat_reset": "2025-04-17T08:00:00.266037+00:00", "last_updated_at": "2025-04-11T20:46:17.778721+00:00", "daily_stat_gains": 0, "experience_points": 14, "last_fed_tasks_at": "2025-04-22T03:31:07.826+00:00"}])
  - opponent_team: jsonb (json array of comprehensive user_digimon data and it's associated Digimon data for user's team, same structure as user_team)
  - turns: jsonb (json array of turns taken by the user and opponent including comprehensive data such as damage, criticals, ex. [
    {
    "damage": 158,
    "target": {
    "id": "952e7533-bad6-4da4-ac05-6babb61e1a26",
    "name": "",
    "health": 100,
    "digimon": {
    "hp": 1194,
    "sp": 68,
    "atk": 152,
    "def": 114,
    "int": 74,
    "spd": 96,
    "name": "WarGrowlmon",
    "type": "Virus",
    "attribute": "Fire",
    "hp_level1": 850,
    "sp_level1": 45,
    "atk_level1": 115,
    "current_hp": 0,
    "def_level1": 80,
    "hp_level99": 2020,
    "int_level1": 48,
    "sp_level99": 123,
    "spd_level1": 67,
    "sprite_url": "/assets/digimon/dot134.png",
    "atk_level99": 242,
    "def_level99": 197,
    "int_level99": 126,
    "spd_level99": 165
    },
    "user_id": "57db1b1a-704b-4b4a-9e47-4f04a4952293",
    "hp_bonus": 1,
    "sp_bonus": 0,
    "atk_bonus": 0,
    "def_bonus": 0,
    "happiness": 100,
    "int_bonus": 0,
    "is_active": false,
    "spd_bonus": 0,
    "created_at": "2025-04-17T21:58:33.907311+00:00",
    "digimon_id": 202,
    "is_on_team": true,
    "personality": "Brainy",
    "current_level": 30,
    "last_stat_reset": "2025-04-17T21:58:33.907311+00:00",
    "last_updated_at": "2025-04-17T21:58:33.907311+00:00",
    "daily_stat_gains": 0,
    "experience_points": 398,
    "last_fed_tasks_at": "2025-04-17T21:58:33.907311+00:00"
    },
    "didMiss": false,
    "attacker": {
    "id": "5146baa8-3390-4b50-9640-8b29d156cbf0",
    "team": "user",
    "digimon": {
    "hp": 887,
    "sp": 133,
    "atk": 59,
    "def": 92,
    "int": 175,
    "spd": 123,
    "name": "Taomon",
    "type": "Data",
    "stage": "Ultimate",
    "attribute": "Dark",
    "hp_level1": 600,
    "sp_level1": 85,
    "atk_level1": 30,
    "current_hp": 0,
    "def_level1": 60,
    "hp_level99": 1380,
    "int_level1": 110,
    "sp_level99": 212,
    "spd_level1": 80,
    "sprite_url": "/assets/digimon/dot405.png",
    "atk_level99": 108,
    "def_level99": 148,
    "int_level99": 237,
    "spd_level99": 197
    }
    },
    "remainingHP": {
    "5146baa8-3390-4b50-9640-8b29d156cbf0": 887,
    "51c0dc90-9e81-4d99-8ca3-56317e74720f": 1041,
    "65a0f9a9-c34a-40c1-b3e3-004fed2fb9b0": 1064,
    "952e7533-bad6-4da4-ac05-6babb61e1a26": 1036,
    "a307351f-d5df-44e4-8372-8ef2e7b86ea6": 1204,
    "a58b52ca-9df9-4a3f-b3f2-e3b54386b478": 1045
    },
    "isCriticalHit": false
    }])
  - is_wild_battle: boolean (whether the battle is a wild battle, DEPRECATED)

- Battle_Limits

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table)
  - battles_used: integer (number of battles used today)
  - last_reset_date: date (date when the battle limit was last reset)
  - created_at: timestamp with time zone (date and time when row was created)
  - updated_at: timestamp with time zone (date and time when row was last updated)

- Admin_Users

  - id: integer (primary key)
  - user_id: integer (foreign key to the auth.users table)
  - created_at: timestamp with time zone (date and time when row was created)

- Reports

  - id: integer (primary key)
  - reporter_id: integer (foreign key to the auth.users table)
  - reported_user: integer (foreign key to the auth.users table)
  - reason: string (reason for the report)
  - category: string (category of the report, e.g. "Spam", "Hate Speech", "Violence", "False Information", "Other")
  - status: string (status of the report, e.g. "Pending", "Resolved", "Dismissed")
  - admin_notes: string (notes from the admin who reviewed the report)
  - created_at: timestamp with time zone (date and time when row was created)
  - updated_at: timestamp with time zone (date and time when row was last updated)
  - resolved_at: timestamp with time zone (date and time when the report was resolved)

- Users (auth.users table)
  - uid: uuid (primary key)
  - display_name: string (display name of the user, DEPRECATED/UNUSED)
  - email: string (email of the user)

### Relationships

- UserDigimon belongs to User (via user_id)
- UserDigimon references Digimon (via digimon_id)
- Evolution_Paths references 2 Digimon (via from_digimon_id and to_digimon_id)
- User_Discovered_Digimon references Digimon (via digimon_id)

- User_Digimon has a many-to-one relationship with Digimon
- Evolution_Paths has a many-to-one relationship with Digimon
- User_Digimon has a many-to-one relationship with Profiles
- User_Milestones has a one-to-one relationship with Profiles
- Team_Battles has a many-to-one relationship with Profiles
- Battle_Limits has a one-to-one relationship with Profiles
- Tasks has a many-to-one relationship with Profiles
- Daily_Quotas has a one-to-one relationship with Profiles
- Reports has a many-to-one relationship with Profiles
- Users (auth.users table) has a one-to-one relationship with Profiles
- Admin_Users has a one-to-one relationship with Profiles

# Validation Rules

- Profiles.username must be unique
- Profiles.email must be unique
- A user can only have one active digimon at a time
- A user can only own up to 12 digimon, with 3 max on their battle team

# Key Stores

## Purpose

- petStore: Manages all Digimon-related state and operations including fetching, updating, evolving, devolving, feeding/leveling, happiness
- authStore: Manages all authentication-related state and operations including logging in, logging out, signing up, resetting passwords, updating profile, and admin status
- battleStore: Manages all battle-related state and operations including team selection, wild battle selection, stat calculation, and battle logic
- milestoneStore: Manages all milestone-related state and operations including fetching, updating, and completing milestones
- notificationStore: Manages all notification-related state and operations including adding, removing, and clearing notifications
- taskStore: Manages all task-related and daily quota-related state and operations including creating, updating, penalizing, deleting, and completing tasks

## petStore

### State

- userDigimon: The user's Active Digimon (UserDigimon | null)
- allUserDigimon: All of the user's digimon (UserDigimon[])
- digimonData: The data of the digimon associated with user's Active Digimon (Digimon | null)
- evolutionOptions: The evolution options for the user's Active Digimon (EvolutionOption[])
- discoveredDigimon: The digimon_id's of the digimon that the user has discovered (number[])

### Key Methods

- fetchUserDigimon(): Promise<void>
  - Fetches the user's active digimon from the database
- fetchAllUserDigimon(): Promise <void>
  - Fetches all of the user's digimon from the database
- createUserDigimon(name: string, digimonId: number): Promise<void>
  - Creates a new digimon for the user given a digimonId and their nickname for the digimon
- updateDigimonStats(updates: Partial<UserDigimon>): Promise<void>
  - Updates the stats of the user's active digimon
- feedDigimon(taskPoints: number): Promise<void>
  - Feeds the user's active digimon with the given task points, and applies a multiplier based on user current streak
  - Feeding increases exp, and happiness
- checkEvolution(): Promise<boolean>
  - Checks if the user's active digimon is ready to evolve
- checkDevolution(): Promise<boolean>
  - Checks if the user's active digimon is ready to devolve
- evolveDigimon(toDigimonId: number, specificDigimonId?: string): Promise<void>
  - Evolves the user's active digimon to the given digimonId
  - Validates that the evolution path between these digimon exists, and that the user's digimon meets the level and stat requirements
- devolveDigimon(fromDigimonId: number, specificDigimonId?: string): Promise<void>
  - Devolves the user's active digimon to the given digimonId
  - Validates that the devolution path exists between these Digimon and that the user has discovered the Digimon they are devolving to
- getStarterDigimon(): Promise<Digimon[]>
  - Fetches all of the starter digimon (Baby stage) from the database
- fetchDiscoveredDigimon(): Promise<void>
  - Fetches all of the digimon that the user has discovered from the database and sets the discoveredDigimon state
- addDiscoveredDigimon(digimonId: number): Promise<void>
  - Adds a digimon to the user's discovered digimon list (both in database and locally)
- subscribeToDigimonUpdates(): Promise<() => void>
  - Subscribes to the user's digimon updates with Supabase realtime
- checkLevelUp(): Promise<boolean | undefined>
  - Check if the user's active Digimon has enough experience to level up and if so, levels up the digimon and updates the database and locally
- getDigimonDisplayName(): string
  - Returns the display name of the user's active Digimon, either the user's nickname or the digimon's name (if no nickname is set)
- applyPenalty(happinessPenalty: number): Promise<void>
  - Applies a penalty to the user's active Digimon's happiness
- testPenalty(): Promise<void>
  - Tests the penalty function by applying a penalty to the user's active Digimon's happiness
- debugHealth(): void
  - Debugs the health of the user's active Digimon
- setTeamMember(digimonId: string, isOnTeam: boolean): Promise<void>
  - Changes the team status of a digimon, either adding it to the team or removing it from the team
  - Validates that user can't have more than 3 digimon on their team
- swapTeamMember(teamDigimonId: string, reserveDigimonId: string): Promise<void>
  - Swaps the team status of two digimon, either adding one to the team and removing the other from the team
  - Validates that user can't have more than 3 digimon on their team
- feedAllDigimon(taskPoints: number): Promise<void>
  - Feeds all of the user's digimon with the given task points, and applies a multiplier based on user current streak
  - Doesn't give happiness
- increaseStat(statCategory: StatCategory, amount: number): Promise<boolean>
  - Increases the given stat of the user's active Digimon by the given amount
  - Returns true if the stat was increased, false if it was not (due to cap)
- checkStatCap(): Promise<{ canGain: boolean, remaining: number, cap: number }>
  - Checks how many stat points the user has left to gain today based on the cap (calculateDailyStatCap)
- calculateDailyStatCap(): number
  - Calculates the daily stat cap for the user based on the number of digimon they have (2 + 2 per digimon)
- fetchUserDailyStatGains(): Promise<number>
  - Fetches the number of stat points the user has gained today from the database
- updateDigimonName(digimonId: string, newName: string): Promise<{ success: boolean, error?: string }>
  - Updates the name of the user's active Digimon
- updateDigimonInStore(updatedDigimon: UserDigimon): void
  - Updates the user's Digimon to make sure they own all of the digimon they have in the store

## authStore

### State

- user: The user's profile data (Profile | null)
- isAdmin: Whether the user is an admin (boolean)

### Key Methods

- signUp(email: string, password: string, username: string): Promise<void>
  - Signs up a new user with the given email, password, and username
- signIn(email: string, password: string): Promise<void>
  - Signs in a user with the given email and password
- signOut(): Promise<void>
  - Signs out the current user
- resetPassword(email: string): Promise<void>
  - Resets the password for the given email, DEPRECATED/UNUSED
- checkSession(): Promise<void>
  - Checks if the user is still logged in
- updateProfile(updates: Partial<UserProfile>): Promise<void>
  - Updates the user's profile data in the database, for example, username or avatar
- checkAdminStatus(): Promise<void>
  - Checks if the user is an admin
- fetchUserProfile(): Promise<void>
  - Fetches the user's profile data from the database
- createProfile(userId: string, username: string): Promise<void>
  - Creates a new profile for the user given their userId and username after a sign up

## battleStore

### State

- teamBattleHistory: The history of team battles the user has participated in (TeamBattleHistory[])
- currentTeamBattle: The current team battle the user is participating in (TeamBattle | null)
- dailyBattlesRemaining: The number of daily battles the user has remaining (number)
- battleOptions: The options for team battles (BattleOption[])
- selectedBattleOption: The selected battle option for the team battle (BattleOption | null)
- lastOptionsRefresh: The timestamp of the last options refresh (number | null)
- shouldRefreshOptions: Whether the options should be refreshed (boolean)
- isBattleInProgress: Whether a battle is currently in progress (boolean)

### Key Methods

- fetchTeamBattleHistory(): Promise<void>
  - Fetches the history of team battles the user has participated in from the database
- clearCurrentTeamBattle(): void
  - Clears the current team battle from the store
- checkDailyBattleLimit(): Promise<number>
  - Checks how many daily battles the user has remaining
- selectAndStartBattle(optionId: string): Promise<void>
  - Selects a battle option and starts the team battle, performing a battle simulation and updating the database and giving experience rewards
- refreshBattleOptions(): Promise<void>
  - Refreshes the battle options for the team battle
- setShouldRefreshOptions(shouldRefresh: boolean): void
  - Sets whether the options should be refreshed

### Helper Functions

- modifyStats(digimon: Digimon): Digimon
  - Modifies the stats of the given digimon to get its final stats,based on the user's current level and the digimon's level, bonus stats, and personality
- calculateCritMultiplier(SP: number): number
  - Calculates the critical hit multiplier for the given SP
- simulateTeamBattle(userTeamData: any, opponentTeamData: any): TeamBattle
  - Simulates a team battle between the user's team and the opponent's team, of Digimon taking turns attacking each other until 1 team remains, tracks the turns, damage, and critical hits and returns the results
- getAttributeDamageMultiplier(attacker: DigimonAttribute, defender: DigimonAttribute): number
  - Returns the damage multiplier for the given attacker and defender attributes
- getTypeDamageMultiplier(attacker: DigimonType, defender: DigimonType): number
  - Returns the damage multiplier for the given attacker and defender types

## taskStore

### State

- tasks: The tasks that the user has (Task[])
- loading: Whether the tasks are loading (boolean)
- error: The error that occurred during the tasks (string | null)
- dailyQuota: The daily quota for the user (DailyQuota | null)
- penalizedTasks: The tasks that the user has been penalized for missing (string[])
- lastOverdueCheck: The timestamp of the last overdue check (number | null)

### Key Methods

- fetchTasks(): Promise<void>
  - Fetches the tasks for the user from the database
- createTask(task: Partial<Task>): Promise<void>
  - Creates a new task for the user
- updateTask(taskId: string, updates: Partial<Task>): Promise<void>
  - Updates a task for the user
- deleteTask(taskId: string): Promise<void>
  - Deletes a task for the user
- completeTask(taskId: string, autoAllocate?: boolean): Promise<void>
  - Completes a task for the user, optionally auto-allocating points if the task is a daily task
- checkOverdueTasks(): Promise<void>
  - Checks if any overdue tasks exist and penalizes the user if they do
- resetDailyTasks(): Promise<void>
  - Resets the daily tasks for the user
- fetchDailyQuota(): Promise<void>
  - Fetches the daily quota for the user from the database
- checkDailyQuota(): Promise<void>
  - Checks if the user has completed their daily quota
- subscribeToQuotaUpdates(): Promise<() => void>
  - Subscribes to the user's quota updates with Supabase realtime
- setPenalizedTasks(taskIds: string[]): void
  - Sets the penalized tasks for the user
- completeDailyQuota(): Promise<void>
  - Completes the user's daily quota, incrementing the daily quota streak milestones
- getExpMultiplier(): number
  - Returns the experience multiplier for the user
- editTask(taskId: string, updates: Partial<Task>): Promise<void>
  - Edits a task for the user

## milestoneStore

### State

- dailyQuotaStreak: The current streak of completing the daily quota (number)
- tasksCompletedCount: The number of tasks the user has completed (number)
- lastDigimonClaimedAt: The timestamp of the last digimon claimed (number | null)
- canClaimDigimon: Whether the user can claim a digimon (boolean)

### Key Methods

- fetchMilestones(): Promise<void>
  - Fetches the milestones for the user from the database
- incrementDailyQuotaStreak(): Promise<void>
  - Increments the daily quota streak for the user
- incrementTasksCompleted(count?: number): Promise<void>
  - Increments the tasks completed count for the user
- resetMilestoneProgress(type: "daily_quota" | "tasks_completed"): Promise<void>
  - Resets the milestone progress for the user (daily quota or tasks completed, deducts the necessary amount from the milestone counts)
- claimSelectedDigimon(digimonId: number): Promise<boolean>
  - Claims the selected digimon for the user
- claimDigimon(): Promise<boolean>
  - Claims the digimon for the user
- checkCanClaimDigimon(): boolean
  - Checks if the user can claim a digimon, meets either the daily quota streak or tasks completed milestones and has space in their digimon inventory

## notificationStore

### State

- notifications: The notifications for the user (Notification[])

### Key Methods

- addNotification(notification: Notification): void
  - Adds a notification to the user's notifications
- removeNotification(notificationId: string): void
  - Removes a notification from the user's notifications
- clearNotifications(): void
  - Clears all notifications from the user's notifications

# Main Features

## Task Creation & completion

### Description

- Users create tasks that represent real-life goals, categorized as One-Time, Daily, or Recurring. Completing tasks gives EXP and stat gains to their Active Digimon.

### User Flow

- User opens the app -> clicks "Add Task"
- Fills in task name, selects task type (One-Time, Daily, Recurring)
- Optionally assigns a category to the task, if one wasn't detected (e.g. "HP", "SP", "Attack", "Defense", "Speed", "Intelligence")
- Selects a due date, if the task is a One-time
- Selects a recurring schedule, if the task is recurring (ex. Every Monday, Every weekday)
- Task appears in the task list
- User marks task as complete -> Digimon gains EXP and stat gains
- User can edit a task, or delete it
- Recurring or daily tasks are automatically refreshed each respective day

### Components

- TaskList
- TaskItem
- TaskForm
- EditTaskModal

### Technical Implementation

- Task data stored in database (supabase) in Tasks table
- On completion:
  - Award EXP to Active Digimon, and stat gains based on task category (if applicable)
  - Update Digimon's current_exp, bonus stats, and check for level ups
- For recurring/daily tasks:
  - Reset is_completed to false
  - Apply penalty if not done by end of reset

## Digimon Growth (EXP, Stats, Leveling)

### Description

- Digimon level up and gain stats as the user completes tasks and gains experience. As Digimon reach certain levels and stat thresholds, they may unlock more evolutions.

### User Flow

- Complete tasks -> active Digimon gains EXP
- When EXP threshold is reached (calculated by digimon's current level) -> Digimon levels up
- Bonus stats grow depending on task type completed
- View Digimon profile to monitor growth and potential evolutions
- Evolve Digimon when they reach certain levels and stat thresholds (resets level back to 1)
- Devolve Digimon

### Components

- Digimon
- DigimonDetailModal
- EvolutionAnimation

### Technical Implementation

- Each Digimon has:
  - Current Level
  - Current exp
  - bonus stats
  - base stats (calculated based on level 1, 50, 99 stats and current level)
  - personality
- EXP curve (e.g. 20 \* (current level -1))
- Stats increase via:
  - level up
  - bonus stats gained from tasks

## Evolution System

### Description

- Users can evolve Digimon whent hey meet level + stat requirements. Evolution resets level to 1 and gives bonus stats, depending on level before evolution.

### User Flow

- Go to Digimon profile
- Check available evolutions -> view requirements
- Select evolution -> confirm
- Level resets to 1, bonus stats increase

### Components

- EvolutionModal
- EvolutionAnimations
- Evolve/Devolve Button

### Technical Implementation

- Evolution paths stored in database (supabase) in Evolution_Paths table
- Each Digimon links to possible evolutions:
  - Requirements: level, possible stat requirements
- Evolution resets level to 1
- Devolution allowed anytime to a previous evolution that has been discovered

## Multiple Digimon Management

### Description

- Users can raise more than one Digimon, and switch between them as their active Digimon. Only the active Digimon gains full experience and stat gains from tasks, others gain partial experience.

### User Flow

- User starts with 1 Digimon
- Reaches milestone -> unlocks next slot
- Chooses new Digimon from baby stage
- Assigns active Digimon (others get 30% exp)
- Switch active Digimon anytime

### Components

- UserDigimonPage
- DigimonList
- DigimonDetailModal
- ActiveDigimonButton

### Technical Implementation

- Slot unlocks:
  - Currently, every 10 tasks completed or 3 daily quotas completed
- EXP Distribution Logic:
  - 100% EXP to active Digimon and stat gains
  - 30% EXP to other Digimon
