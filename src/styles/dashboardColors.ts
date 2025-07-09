/**
 * Dashboard Color System for AgileCheckup
 * 
 * Corporate color palette designed for professional dashboard visualizations
 * with support for radar graphs, status indicators, and word clouds.
 * 
 * Brand Reference: Ludic (#35042a)
 * Source: https://drive.google.com/drive/folders/1lk4a7B32JKIUSbDPpej_zcPMUQ9ZwizI
 */

// ==============================
// Brand Colors
// ==============================

export const BRAND_COLORS = {
  /** Primary brand color - Ludic */
  ludic: '#35042a',
  /** Brand color variations for different uses */
  ludic_light: '#4a0638',
  ludic_dark: '#220419',
  ludic_accent: '#6b1456'
} as const;

// ==============================
// Dashboard Color Palette
// ==============================

export const DASHBOARD_COLORS = {
  /**
   * Brand colors for primary accents and highlights
   */
  brand: {
    primary: BRAND_COLORS.ludic,
    light: BRAND_COLORS.ludic_light,
    dark: BRAND_COLORS.ludic_dark,
    accent: BRAND_COLORS.ludic_accent
  },

  /**
   * Radar graph colors - 30 distinct corporate colors for teams
   * Each team gets a unique color, cycling through 9 base colors + variations
   */
  radar: {
    primary: [
      // First 9: Base colors (all different)
      '#1f77b4', // 1. Blue
      '#2ca02c', // 2. Green
      '#ff7f0e', // 3. Orange
      '#9467bd', // 4. Purple
      '#d62728', // 5. Red
      '#17becf', // 6. Teal
      '#8c564b', // 7. Brown
      '#e377c2', // 8. Pink/Magenta
      '#bcbd22', // 9. Yellow/Gold
      
      // Next 9: Lighter variants (still all different colors)
      '#5ba3d4', // 10. Light Blue
      '#5cb85c', // 11. Light Green
      '#ff9f4e', // 12. Light Orange
      '#b48dd4', // 13. Light Purple
      '#e55758', // 14. Light Red
      '#4ccee0', // 15. Light Teal
      '#b5776b', // 16. Light Brown
      '#e9a5d1', // 17. Light Pink
      '#d4d555', // 18. Light Yellow
      
      // Next 9: Darker variants (still all different colors)
      '#0f4c75', // 19. Dark Blue
      '#1a661a', // 20. Dark Green
      '#cc5500', // 21. Dark Orange
      '#6b4488', // 22. Dark Purple
      '#a01e1f', // 23. Dark Red
      '#0e8a99', // 24. Dark Teal
      '#5d3a32', // 25. Dark Brown
      '#b04d94', // 26. Dark Pink
      '#8a8a0f', // 27. Dark Yellow
      
      // Final 3: Additional unique colors
      '#2f4b7c', // 28. Navy
      '#7f7f7f', // 29. Gray
      '#17a2b8'  // 30. Info Blue
    ],
    
    /**
     * Background colors for radar fills (20% opacity of primary colors)
     */
    backgrounds: [
      // First 9: Base colors backgrounds
      'rgba(31, 119, 180, 0.2)',   // 1. Blue
      'rgba(44, 160, 44, 0.2)',    // 2. Green
      'rgba(255, 127, 14, 0.2)',   // 3. Orange
      'rgba(148, 103, 189, 0.2)',  // 4. Purple
      'rgba(214, 39, 40, 0.2)',    // 5. Red
      'rgba(23, 190, 207, 0.2)',   // 6. Teal
      'rgba(140, 86, 75, 0.2)',    // 7. Brown
      'rgba(227, 119, 194, 0.2)',  // 8. Pink
      'rgba(188, 189, 34, 0.2)',   // 9. Yellow
      
      // Next 9: Light variants backgrounds
      'rgba(91, 163, 212, 0.2)',   // 10. Light Blue
      'rgba(92, 184, 92, 0.2)',    // 11. Light Green
      'rgba(255, 159, 78, 0.2)',   // 12. Light Orange
      'rgba(180, 141, 212, 0.2)',  // 13. Light Purple
      'rgba(229, 87, 88, 0.2)',    // 14. Light Red
      'rgba(76, 206, 224, 0.2)',   // 15. Light Teal
      'rgba(181, 119, 107, 0.2)',  // 16. Light Brown
      'rgba(233, 165, 209, 0.2)',  // 17. Light Pink
      'rgba(212, 213, 85, 0.2)',   // 18. Light Yellow
      
      // Next 9: Dark variants backgrounds
      'rgba(15, 76, 117, 0.2)',    // 19. Dark Blue
      'rgba(26, 102, 26, 0.2)',    // 20. Dark Green
      'rgba(204, 85, 0, 0.2)',     // 21. Dark Orange
      'rgba(107, 68, 136, 0.2)',   // 22. Dark Purple
      'rgba(160, 30, 31, 0.2)',    // 23. Dark Red
      'rgba(14, 138, 153, 0.2)',   // 24. Dark Teal
      'rgba(93, 58, 50, 0.2)',     // 25. Dark Brown
      'rgba(176, 77, 148, 0.2)',   // 26. Dark Pink
      'rgba(138, 138, 15, 0.2)',   // 27. Dark Yellow
      
      // Final 3: Additional unique colors backgrounds
      'rgba(47, 75, 124, 0.2)',    // 28. Navy
      'rgba(127, 127, 127, 0.2)',  // 29. Gray
      'rgba(23, 162, 184, 0.2)'    // 30. Info Blue
    ]
  },

  /**
   * Status indicator colors for assessment completion states
   * WCAG AA compliant for accessibility
   */
  status: {
    /** Green - Assessment 100% completed */
    completed: '#28a745',
    completed_light: '#34ce57',
    completed_dark: '#1e7e34',
    
    /** Blue - Assessment partially completed/in progress */
    inProgress: '#007bff', 
    inProgress_light: '#339dff',
    inProgress_dark: '#0056b3',
    
    /** Yellow - Warning state (low completion rate) */
    warning: '#ffc107',
    warning_light: '#ffcd39',
    warning_dark: '#d39e00',
    
    /** Red - Error/failed state */
    error: '#dc3545',
    error_light: '#e35d6a',
    error_dark: '#b02a37',
    
    /** Gray - Inactive/not started */
    inactive: '#6c757d',
    inactive_light: '#8a9198',
    inactive_dark: '#545b62'
  },

  /**
   * Word cloud colors - 15 vibrant but professional colors
   * Designed for corporate environments with good readability
   */
  wordCloud: [
    '#2E86AB', // Professional Blue
    '#A23B72', // Corporate Magenta  
    '#F18F01', // Business Orange
    '#C73E1D', // Executive Red
    '#59A96A', // Enterprise Green
    '#7209B7', // Strategic Purple
    '#F71735', // Alert Red
    '#FF9F1C', // Attention Orange
    '#2F9599', // Corporate Teal
    '#A4303F', // Business Burgundy
    '#1B998B', // Professional Emerald
    '#84329B', // Executive Violet
    '#C77DFF', // Light Purple
    '#560bad', // Deep Purple
    '#7B2CBF'  // Rich Purple
  ],

  /**
   * Background and neutral colors
   */
  backgrounds: {
    /** Light backgrounds */
    light: '#f8f9fa',
    card: '#ffffff',
    panel: '#fefefe',
    
    /** Dark backgrounds for future dark mode */
    dark: '#343a40',
    card_dark: '#495057',
    panel_dark: '#2d3748',
    
    /** Neutral backgrounds */
    muted: '#e9ecef',
    border: '#dee2e6',
    hover: '#f1f3f4'
  },

  /**
   * Chart and visualization specific colors
   */
  chart: {
    /** Grid and axis colors */
    grid: '#e5e5e5',
    axis: '#666666',
    
    /** Tooltip and hover states */
    tooltip_bg: '#2d3748',
    tooltip_text: '#ffffff',
    
    /** Progress bars and meters */
    progress_bg: '#e9ecef',
    progress_fill: BRAND_COLORS.ludic
  }
} as const;

// ==============================
// Utility Functions
// ==============================

/**
 * Get a radar graph color by index with automatic cycling
 * @param index - The team index (0-based)
 * @returns Hex color string
 */
export const getRadarColor = (index: number): string => {
  return DASHBOARD_COLORS.radar.primary[index % DASHBOARD_COLORS.radar.primary.length];
};

/**
 * Get a radar graph background color by index with custom opacity
 * @param index - The team index (0-based)  
 * @param opacity - Opacity value (0-1), default 0.2
 * @returns RGBA color string
 */
export const getRadarBackground = (index: number, opacity: number = 0.2): string => {
  const baseColor = DASHBOARD_COLORS.radar.primary[index % DASHBOARD_COLORS.radar.primary.length];
  
  // Convert hex to RGB and apply opacity
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get a deterministic color from the word cloud palette based on index
 * @param index - Word index for consistent coloring
 * @returns Hex color string
 */
export const getWordCloudColor = (index: number): string => {
  const colors = DASHBOARD_COLORS.wordCloud;
  return colors[index % colors.length];
};

/**
 * Get status color based on completion percentage
 * @param completionPercentage - Completion percentage (0-100)
 * @returns Status color object with main, light, and dark variants
 */
export const getStatusColor = (completionPercentage: number) => {
  if (completionPercentage >= 100) {
    return {
      main: DASHBOARD_COLORS.status.completed,
      light: DASHBOARD_COLORS.status.completed_light,
      dark: DASHBOARD_COLORS.status.completed_dark
    };
  } else if (completionPercentage > 0) {
    return {
      main: DASHBOARD_COLORS.status.inProgress,
      light: DASHBOARD_COLORS.status.inProgress_light,
      dark: DASHBOARD_COLORS.status.inProgress_dark
    };
  } else if (completionPercentage === 0) {
    return {
      main: DASHBOARD_COLORS.status.inactive,
      light: DASHBOARD_COLORS.status.inactive_light,
      dark: DASHBOARD_COLORS.status.inactive_dark
    };
  } else {
    // Negative or invalid values
    return {
      main: DASHBOARD_COLORS.status.error,
      light: DASHBOARD_COLORS.status.error_light,
      dark: DASHBOARD_COLORS.status.error_dark
    };
  }
};

/**
 * Get Assessment Matrix card color based on completion status
 * @param completedAssessments - Number of completed assessments
 * @param totalEmployees - Total number of employees
 * @returns Color configuration for card styling
 */
export const getMatrixCardColor = (completedAssessments: number, totalEmployees: number) => {
  const completionPercentage = totalEmployees > 0 ? (completedAssessments / totalEmployees) * 100 : 0;
  
  if (completionPercentage >= 100) {
    // Green card - all assessments completed
    return {
      border: DASHBOARD_COLORS.status.completed,
      background: `${DASHBOARD_COLORS.status.completed}10`, // 10% opacity
      badge: DASHBOARD_COLORS.status.completed,
      text: DASHBOARD_COLORS.status.completed_dark
    };
  } else if (completionPercentage >= 50) {
    // Blue card - good progress (50-99%)
    return {
      border: DASHBOARD_COLORS.status.inProgress,
      background: `${DASHBOARD_COLORS.status.inProgress}10`, // 10% opacity
      badge: DASHBOARD_COLORS.status.inProgress,
      text: DASHBOARD_COLORS.status.inProgress_dark
    };
  } else if (completionPercentage > 0) {
    // Warning card - early progress (1-49%)
    return {
      border: DASHBOARD_COLORS.status.warning,
      background: `${DASHBOARD_COLORS.status.warning}10`, // 10% opacity
      badge: DASHBOARD_COLORS.status.warning,
      text: DASHBOARD_COLORS.status.warning_dark
    };
  } else {
    // Should not be displayed, but return inactive colors as fallback
    return {
      border: DASHBOARD_COLORS.status.inactive,
      background: `${DASHBOARD_COLORS.status.inactive}10`, // 10% opacity
      badge: DASHBOARD_COLORS.status.inactive,
      text: DASHBOARD_COLORS.status.inactive_dark
    };
  }
};

/**
 * Get a set of colors for multiple teams on the same chart
 * @param teamCount - Number of teams to display
 * @returns Array of color objects with main and background colors
 */
export const getTeamColorSet = (teamCount: number) => {
  return Array.from({ length: teamCount }, (_, index) => ({
    main: getRadarColor(index),
    background: getRadarBackground(index),
    border: getRadarColor(index)
  }));
};

/**
 * Check if a color meets WCAG AA contrast ratio requirements
 * @param color - Hex color string
 * @param background - Background hex color string (default: white)
 * @returns Boolean indicating if contrast is sufficient
 */
export const meetsContrastRequirement = (color: string, background: string = '#ffffff'): boolean => {
  // Simplified contrast check - in production, use a proper contrast ratio library
  // This is a basic implementation for reference
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  
  const l1 = getLuminance(color);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio >= 4.5; // WCAG AA standard
};

// ==============================
// Type Definitions
// ==============================

export type RadarColorIndex = number;
export type StatusColorType = keyof typeof DASHBOARD_COLORS.status;
export type BackgroundColorType = keyof typeof DASHBOARD_COLORS.backgrounds;

/**
 * Color configuration for team radar displays
 */
export interface TeamColorConfig {
  main: string;
  background: string;
  border: string;
}

/**
 * Status color configuration with variants
 */
export interface StatusColorConfig {
  main: string;
  light: string;
  dark: string;
}

/**
 * Matrix card color configuration
 */
export interface MatrixCardColorConfig {
  border: string;
  background: string;
  badge: string;
  text: string;
}

// Export default for convenience
export default DASHBOARD_COLORS;