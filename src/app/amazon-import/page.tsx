"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"

interface ConnectionDetails {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export default function AmazonImportPage() {
  const router = useRouter()
  const [ean, setEan] = useState("")
  const [taxRate, setTaxRate] = useState("19")
  const [productTitle, setProductTitle] = useState("")
  const [productPrice, setProductPrice] = useState<number | null>(null)
  const [han, setHan] = useState("")
  const [supplier, setSupplier] = useState("")
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([])
  const [purchasePriceFactor, setPurchasePriceFactor] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null)

  // Load connection details from admin settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin-settings')
        const data = await response.json()
        if (data.success && data.settings?.database) {
          setConnectionDetails({
            host: data.settings.database.host,
            port: parseInt(data.settings.database.port),
            user: data.settings.database.user,
            password: data.settings.database.password,
            database: 'eazybusiness' // Default database
          })
        }
      } catch (error) {
        console.error('Failed to load connection settings:', error)
        setMessage({
          type: "error",
          text: "Failed to load database connection settings. Please configure them in Admin Settings."
        })
      }
    }
    loadSettings()
  }, [])

  const validateEan = (ean: string) => {
    return /^\d{13}$/.test(ean)
  }

  const fetchProductInfo = async () => {
    if (!validateEan(ean)) {
      setMessage({ type: "error", text: "Please enter a valid 13-digit EAN." })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch("/api/amazon-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ean }),
      })
      const data = await response.json()
      if (data.success) {
        setProductTitle(data.product.title)
        setProductPrice(data.product.price)
        setMessage({ type: "success", text: "Product info fetched successfully." })
        // For books, set HAN to EAN
        if (taxRate === "7") {
          setHan(ean)
        }
      } else {
        setMessage({ type: "error", text: data.error || "Product not found." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch product info." })
    } finally {
      setLoading(false)
    }
  }

  const searchSuppliers = async (searchTerm: string) => {
    if (!connectionDetails) return

    try {
      const response = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          supplier: searchTerm,
          connectionDetails
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSupplierSuggestions(data.suppliers)
      }
    } catch (error) {
      console.error('Failed to search suppliers:', error)
    }
  }

  const calculatePurchasePriceFactor = async () => {
    if (!connectionDetails || !supplier) {
      setMessage({ type: "error", text: "Please select a supplier first." })
      return
    }

    try {
      const response = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getPurchaseFactor",
          supplier,
          connectionDetails
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPurchasePriceFactor(data.factor)
        setMessage({ type: "success", text: `Purchase price factor calculated: ${data.factor}` })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to calculate factor." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to calculate purchase price factor." })
    }
  }

  const importArticle = async () => {
    if (!connectionDetails || !productPrice || !purchasePriceFactor) {
      setMessage({ type: "error", text: "Missing required information." })
      return
    }

    const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
    const nettoPrice = productPrice / taxMultiplier
    const purchasePrice = nettoPrice / purchasePriceFactor * 0.9

    try {
      const response = await fetch("/api/article-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ean,
          title: productTitle,
          han,
          bruttoPrice: productPrice,
          nettoPrice,
          supplier,
          taxRate,
          connectionDetails
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: "success", text: "Article imported successfully!" })
        // Reset form
        setEan("")
        setProductTitle("")
        setProductPrice(null)
        setHan("")
        setSupplier("")
        setPurchasePriceFactor(null)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to import article." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to import article." })
    }
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
    <main className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Amazon Article Import</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ean">EAN (13 digits)</Label>
              <div className="flex space-x-2">
                <Input
                  id="ean"
                  value={ean}
                  onChange={(e) => setEan(e.target.value)}
                  maxLength={13}
                  placeholder="Enter 13-digit EAN"
                  className="flex-1"
                />
                <Button onClick={fetchProductInfo} disabled={loading || !validateEan(ean)}>
                  {loading ? "Fetching..." : "Fetch Info"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate</Label>
              <RadioGroup
                value={taxRate}
                onValueChange={setTaxRate}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="19" id="tax-19" />
                  <Label htmlFor="tax-19">19%</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7" id="tax-7" />
                  <Label htmlFor="tax-7">7%</Label>
                </div>
              </RadioGroup>
            </div>

            {productTitle && (
              <div className="space-y-2 p-4 bg-muted rounded-md">
                <h3 className="font-medium">Product Information</h3>
                <p><strong>Title:</strong> {productTitle}</p>
                <p><strong>Price:</strong> {productPrice?.toFixed(2)} €</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="han">Manufacturer Article Number (HAN)</Label>
              <Input
                id="han"
                value={han}
                onChange={(e) => setHan(e.target.value)}
                placeholder="Enter manufacturer article number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value)
                  searchSuppliers(e.target.value)
                }}
                placeholder="Search supplier"
                list="supplier-suggestions"
              />
              <datalist id="supplier-suggestions">
                {supplierSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <Button 
              onClick={calculatePurchasePriceFactor}
              disabled={!supplier}
            >
              Calculate Purchase Price Factor
            </Button>

            {purchasePriceFactor !== null && (
              <div className="p-4 bg-muted rounded-md">
                <p><strong>Purchase Price Factor:</strong> {purchasePriceFactor.toFixed(2)}</p>
              </div>
            )}

            <Button
              onClick={importArticle}
              disabled={!productTitle || !han || !supplier || purchasePriceFactor === null}
              className="w-full"
            >
              Import Article
            </Button>

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
