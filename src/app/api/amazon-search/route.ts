import { NextResponse } from 'next/server'
import { cache, CACHE_DURATION } from '@/lib/cache'

interface AmazonSearchResponse {
  results: Array<{
    content: {
      results: {
        organic: Array<{
          title: string
          price?: number
          price_from?: number
          price_upper?: number
        }>
      }
    }
  }>
}

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { ean } = await req.json()
    
    // Check cache first
    const cached = cache.get(ean)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached data for EAN:', ean)
      return NextResponse.json(cached.data)
    }

    const username = "innkaufhaus"
    const password = "XNA0qcjdjwxqx#yeg"
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    
    const response = await fetch("https://realtime.oxylabs.io/v1/queries", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        source: "amazon_search",
        domain: "de",
        query: ean,
        start_page: 1,
        pages: 1,
        parse: true
      })
    })

    const data: AmazonSearchResponse = await response.json()
    console.log('Amazon API Response:', JSON.stringify(data, null, 2))
    
    if (!data.results?.[0]?.content?.results?.organic?.[0]) {
      const errorResponse = {
        success: false,
        error: 'No product found'
      }
      // Cache negative results too to avoid repeated lookups
      cache.set(ean, { data: errorResponse, timestamp: Date.now() })
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const product = data.results[0].content.results.organic[0]
    const price = product.price || product.price_from || product.price_upper

    if (!price) {
      console.error('No price found in product data:', product)
      const errorResponse = {
        success: false,
        error: 'No price found for product'
      }
      cache.set(ean, { data: errorResponse, timestamp: Date.now() })
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const successResponse = {
      success: true,
      product: {
        title: product.title,
        price: price
      }
    }

    // Cache successful results
    cache.set(ean, { data: successResponse, timestamp: Date.now() })

    return NextResponse.json(successResponse)
  } catch (error) {
    console.error('Amazon search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product details from Amazon'
    }, { status: 500 })
  }
}
