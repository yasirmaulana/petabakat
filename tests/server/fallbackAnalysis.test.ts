import { describe, expect, it } from 'vitest'
import { fallbackAnalysis } from '../../server/utils/fallbackAnalysis'

describe('fallbackAnalysis', () => {
  it('memilih persona berdasarkan kombinasi 2 rumpun teratas (urutan tidak berpengaruh)', () => {
    expect(fallbackAnalysis({}, ['karam', 'ilmi'], []).personaLabel).toBe('The Compassionate Scholar')
    expect(fallbackAnalysis({}, ['karam', 'amali', 'ilmi'], []).personaLabel).toBe('The Ethical Builder')
  })

  it('persona generik dari rumpun teratas bila kombinasi tidak dikenal', () => {
    const r = fallbackAnalysis({}, ['qiyadah', 'ilmi'], [])
    expect(r.personaLabel).toBe('The Qiyadah Profile')
    expect(r.scoreNarrative).toContain('qiyadah')
  })

  it('default ke ilmi bila urutan rumpun kosong', () => {
    expect(fallbackAnalysis({}, [], []).personaLabel).toBe('The Ilmi Profile')
  })

  it('selalu menandai _fallback dan menyertakan jadwal stimulasi', () => {
    const r = fallbackAnalysis({}, ['amali'], [])
    expect(r._fallback).toBe(true)
    expect(r.microdosingPlan.title).toBe('Rencana Stimulasi The Amali Profile')
    expect(r.microdosingPlan.schedule).toHaveLength(3)
    expect(r.bridgingActions).toEqual([])
    expect(r.lesRecommendations).toBeNull()
  })

  it('tidak mengubah array orderedHasab milik pemanggil', () => {
    const ordered = ['karam', 'ilmi']
    fallbackAnalysis({}, ordered, [])
    expect(ordered).toEqual(['karam', 'ilmi'])
  })
})
