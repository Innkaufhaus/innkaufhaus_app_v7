"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface Product {
  ean: string
  title: string
  price: number
  purchasePrice: number
  taxRate: "19" | "7"
  supplier: string
  han: string
}

interface ConnectionDetails {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export default function BatchImportPage() {
  const router = useRouter()
  const [eans, setEans] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null)
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin-settings')
        const data = await response.json()
        if (data.success && data.settings?.database) {
          const dbConfig = {
            host: data.settings.database.host,
            port: parseInt(data.settings.database.port),
            user: data.settings.database.user,
            password: data.settings.database.password,
            database: 'eazybusiness'
          }
          setConnectionDetails(dbConfig)
          
          const supplierResponse = await fetch("/api/supplier", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              connectionDetails: dbConfig
            }),
          })
          const supplierData = await supplierResponse.json()
          if (supplierData.success) {
            setSupplierOptions(supplierData.suppliers)
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        setMessage({
          type: "error",
          text: "Failed to load database settings. Please check Admin Settings."
        })
      }
    }
    loadSettings()
  }, [])

  const calculatePurchasePrice = (retailPrice: number, taxRate: "19" | "7", factor: number = 1.5) => {
    const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
    const nettoPrice = retailPrice / taxMultiplier
    return parseFloat((nettoPrice / factor * 0.9).toFixed(2))
  }

  const fetchProducts = async () => {
    const eanList = eans.split("\n").map(e => e.trim()).filter(e => e)
    if (!eanList.length) {
      setMessage({ type: "error", text: "Please enter at least one EAN." })
      return
    }

    setLoading(true)
    setMessage(null)
    const newProducts: Product[] = []

    for (const ean of eanList) {
      try {
        const response = await fetch("/api/amazon-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ean }),
        })
        const data = await response.json()
        if (data.success) {
          const price = data.product.price
          newProducts.push({
            ean,
            title: data.product.title,
            price,
            purchasePrice: calculatePurchasePrice(price, "19"),
            taxRate: "19",
            supplier: "",
            han: ean
          })
        }
      } catch (error) {
        console.error(`Failed to fetch product ${ean}:`, error)
      }
    }

    setProducts(newProducts)
    setLoading(false)
    if (newProducts.length) {
      setMessage({ type: "success", text: `Found ${newProducts.length} products.` })
    } else {
      setMessage({ type: "error", text: "No products found." })
    }
  }

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }

    // Recalculate purchase price when retail price or tax rate changes
    if ((field === "price" || field === "taxRate") && typeof value !== "object") {
      const product = updatedProducts[index]
      updatedProducts[index].purchasePrice = calculatePurchasePrice(
        product.price,
        product.taxRate as "19" | "7"
      )
    }

    setProducts(updatedProducts)
  }

  const importProducts = async () => {
    if (!connectionDetails) {
      setMessage({ type: "error", text: "Database connection not configured." })
      return
    }

    setLoading(true)
    setMessage(null)
    const results = []

    for (const product of products) {
      try {
        const taxMultiplier = product.taxRate === "19" ? 1.19 : 1.07
        const nettoPrice = product.price / taxMultiplier

        const response = await fetch("/api/save-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ean: product.ean,
            title: product.title,
            han: product.han,
            bruttoPrice: product.price,
            nettoPrice,
            purchasePrice: product.purchasePrice,
            supplier: supplierOptions.find(s => s.value === product.supplier)?.label || '',
            taxRate: product.taxRate,
            connectionDetails
          }),
        })
        const data = await response.json()
        results.push({ ean: product.ean, success: data.success })
      } catch (error) {
        results.push({ ean: product.ean, success: false })
      }
    }

    setLoading(false)
    const successCount = results.filter(r => r.success).length
    setMessage({
      type: successCount ? "success" : "error",
      text: `Imported ${successCount} of ${products.length} products.`
    })
  }

  if (!connectionDetails) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>
            Please configure database connection settings in{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/admin")}
            >
              Admin Settings
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Batch Article Import</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eans">EAN Numbers (one per line)</Label>
              <Textarea
                id="eans"
                value={eans}
                onChange={(e) => setEans(e.target.value)}
                placeholder="Enter EAN numbers, one per line"
                className="font-mono min-h-[120px]"
              />
            </div>

            <Button onClick={fetchProducts} disabled={loading}>
              {loading ? "Fetching..." : "Fetch Products"}
            </Button>

            {products.length > 0 && (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>EAN</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Price (€)</TableHead>
                        <TableHead>Purchase Price (€)</TableHead>
                        <TableHead>Tax Rate</TableHead>
                        <TableHead>HAN</TableHead>
                        <TableHead>Supplier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => (
                        <TableRow key={product.ean}>
                          <TableCell>{product.ean}</TableCell>
                          <TableCell>
                            <Input
                              value={product.title}
                              onChange={(e) => updateProduct(index, "title", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={product.price}
                              onChange={(e) => updateProduct(index, "price", parseFloat(e.target.value))}
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={product.purchasePrice}
                              onChange={(e) => updateProduct(index, "purchasePrice", parseFloat(e.target.value))}
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={product.taxRate}
                              onValueChange={(value) => updateProduct(index, "taxRate", value as "19" | "7")}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="Tax Rate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="19">19%</SelectItem>
                                <SelectItem value="7">7%</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.han}
                              onChange={(e) => updateProduct(index, "han", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Combobox
                              options={supplierOptions}
                              value={product.supplier}
                              onValueChange={(value) => updateProduct(index, "supplier", value)}
                              placeholder="Select supplier"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  onClick={importProducts}
                  disabled={loading || !products.every(p => p.supplier)}
                  className="w-full"
                >
                  {loading ? "Importing..." : "Import All Products"}
                </Button>
              </div>
            )}

            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
