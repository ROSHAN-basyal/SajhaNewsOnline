'use client'

import '../styles/ad-placement-selector.css'

type PlacementId = 'header' | 'sidebar_top' | 'in_content' | 'sidebar_mid' | 'footer'

interface AdPlacement {
  id: PlacementId
  name: string
  description: string
  size: string
  impact: 'high' | 'medium' | 'low'
}

const AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'header',
    name: 'Header Banner',
    description: 'Top of page, highest visibility',
    size: '728×90 / 320×50 (mobile)',
    impact: 'high'
  },
  {
    id: 'sidebar_top',
    name: 'Sidebar Top',
    description: 'Always visible, above the fold',
    size: '300×250',
    impact: 'high'
  },
  {
    id: 'in_content',
    name: 'In-Content',
    description: 'Between news stories',
    size: '728×90 / 300×250',
    impact: 'medium'
  },
  {
    id: 'sidebar_mid',
    name: 'Sidebar Mid',
    description: 'Middle of sidebar content',
    size: '300×600 / 300×250',
    impact: 'medium'
  },
  {
    id: 'footer',
    name: 'Footer Banner',
    description: 'End of page content',
    size: '728×90',
    impact: 'low'
  }
]

interface AdPlacementSelectorProps {
  selectedPlacement: string
  onPlacementChange: (placement: string) => void
  existingAds?: { [key: string]: number }
}

const IMPACT_COLORS: Record<AdPlacement['impact'], string> = {
  high: '#2563eb',
  medium: '#f97316',
  low: '#16a34a'
}

function getPlacementStatus(existingAds: { [key: string]: number }, placementId: string) {
  const count = existingAds[placementId] || 0
  if (count === 0) return { status: 'Available', color: '#16a34a' }
  if (count < 3) return { status: `${count} existing`, color: '#f97316' }
  return { status: 'Full (3+)', color: '#ef4444' }
}

export default function AdPlacementSelector({
  selectedPlacement,
  onPlacementChange,
  existingAds = {}
}: AdPlacementSelectorProps) {
  const selected = AD_PLACEMENTS.find((p) => p.id === selectedPlacement) || AD_PLACEMENTS[0]

  return (
    <div className="placement-picker">
      <div className="placement-picker__header">
        <h3>Choose Placement</h3>
        <p>Pick where the ad should appear on Sajha News Online.</p>
      </div>

      <div className="placement-picker__layout">
        <div className="site-map" aria-label="Site layout preview">
          <div className={`site-map__row site-map__header ${selected.id === 'header' ? 'is-selected' : ''}`}>
            Header
          </div>

          <div className="site-map__middle">
            <div className="site-map__content">
              <div className="site-map__story">Story</div>
              <div className={`site-map__ad ${selected.id === 'in_content' ? 'is-selected' : ''}`}>In-content ad</div>
              <div className="site-map__story">Story</div>
            </div>

            <div className="site-map__sidebar">
              <div className={`site-map__widget ${selected.id === 'sidebar_top' ? 'is-selected' : ''}`}>Sidebar top</div>
              <div className="site-map__widget">Trending</div>
              <div className={`site-map__widget ${selected.id === 'sidebar_mid' ? 'is-selected' : ''}`}>Sidebar mid</div>
            </div>
          </div>

          <div className={`site-map__row site-map__footer ${selected.id === 'footer' ? 'is-selected' : ''}`}>
            Footer
          </div>
        </div>

        <div className="placement-grid" role="list">
          {AD_PLACEMENTS.map((placement) => {
            const isActive = placement.id === selectedPlacement
            const availability = getPlacementStatus(existingAds, placement.id)

            return (
              <button
                key={placement.id}
                type="button"
                role="listitem"
                className={`placement-card ${isActive ? 'is-active' : ''}`}
                onClick={() => onPlacementChange(placement.id)}
              >
                <div className="placement-card__top">
                  <div className="placement-card__title">{placement.name}</div>
                  <span
                    className="placement-card__impact"
                    style={{ backgroundColor: IMPACT_COLORS[placement.impact] }}
                  >
                    {placement.impact.toUpperCase()}
                  </span>
                </div>

                <div className="placement-card__desc">{placement.description}</div>

                <div className="placement-card__meta">
                  <div className="placement-card__metaRow">
                    <span>Size</span>
                    <strong>{placement.size}</strong>
                  </div>
                  <div className="placement-card__metaRow">
                    <span>Status</span>
                    <strong style={{ color: availability.color }}>{availability.status}</strong>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

