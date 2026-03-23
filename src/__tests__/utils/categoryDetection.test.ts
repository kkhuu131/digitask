import { describe, it, expect } from 'vitest';
import { detectCategory } from '@/utils/categoryDetection';

describe('detectCategory', () => {
  it('detects ATK from exercise keywords', () => {
    expect(detectCategory('gym workout')).toBe('ATK');
    expect(detectCategory('go for a run')).toBe('ATK');
  });

  it('detects INT from study keywords', () => {
    expect(detectCategory('study for class')).toBe('INT');
    expect(detectCategory('read a book')).toBe('INT');
  });

  it('detects HP from sleep/health keywords', () => {
    expect(detectCategory('get some sleep')).toBe('HP');
    expect(detectCategory('doctor appointment')).toBe('HP');
  });

  it('detects DEF from planning/organisation keywords', () => {
    expect(detectCategory('plan and organize')).toBe('DEF');
    expect(detectCategory('budget for savings')).toBe('DEF');
  });

  it('detects SPD from quick-task keywords', () => {
    expect(detectCategory('quick errand')).toBe('SPD');
  });

  it('detects SP from mindfulness keywords', () => {
    expect(detectCategory('journal and meditate')).toBe('SP');
  });

  it('returns null when no keywords match', () => {
    expect(detectCategory('xyz123 nothing relevant here')).toBeNull();
    expect(detectCategory('')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(detectCategory('GYM WORKOUT')).toBe('ATK');
    expect(detectCategory('STUDY FOR SCHOOL')).toBe('INT');
  });

  it('picks the category with the most keyword matches', () => {
    // "exercise run workout" has 3 ATK keywords and 0 others → ATK
    expect(detectCategory('exercise run workout')).toBe('ATK');
  });
});
