import { H3Event } from 'h3'
import { extractUrlFromRequest, isValidUrl, fetchMetadata } from '../utils/extractUrlFromRequest'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Add CORS handling for OPTIONS requests
    if (event.method === 'OPTIONS') {
      setResponseHeaders(event, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      })
      return null
    }

    // Extract URL from request
    const url = await extractUrlFromRequest(event)
    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'URL is required.'
      })
    }

    if (!isValidUrl(url)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid URL format.'
      })
    }

    // Fetch metadata with timeout
    const metadata = await Promise.race([
      fetchMetadata(url),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ])

    return metadata

  } catch (error: any) {
    console.error('Error processing request:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Error processing request'
    })
  }
})

