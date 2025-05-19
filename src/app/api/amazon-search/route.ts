import { NextResponse } from 'next/server'

interface AmazonSearchResponse {
  results?: {
    content?: {
      results?: {
        organic?: {
          title?: string
          price?: number
        }
      }
    }
  }
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
    
    if (!data.results?.content?.results?.organic) {
      return NextResponse.json({
        success: false,
        error: 'No product found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: {
        title: data.results.content.results.organic.title,
        price: data.results.content.results.organic.price
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
