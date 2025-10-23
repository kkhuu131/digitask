# Interactive Battle System

## Overview

The interactive battle system allows players to make strategic decisions during battles by selecting targets for their Digimon's attacks. This replaces the previous fully automated battle system with player-controlled combat.

## Key Features

### 1. **Target Selection**
- Players can click on enemy Digimon to select them as targets
- Visual feedback shows which target is selected
- Confirmation required before attack executes

### 2. **Turn-Based Combat**
- Digimon act in order based on their Speed (SPD) stat
- Player controls their team's actions
- AI controls opponent team actions

### 3. **Real-Time Battle State**
- HP bars update in real-time
- Damage numbers display with critical hit indicators
- Battle status shows alive Digimon count

### 4. **Battle Modes**
- **Auto Mode**: Original automated battles (default)
- **Interactive Mode**: New player-controlled battles

## Implementation Details

### File Structure
```
src/
├── types/battle.ts                    # Type definitions
├── store/interactiveBattleStore.ts    # Battle state management
├── components/InteractiveBattle.tsx   # Battle UI component
└── pages/Battle.tsx                  # Updated battle page
```

### Key Components

#### 1. **BattleState Interface**
```typescript
interface BattleState {
  id: string;
  userTeam: BattleDigimon[];
  opponentTeam: BattleDigimon[];
  currentTurn: number;
  currentAttacker: string | null;
  isPlayerTurn: boolean;
  isBattleComplete: boolean;
  winner: 'user' | 'opponent' | null;
  turnHistory: BattleTurn[];
}
```

#### 2. **InteractiveBattleStore**
- Manages battle state
- Handles turn processing
- Calculates damage and effects
- Manages AI opponent behavior

#### 3. **InteractiveBattle Component**
- Renders battle UI
- Handles user input
- Displays battle animations
- Shows battle results

## Usage

### Starting an Interactive Battle

1. Navigate to the Battle page
2. Toggle battle mode to "Interactive"
3. Select an opponent
4. Click "Start Battle"

### During Battle

1. **Your Turn**: Click on an enemy Digimon to select target
2. **Confirm Attack**: Click "Confirm Attack" button
3. **Opponent Turn**: AI automatically selects targets
4. **Repeat**: Continue until one team is defeated

### Battle Controls

- **Target Selection**: Click on enemy Digimon
- **Confirm Attack**: Green button appears when target selected
- **Battle Status**: Shows remaining Digimon count
- **HP Bars**: Real-time health display

## Technical Implementation

### State Management
- Uses Zustand for state management
- Separate store for interactive battles
- Maintains compatibility with existing auto battles

### Damage Calculation
```typescript
const calculateDamage = (attacker: BattleDigimon, target: BattleDigimon) => {
  const missChance = 0.05; // 5% miss chance
  const criticalChance = 0.125; // 12.5% critical chance
  
  // Damage calculation logic...
  return { damage, isCritical, isMiss };
};
```

### AI Behavior
- Simple strategy: target lowest HP user Digimon
- Automatic turn processing
- 1-second delay for better UX

## Future Enhancements

### Planned Features
1. **Special Moves**: Digimon-specific abilities
2. **Status Effects**: Poison, paralysis, etc.
3. **Item Usage**: Consumable items during battle
4. **Advanced AI**: More sophisticated opponent strategies
5. **Battle Animations**: Enhanced visual effects

### Technical Improvements
1. **Performance**: Optimize for large teams
2. **Accessibility**: Screen reader support
3. **Mobile**: Touch-friendly controls
4. **Offline**: Local battle processing

## Migration Guide

### From Auto Battles
- Existing auto battles continue to work
- New interactive mode is opt-in
- Battle results are processed identically
- XP and rewards remain the same

### Breaking Changes
- None - fully backward compatible
- New files added, existing unchanged
- Optional feature, doesn't affect existing users

## Testing

### Manual Testing
1. Start interactive battle
2. Select different targets
3. Verify damage calculation
4. Test battle completion
5. Check XP rewards

### Automated Testing
```typescript
// Example test case
test('interactive battle target selection', () => {
  const store = useInteractiveBattleStore.getState();
  // Test target selection logic
});
```

## Troubleshooting

### Common Issues
1. **Target not selectable**: Check if it's your turn
2. **Battle not starting**: Verify team has Digimon
3. **UI not updating**: Check store state updates
4. **Performance issues**: Reduce animation complexity

### Debug Mode
- Enable in development environment
- Console logs for battle state
- Visual indicators for turn order
- Damage calculation details

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load battle components on demand
2. **State Updates**: Minimize re-renders
3. **Animation**: Use CSS transforms for smooth effects
4. **Memory**: Clean up battle state after completion

### Monitoring
- Battle duration tracking
- User engagement metrics
- Error rate monitoring
- Performance benchmarks

## Security

### Client-Side Validation
- Target selection validation
- Turn order enforcement
- Damage calculation verification

### Server-Side Verification
- Battle result validation
- Anti-cheat measures
- XP reward verification

## Conclusion

The interactive battle system provides a more engaging and strategic combat experience while maintaining full compatibility with the existing automated battle system. Players can now make meaningful decisions during battles, adding depth and skill to the combat mechanics.
