/**
 * Chart utility functions for data transformation and chart operations
 */

export interface ChartDataPoint {
  name: string;
  value: number;
  maxValue: number;
}

/**
 * Transforms pillar scores from API response to chart data format
 * @param pillarScores Record of pillar data from API
 * @returns Array of chart data points
 */
export const transformPillarScoresToChartData = (
  pillarScores: Record<string, { name: string; score: number; actualScore: number; potentialScore: number }>
): ChartDataPoint[] => {
  return Object.entries(pillarScores).map(([, pillar]) => ({
    name: pillar.name,
    value: Math.round(pillar.score),
    maxValue: 100
  }));
};

/**
 * Transforms categories array to chart data format
 * @param categories Array of category data from API
 * @returns Array of chart data points
 */
export const transformCategoriesToChartData = (
  categories: Array<{ name: string; score: number; actualScore: number; potentialScore: number }>
): ChartDataPoint[] => {
  return categories.map(category => ({
    name: category.name,
    value: Math.round(category.score),
    maxValue: 100
  }));
};

/**
 * Validates if chart data has sufficient points for radar visualization
 * @param data Array of chart data points
 * @param minPoints Minimum number of points required (default: 3)
 * @returns Boolean indicating if data is sufficient for radar chart
 */
export const hasMinimumDataPointsForRadar = (data: ChartDataPoint[], minPoints = 3): boolean => {
  return data && data.length >= minPoints;
};

/**
 * Calculates average score from chart data points
 * @param data Array of chart data points
 * @returns Average score rounded to nearest integer
 */
export const calculateAverageScore = (data: ChartDataPoint[]): number => {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, point) => acc + point.value, 0);
  return Math.round(sum / data.length);
};