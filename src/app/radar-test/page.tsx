'use client';

import React, { useEffect } from 'react';
import RadarChart from '@/components/charts/RadarChart';
import { transformCategoriesToChartData } from '@/utils/chartUtils';
import { DASHBOARD_COLORS } from '@/styles/dashboardColors';

const RadarTestPage: React.FC = () => {
  // Debug function to manually create chart data
  const createTestChartData = (categories: any[]) => {
    return categories.map(cat => ({
      name: cat.name,
      value: Math.round(cat.score),
      maxValue: 100
    }));
  };

  useEffect(() => {
    // Log to check if component is properly imported
    console.log('RadarChart component:', RadarChart);
    console.log('RadarChart type:', typeof RadarChart);
  }, []);

  // Sample data from your response
  const sampleData = {
    "teamId": "47ed375e-9700-44df-bdab-1f7f45a58488",
    "teamName": "Squad Beta",
    "totalScore": 66.1,
    "employeeCount": 10,
    "completionPercentage": 100.0,
    "pillarScores": {
      "Governança": {
        "name": "Governança",
        "score": 14.9,
        "actualScore": 14.9,
        "potentialScore": 100.0,
        "gapFromPotential": 85.1,
        "categories": [
          {
            "name": "Papéis e Responsabilidades",
            "score": 3.9,
            "actualScore": 3.9,
            "potentialScore": 100.0,
            "gapFromPotential": 96.1
          },
          {
            "name": "Cadência Ciclos OKRs",
            "score": 3.7,
            "actualScore": 3.7,
            "potentialScore": 100.0,
            "gapFromPotential": 96.3
          },
          {
            "name": "Acompanhamento e Gestão",
            "score": 3.7,
            "actualScore": 3.7,
            "potentialScore": 100.0,
            "gapFromPotential": 96.3
          },
          {
            "name": "Periodicidade Reuniões",
            "score": 3.6,
            "actualScore": 3.6,
            "potentialScore": 100.0,
            "gapFromPotential": 96.4
          }
        ]
      },
      "Orientação a Dados": {
        "name": "Orientação a Dados",
        "score": 14.6,
        "actualScore": 14.6,
        "potentialScore": 100.0,
        "gapFromPotential": 85.4,
        "categories": [
          {
            "name": "Uso de Dados nos OKRs",
            "score": 3.7,
            "actualScore": 3.7,
            "potentialScore": 100.0,
            "gapFromPotential": 96.3
          },
          {
            "name": "Fóruns Análise Dados",
            "score": 3.5,
            "actualScore": 3.5,
            "potentialScore": 100.0,
            "gapFromPotential": 96.5
          },
          {
            "name": "Efetividade Planos Correção",
            "score": 3.6,
            "actualScore": 3.6,
            "potentialScore": 100.0,
            "gapFromPotential": 96.4
          },
          {
            "name": "Acesso Métricas",
            "score": 3.8,
            "actualScore": 3.8,
            "potentialScore": 100.0,
            "gapFromPotential": 96.2
          }
        ]
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      <h1>Radar Chart Test Page</h1>
      <p>Testing radar chart rendering with sample data</p>

      <div className="row mt-4">
        {Object.entries(sampleData.pillarScores).map(([pillarKey, pillar], pillarIndex) => (
          <div key={pillarKey} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{pillar.name}</h3>
                <p className="mb-0">Categories: {pillar.categories.length}</p>
              </div>
              <div className="card-body">
                <h5>Raw Categories Data:</h5>
                <pre className="bg-light p-2 mb-3" style={{ fontSize: '0.8rem' }}>
                  {JSON.stringify(pillar.categories, null, 2)}
                </pre>

                <h5>Transformed Chart Data:</h5>
                <pre className="bg-light p-2 mb-3" style={{ fontSize: '0.8rem' }}>
                  {JSON.stringify(transformCategoriesToChartData(pillar.categories), null, 2)}
                </pre>
                
                <h5>Radar Chart:</h5>
                <div className="border p-2">
                  <p>Entity count: 1</p>
                  <p>Data points: {pillar.categories.length}</p>
                  <RadarChart
                    entities={[{
                      entityId: `${sampleData.teamId}-${pillarKey}`,
                      entityName: pillar.name,
                      data: transformCategoriesToChartData(pillar.categories),
                      color: DASHBOARD_COLORS.radar.primary[pillarIndex % DASHBOARD_COLORS.radar.primary.length]
                    }]}
                    height={300}
                    showLegend={false}
                    animate={true}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Test with Simple Hardcoded Data</h3>
            </div>
            <div className="card-body">
              <h5>Simple test data:</h5>
              <pre className="bg-light p-2 mb-3">
                {JSON.stringify([
                  { name: 'Category A', value: 70, maxValue: 100 },
                  { name: 'Category B', value: 85, maxValue: 100 },
                  { name: 'Category C', value: 60, maxValue: 100 },
                  { name: 'Category D', value: 90, maxValue: 100 }
                ], null, 2)}
              </pre>
              <RadarChart
                entities={[{
                  entityId: 'test-1',
                  entityName: 'Test Entity',
                  data: [
                    { name: 'Category A', value: 70, maxValue: 100 },
                    { name: 'Category B', value: 85, maxValue: 100 },
                    { name: 'Category C', value: 60, maxValue: 100 },
                    { name: 'Category D', value: 90, maxValue: 100 }
                  ],
                  color: '#3498db'
                }]}
                height={300}
                showLegend={false}
                animate={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Combined Radar Chart (All Pillars)</h3>
            </div>
            <div className="card-body">
              <RadarChart
                entities={Object.entries(sampleData.pillarScores).map(([pillarKey, pillar], index) => ({
                  entityId: `${sampleData.teamId}-${pillarKey}`,
                  entityName: pillar.name,
                  data: transformCategoriesToChartData(pillar.categories),
                  color: DASHBOARD_COLORS.radar.primary[index % DASHBOARD_COLORS.radar.primary.length]
                }))}
                height={400}
                showLegend={true}
                animate={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarTestPage;