'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import TeamRadarChart, { TeamRadarData } from '@/components/charts/TeamRadarChart';
import { DASHBOARD_COLORS } from '@/styles/dashboardColors';

const RadarDemoPage: React.FC = () => {
  // Sample data for demonstration
  const sampleTeams: TeamRadarData[] = [
    {
      teamId: '1',
      teamName: 'Team Alpha',
      data: [
        { pillar: 'Leadership', score: 85, fullMark: 100 },
        { pillar: 'Communication', score: 92, fullMark: 100 },
        { pillar: 'Technical Skills', score: 78, fullMark: 100 },
        { pillar: 'Collaboration', score: 88, fullMark: 100 },
        { pillar: 'Innovation', score: 73, fullMark: 100 },
        { pillar: 'Quality', score: 95, fullMark: 100 }
      ],
      color: DASHBOARD_COLORS.radar.primary[0]
    },
    {
      teamId: '2',
      teamName: 'Team Beta',
      data: [
        { pillar: 'Leadership', score: 75, fullMark: 100 },
        { pillar: 'Communication', score: 85, fullMark: 100 },
        { pillar: 'Technical Skills', score: 90, fullMark: 100 },
        { pillar: 'Collaboration', score: 82, fullMark: 100 },
        { pillar: 'Innovation', score: 88, fullMark: 100 },
        { pillar: 'Quality', score: 80, fullMark: 100 }
      ],
      color: DASHBOARD_COLORS.radar.primary[1]
    },
    {
      teamId: '3',
      teamName: 'Team Gamma',
      data: [
        { pillar: 'Leadership', score: 90, fullMark: 100 },
        { pillar: 'Communication', score: 78, fullMark: 100 },
        { pillar: 'Technical Skills', score: 85, fullMark: 100 },
        { pillar: 'Collaboration', score: 92, fullMark: 100 },
        { pillar: 'Innovation', score: 80, fullMark: 100 },
        { pillar: 'Quality', score: 87, fullMark: 100 }
      ],
      color: DASHBOARD_COLORS.radar.primary[2]
    }
  ];

  return (
    <AdminLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Radar Chart Demo</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active">Radar Demo</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Single Team Radar */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Single Team Radar Chart</h3>
                </div>
                <div className="card-body">
                  <TeamRadarChart
                    teams={[sampleTeams[0]]}
                    height={300}
                    showLegend={false}
                  />
                </div>
              </div>
            </div>

            {/* Two Team Comparison */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Two Team Comparison</h3>
                </div>
                <div className="card-body">
                  <TeamRadarChart
                    teams={[sampleTeams[0], sampleTeams[1]]}
                    height={300}
                    showLegend={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Team Comparison */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Multi-Team Comparison</h3>
                </div>
                <div className="card-body">
                  <TeamRadarChart
                    teams={sampleTeams}
                    height={400}
                    showLegend={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Small Grid Display */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Grid Display (As shown in Team Comparison)</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {sampleTeams.map((team) => (
                      <div key={team.teamId} className="col-md-4 mb-3">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title mb-0">{team.teamName}</h5>
                          </div>
                          <div className="card-body">
                            <TeamRadarChart
                              teams={[team]}
                              height={250}
                              showLegend={false}
                            />
                            <div className="text-center mt-3">
                              <button className="btn btn-sm btn-outline-primary">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default RadarDemoPage;