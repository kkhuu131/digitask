# Digitask Documentation

# Core Data Models

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
  - created_at: timestamp (date and time when the digimon was discovered)
