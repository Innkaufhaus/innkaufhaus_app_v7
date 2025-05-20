import { NextResponse } from 'next/server'

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

export async function POST(req: Request) {
  try {
    const { ean } = await req.json()
    
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
        pages: 2,
        parse: true
      })
    })

    const data: AmazonSearchResponse = await response.json()
    console.log('Amazon API Response:', JSON.stringify(data, null, 2))
    
    if (!data.results?.[0]?.content?.results?.organic?.[0]) {
      return NextResponse.json({
        success: false,
        error: 'No product found'
      }, { status: 404 })
    }

    const product = data.results[0].content.results.organic[0]
    const price = product.price || product.price_from || product.price_upper

    if (!price) {
      console.error('No price found in product data:', product)
      return NextResponse.json({
        success: false,
        error: 'No price found for product'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: {
        title: product.title,
        price: price
      }
    })
  } catch (error) {
    console.error('Amazon search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product details from Amazon'
    }, { status: 500 })
  }
}
