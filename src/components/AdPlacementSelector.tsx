'use client'

import { useState } from 'react'
import '../styles/ad-placement-selector.css'

interface AdPlacement {
  id: 'header' | 'sidebar_top' | 'in_content' | 'sidebar_mid' | 'footer'
  name: string
  description: string
  size: string
  impact: 'high' | 'medium' | 'low'
  position: {
    top: string
    left: string
    width: string
    height: string
  }
}

const AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'header',
    name: 'Header Banner',
    description: 'Top of page, highest visibility',
    size: '728×90 / 320×50 (mobile)',
    impact: 'high',
    position: { top: '12%', left: '20%', width: '60%', height: '6%' }
  },
  {
    id: 'sidebar_top',
    name: 'Sidebar Top',
    description: 'Always visible, above fold',
    size: '300×250',
    impact: 'high',
    position: { top: '25%', left: '82%', width: '16%', height: '15%' }
  },
  {
    id: 'in_content',
    name: 'In-Content',
    description: 'Between news posts',
    size: '728×90 / 300×250',
    impact: 'medium',
    position: { top: '45%', left: '20%', width: '60%', height: '6%' }
  },
  {
    id: 'sidebar_mid',
    name: 'Sidebar Mid',
    description: 'Middle of sidebar content',
    size: '300×600 / 300×250',
    impact: 'medium',
    position: { top: '55%', left: '82%', width: '16%', height: '20%' }
  },
  {
    id: 'footer',
    name: 'Footer Banner',
    description: 'End of content area',
    size: '728×90',
    impact: 'low',
    position: { top: '85%', left: '20%', width: '60%', height: '6%' }
  }
]

interface AdPlacementSelectorProps {
  selectedPlacement: string
  onPlacementChange: (placement: string) => void
  existingAds?: { [key: string]: number } // Count of existing ads per placement
}

export default function AdPlacementSelector({ 
  selectedPlacement, 
  onPlacementChange, 
  existingAds = {} 
}: AdPlacementSelectorProps) {
  const [hoveredPlacement, setHoveredPlacement] = useState<string | null>(null)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#dc143c'
      case 'medium': return '#ff8c00'
      case 'low': return '#4caf50'
      default: return '#666'
    }
  }

  const getPlacementStatus = (placementId: string) => {
    const count = existingAds[placementId] || 0
    if (count === 0) return 'available'
    if (count < 3) return 'limited'
    return 'full'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4caf50'
      case 'limited': return '#ff8c00'
      case 'full': return '#dc143c'
      default: return '#666'
    }
  }

  return (
    <div className="ad-placement-selector">
      <div className="selector-header">
        <h3>Choose Ad Placement</h3>
        <p>Select where your advertisement will appear on the website</p>
      </div>

      <div className="placement-preview">
        <div className="preview-container">
          {/* Website Layout Preview */}
          <div className="website-preview">
            {/* Header */}
            <div className="preview-header">
              <div className="preview-logo">NewzNepal.com</div>
              <div className="preview-nav">
                <span>सबै समाचार</span>
                <span>राजनीति</span>
                <span>खेलकुद</span>
                <span>व्यापार</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="preview-main">
              <div className="preview-content">
                <div className="preview-post">
                  <div className="preview-post-image"></div>
                  <div className="preview-post-title">News Article Title</div>
                  <div className="preview-post-text"></div>
                </div>
                <div className="preview-post">
                  <div className="preview-post-image"></div>
                  <div className="preview-post-title">Another News Article</div>
                  <div className="preview-post-text"></div>
                </div>
              </div>

              <div className="preview-sidebar">
                <div className="preview-widget">Newsletter</div>
                <div className="preview-widget">Weather</div>
                <div className="preview-widget">Popular</div>
              </div>
            </div>

            {/* Footer */}
            <div className="preview-footer">
              <span>© 2024 NewzNepal.com</span>
            </div>

            {/* Ad Placement Overlays */}
            {AD_PLACEMENTS.map((placement) => {
              const isSelected = selectedPlacement === placement.id
              const isHovered = hoveredPlacement === placement.id
              const status = getPlacementStatus(placement.id)
              const adCount = existingAds[placement.id] || 0

              return (
                <div
                  key={placement.id}
                  className={`ad-overlay ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${status}`}
                  style={{
                    top: placement.position.top,
                    left: placement.position.left,
                    width: placement.position.width,
                    height: placement.position.height,
                  }}
                  onClick={() => onPlacementChange(placement.id)}
                  onMouseEnter={() => setHoveredPlacement(placement.id)}
                  onMouseLeave={() => setHoveredPlacement(null)}
                >
                  <div className="ad-overlay-content">
                    <span className="ad-placement-id">{placement.id.toUpperCase()}</span>
                    {adCount > 0 && (
                      <span className="ad-count">{adCount} ads</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Placement Details */}
          <div className="placement-details">
            {AD_PLACEMENTS.map((placement) => {
              const isSelected = selectedPlacement === placement.id
              const isHovered = hoveredPlacement === placement.id
              const status = getPlacementStatus(placement.id)
              const adCount = existingAds[placement.id] || 0

              return (
                <div
                  key={placement.id}
                  className={`placement-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                  onClick={() => onPlacementChange(placement.id)}
                  onMouseEnter={() => setHoveredPlacement(placement.id)}
                  onMouseLeave={() => setHoveredPlacement(null)}
                >
                  <div className="placement-card-header">
                    <h4>{placement.name}</h4>
                    <div 
                      className="impact-badge"
                      style={{ backgroundColor: getImpactColor(placement.impact) }}
                    >
                      {placement.impact.toUpperCase()}
                    </div>
                  </div>
                  
                  <p className="placement-description">{placement.description}</p>
                  
                  <div className="placement-specs">
                    <div className="spec-item">
                      <strong>Size:</strong> {placement.size}
                    </div>
                    <div className="spec-item">
                      <strong>Status:</strong>
                      <span 
                        className="status-badge"
                        style={{ color: getStatusColor(status) }}
                      >
                        {status === 'available' && 'Available'}
                        {status === 'limited' && `${adCount} existing`}
                        {status === 'full' && 'Full (3+ ads)'}
                      </span>
                    </div>
                  </div>

                  <div className="placement-pros-cons">
                    <div className="pros">
                      <strong>✓ Advantages:</strong>
                      <ul>
                        {placement.id === 'header' && (
                          <>
                            <li>First thing users see</li>
                            <li>Works on all pages</li>
                            <li>High click-through rate</li>
                          </>
                        )}
                        {placement.id === 'sidebar_top' && (
                          <>
                            <li>Always visible while scrolling</li>
                            <li>Doesn't interrupt content</li>
                            <li>Good for brand awareness</li>
                          </>
                        )}
                        {placement.id === 'in_content' && (
                          <>
                            <li>Native integration</li>
                            <li>High user engagement</li>
                            <li>Contextual relevance</li>
                          </>
                        )}
                        {placement.id === 'sidebar_mid' && (
                          <>
                            <li>Larger ad sizes supported</li>
                            <li>Engaged audience</li>
                            <li>Good visibility</li>
                          </>
                        )}
                        {placement.id === 'footer' && (
                          <>
                            <li>Non-intrusive placement</li>
                            <li>Catches dedicated readers</li>
                            <li>Cost-effective</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="selected-indicator">
                      ✓ Selected
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="selector-footer">
        <div className="placement-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#dc143c' }}></div>
            <span>High Impact</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff8c00' }}></div>
            <span>Medium Impact</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4caf50' }}></div>
            <span>Low Impact</span>
          </div>
        </div>
        
        <div className="placement-summary">
          <strong>Selected:</strong> {
            AD_PLACEMENTS.find(p => p.id === selectedPlacement)?.name || 'None'
          }
        </div>
      </div>
    </div>
  )
}