'use client';

import React, { useState, useEffect } from 'react';
import { 
  DASHBOARD_COLORS, 
  getRadarColor, 
  getMatrixCardColor, 
  getStatusColor, 
  getWordCloudColor, 
  getTeamColorSet 
} from '@/styles/dashboardColors';

const ColorTestPage: React.FC = () => {
  const [wordCloudData, setWordCloudData] = useState<Array<{word: string, size: number, color: string}>>([]);

  // Generate word cloud data on client side to avoid hydration issues
  useEffect(() => {
    const words = ['Agile', 'Team', 'Communication', 'Innovation', 'Collaboration', 'Quality', 'Delivery', 'Sprint', 'Retrospective', 'Planning', 'Backlog', 'Standup', 'Scrum', 'Velocity', 'Burndown'];
    const wordData = words.map((word, index) => ({
      word,
      size: Math.floor(Math.random() * 32) + 18, // 18-50px
      color: getWordCloudColor(index)
    }));
    
    // Sort by size for better layout (biggest in center)
    wordData.sort((a, b) => b.size - a.size);
    setWordCloudData(wordData);
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Dashboard Color System Test</h1>
          
          {/* Brand Colors */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Brand Colors (Ludic)</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(DASHBOARD_COLORS.brand).map(([name, color]) => (
                  <div key={name} className="col-md-3 mb-3">
                    <div 
                      className="p-3 rounded border text-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      <strong>{name}</strong><br />
                      <small>{color}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Matrix Card Colors */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Assessment Matrix Card Colors</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Completed Card */}
                <div className="col-md-4 mb-3">
                  {(() => {
                    const cardColor = getMatrixCardColor(10, 10); // 100% complete
                    return (
                      <div 
                        className="p-3 rounded border-3"
                        style={{ 
                          borderColor: cardColor.border,
                          backgroundColor: cardColor.background,
                          borderStyle: 'solid'
                        }}
                      >
                        <h5 style={{ color: cardColor.text }}>Completed Assessment</h5>
                        <span 
                          className="badge px-2 py-1"
                          style={{ backgroundColor: cardColor.badge, color: 'white' }}
                        >
                          100% Complete
                        </span>
                        <p className="mt-2 mb-0" style={{ color: cardColor.text }}>
                          10/10 employees completed
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* In Progress Card */}
                <div className="col-md-4 mb-3">
                  {(() => {
                    const cardColor = getMatrixCardColor(7, 10); // 70% complete
                    return (
                      <div 
                        className="p-3 rounded border-3"
                        style={{ 
                          borderColor: cardColor.border,
                          backgroundColor: cardColor.background,
                          borderStyle: 'solid'
                        }}
                      >
                        <h5 style={{ color: cardColor.text }}>In Progress Assessment</h5>
                        <span 
                          className="badge px-2 py-1"
                          style={{ backgroundColor: cardColor.badge, color: 'white' }}
                        >
                          70% Complete
                        </span>
                        <p className="mt-2 mb-0" style={{ color: cardColor.text }}>
                          7/10 employees completed
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Low Progress Card */}
                <div className="col-md-4 mb-3">
                  {(() => {
                    const cardColor = getMatrixCardColor(2, 10); // 20% complete
                    return (
                      <div 
                        className="p-3 rounded border-3"
                        style={{ 
                          borderColor: cardColor.border,
                          backgroundColor: cardColor.background,
                          borderStyle: 'solid'
                        }}
                      >
                        <h5 style={{ color: cardColor.text }}>Early Progress Assessment</h5>
                        <span 
                          className="badge px-2 py-1"
                          style={{ backgroundColor: cardColor.badge, color: 'white' }}
                        >
                          20% Complete
                        </span>
                        <p className="mt-2 mb-0" style={{ color: cardColor.text }}>
                          2/10 employees completed
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Additional Examples - Different Progress Ranges */}
              <h5 className="mt-4 mb-3">Progress Range Examples:</h5>
              <div className="row">
                {/* High Progress (80%) */}
                <div className="col-md-6 mb-3">
                  {(() => {
                    const cardColor = getMatrixCardColor(8, 10); // 80% complete
                    return (
                      <div 
                        className="p-3 rounded border-3"
                        style={{ 
                          borderColor: cardColor.border,
                          backgroundColor: cardColor.background,
                          borderStyle: 'solid'
                        }}
                      >
                        <h6 style={{ color: cardColor.text }}>High Progress (≥50%)</h6>
                        <span 
                          className="badge px-2 py-1"
                          style={{ backgroundColor: cardColor.badge, color: 'white' }}
                        >
                          80% Complete - Blue
                        </span>
                        <p className="mt-2 mb-0" style={{ color: cardColor.text }}>
                          8/10 employees completed
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Low Progress (30%) - Should be Yellow */}
                <div className="col-md-6 mb-3">
                  {(() => {
                    const cardColor = getMatrixCardColor(3, 10); // 30% complete
                    return (
                      <div 
                        className="p-3 rounded border-3"
                        style={{ 
                          borderColor: cardColor.border,
                          backgroundColor: cardColor.background,
                          borderStyle: 'solid'
                        }}
                      >
                        <h6 style={{ color: cardColor.text }}>Low Progress (1-49%)</h6>
                        <span 
                          className="badge px-2 py-1"
                          style={{ backgroundColor: cardColor.badge, color: 'white' }}
                        >
                          30% Complete - Yellow
                        </span>
                        <p className="mt-2 mb-0" style={{ color: cardColor.text }}>
                          3/10 employees completed
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Team Radar Colors (All 30) */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Team Radar Colors (All 30 - 9 Base Colors with Variations)</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {Array.from({ length: 30 }, (_, index) => (
                  <div key={index} className="col-md-2 col-sm-3 col-4 mb-3">
                    <div 
                      className="p-2 rounded border text-center text-white"
                      style={{ backgroundColor: getRadarColor(index) }}
                    >
                      <strong>Team {index + 1}</strong><br />
                      <small style={{ fontSize: '10px' }}>{getRadarColor(index)}</small>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-muted">
                <small>Each team gets a unique color. Pattern: 9 base colors → 9 lighter variants → 9 darker variants → 3 additional colors. No two teams have the same color.</small>
              </p>
            </div>
          </div>

          {/* Word Cloud Colors */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Word Cloud Colors</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {DASHBOARD_COLORS.wordCloud.map((color, index) => (
                  <div key={index} className="col-md-2 col-sm-3 col-4 mb-3">
                    <div 
                      className="p-2 rounded border text-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      <strong>Word</strong><br />
                      <small>{color}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Colors */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Status Colors</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(DASHBOARD_COLORS.status).map(([name, color]) => (
                  <div key={name} className="col-md-2 col-sm-4 col-6 mb-3">
                    <div 
                      className="p-2 rounded border text-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      <strong>{name.replace('_', ' ')}</strong><br />
                      <small>{color}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Word Cloud Simulation */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Word Cloud Simulation</h3>
            </div>
            <div className="card-body">
              <div 
                className="word-cloud-container"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  padding: '20px',
                  lineHeight: '1.2'
                }}
              >
                {wordCloudData.map((item, index) => (
                  <span 
                    key={item.word}
                    className="fw-bold"
                    style={{ 
                      color: item.color,
                      fontSize: `${item.size}px`,
                      margin: '5px 10px',
                      display: 'inline-block',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transform: index % 3 === 0 ? 'rotate(-2deg)' : index % 3 === 1 ? 'rotate(1deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(0deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = index % 3 === 0 ? 'scale(1) rotate(-2deg)' : index % 3 === 1 ? 'scale(1) rotate(1deg)' : 'scale(1) rotate(0deg)';
                    }}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
              <p className="text-muted text-center mt-3">
                <small>Interactive word cloud with deterministic colors and proper cloud layout. Font sizes represent word frequency.</small>
              </p>
            </div>
          </div>

          {/* Function Testing */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Utility Functions Test</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>getTeamColorSet(5)</h5>
                  {getTeamColorSet(5).map((colorSet, index) => (
                    <div key={index} className="mb-2">
                      <span 
                        className="badge me-2 px-3 py-2"
                        style={{ backgroundColor: colorSet.main, color: 'white' }}
                      >
                        Team {index + 1} Main
                      </span>
                      <span 
                        className="badge px-3 py-2"
                        style={{ backgroundColor: colorSet.background, color: colorSet.main }}
                      >
                        Team {index + 1} Background
                      </span>
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  <h5>getStatusColor(percentage)</h5>
                  {[100, 75, 25, 0].map(percentage => {
                    const statusColor = getStatusColor(percentage);
                    return (
                      <div key={percentage} className="mb-2">
                        <span 
                          className="badge me-2 px-3 py-2"
                          style={{ backgroundColor: statusColor.main, color: 'white' }}
                        >
                          {percentage}% Complete
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTestPage;