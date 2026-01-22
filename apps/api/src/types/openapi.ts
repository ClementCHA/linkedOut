/** Minimal OpenAPI 3.0 type for our spec */
export interface OpenAPIV3 {
  openapi: string
  info: { title: string; description: string; version: string }
  servers?: Array<{ url: string; description?: string }>
  paths: Record<string, Record<string, unknown>>
  components?: { schemas?: Record<string, unknown> }
}
