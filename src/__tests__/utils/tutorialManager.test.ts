import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TutorialManager } from '../../utils/tutorialManager';

describe('tutorial progress', () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('preserves earlier dismissals when a different guide is completed', () => {
    storage.set('digitask_tutorials', JSON.stringify({ dashboard_intro: true }));
    TutorialManager.markCompleted('battle_intro');
    expect(TutorialManager.hasCompleted('dashboard_intro')).toBe(true);
    expect(TutorialManager.hasCompleted('battle_intro')).toBe(true);
    TutorialManager.reset('battle_intro');
    expect(TutorialManager.hasCompleted('dashboard_intro')).toBe(true);
    expect(TutorialManager.hasCompleted('battle_intro')).toBe(false);
  });

  it.each(['null', '[]', '"done"', '{"dashboard_intro":"true"}'])(
    'ignores invalid stored flags: %s',
    (stored) => {
      storage.set('digitask_tutorials', stored);
      expect(TutorialManager.hasCompleted('dashboard_intro')).toBe(false);
      TutorialManager.markCompleted('dashboard_intro');
      expect(TutorialManager.hasCompleted('dashboard_intro')).toBe(true);
    }
  );
});
