/**
 * Report Builder Types
 *
 * Type definitions for report generation system
 */

/**
 * Base report parameters
 */
export interface BaseReportParams {
  dateRangeText?: string
  generatedAt?: Date
}

/**
 * Report output format
 */
export type ReportFormat = 'html' | 'csv' | 'pdf'

/**
 * Report metadata
 */
export interface ReportMetadata {
  title: string
  description?: string
  generatedAt: Date
  totalRecords: number
}

/**
 * Report builder function signature
 */
export type ReportBuilder<T> = (params: T) => string
