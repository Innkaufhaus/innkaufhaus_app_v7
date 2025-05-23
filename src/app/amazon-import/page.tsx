"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null)
  const [han, setHan] = useState("")
  const [supplier, setSupplier] = useState("")
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string }[]>([])
  const [purchasePriceFactor, setPurchasePriceFactor] = useState<number | null>(null)
  const [overridePurchasePrice, setOverridePurchasePrice] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null)
  const [isPurchasePriceFrozen, setIsPurchasePriceFrozen] = useState<boolean>(false)
  const [profitMargin, setProfitMargin] = useState<number | null>(null)
  const [csvPath, setCsvPath] = useState<string | null>(null)
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [showExistsDialog, setShowExistsDialog] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin-settings')
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load settings')
        }

        const dbConfig = {
          host: data.settings.database.host,
          port: parseInt(data.settings.database.port),
          user: data.settings.database.user,
          password: data.settings.database.password,
          database: "JTL" // Default JTL database
        }
        setConnectionDetails(dbConfig)
        
        // Mock supplier options
        const mockSuppliers = [
          "Supplier A",
          "Supplier B",
          "Supplier C"
        ]
        setSupplierOptions(
          mockSuppliers.map(s => ({ 
            value: s, 
            label: s 
          }))
        )
        setMessage({ type: "success", text: "Loaded test settings." })
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

  useEffect(() => {
    if (productPrice && purchasePrice) {
      const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
      const nettoPrice = productPrice / taxMultiplier
      const margin = ((nettoPrice - purchasePrice) / purchasePrice) * 100
      setProfitMargin(margin)

      if (nettoPrice / purchasePrice > 7) {
        setMessage({
          type: "error",
          text: "Warning: Price/Purchase price ratio is above factor 7!"
        })
      }
    } else {
      setProfitMargin(null)
    }
  }, [productPrice, purchasePrice, taxRate])

  const validateEan = (ean: string) => {
    return /^\d{13}$/.test(ean)
  }

  const resetForm = () => {
    setEan("")
    setProductTitle("")
    setProductPrice(null)
    setPurchasePrice(null)
    setHan("")
    setSupplier("")
    setPurchasePriceFactor(null)
    setProfitMargin(null)
    setShowPriceInput(false)
    setOverridePurchasePrice(false)
    setIsPurchasePriceFrozen(false)
    setMessage(null)
  }

  const checkAndFetchProduct = async () => {
    if (!validateEan(ean)) {
      setMessage({ type: "error", text: "Please enter a valid 13-digit EAN." })
      return
    }
    
    if (!connectionDetails) {
      setMessage({ type: "error", text: "No database connection details available." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // First check if EAN exists in database
      const checkResponse = await fetch("/api/check-ean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ean,
          connectionDetails 
        }),
      })
      
      const checkData = await checkResponse.json()
      
      if (!checkData.success) {
        throw new Error(checkData.error || "Failed to check EAN")
      }

      if (checkData.exists) {
        setShowExistsDialog(true)
        setLoading(false)
        return
      }

      // If EAN doesn't exist, proceed with Amazon search
      await fetchProductFromAmazon()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to check EAN in database." })
      setLoading(false)
    }
  }

  const fetchProductFromAmazon = async () => {
    try {
      const response = await fetch("/api/amazon-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ean }),
      })
      const data = await response.json()
      if (!data.success) {
        if (data.error === "No product found") {
          setMessage({
            type: "error",
            text: "Oxylabs API returned no product. Please verify the EAN or try again later.",
          })
        } else {
          setMessage({ type: "error", text: data.error || "Product not found." })
        }
        setLoading(false)
        return
      }

      setProductTitle(data.product.title)
      if (data.product.price === 0) {
        setShowPriceInput(true)
        setMessage({
          type: "success",
          text: "Product found but no price available. Please enter price manually.",
        })
      } else {
        setProductPrice(data.product.price)
        setShowPriceInput(false)
        setMessage({
          type: "success",
          text: "Product info fetched successfully.",
        })
      }
      if (taxRate === "7") {
        setHan(ean)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch product info." })
    } finally {
      setLoading(false)
    }
  }

  const calculatePurchasePriceFactor = async () => {
    if (!supplier) {
      setMessage({ type: "error", text: "Please select a supplier first." })
      return
    }

    try {
      // Mock purchase price calculation
      const mockFactor = 1.5 // Example factor
      setPurchasePriceFactor(mockFactor)
      setOverridePurchasePrice(false)
      
      if (productPrice) {
        const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
        const nettoPrice = productPrice / taxMultiplier
        const calculatedPurchasePrice = parseFloat((nettoPrice / mockFactor * 0.9).toFixed(2))
        setPurchasePrice(calculatedPurchasePrice)
      }
      
      setMessage({ type: "success", text: `Purchase price factor calculated: ${mockFactor}` })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to calculate purchase price factor." })
    }
  }

  const importArticle = async () => {
    if (!productPrice || !purchasePrice) {
      setMessage({ type: "error", text: "Missing required information." })
      return
    }

    try {
      // Mock successful import
      const mockCsvPath = "/imports/mock-import.csv"
      setCsvPath(mockCsvPath)
      setMessage({ 
        type: "success", 
        text: `Article imported successfully! CSV saved at: ${mockCsvPath}` 
      })
      
      // Reset form
      resetForm()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to import article" })
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
          <CardTitle className="flex justify-between items-center">
            <span>Amazon Article Import</span>
            <Button variant="outline" asChild>
              <Link href="/amazon-import/batch">Batch Import</Link>
            </Button>
          </CardTitle>
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
                <Button onClick={checkAndFetchProduct} disabled={loading || !validateEan(ean)}>
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
              <div className="space-y-4 p-4 bg-muted rounded-md">
                <h3 className="font-medium">Product Information</h3>
                <p><strong>Title:</strong> {productTitle}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retail-price">Retail Price (€)</Label>
                    <Input
                      id="retail-price"
                      type="number"
                      step="0.01"
                      value={productPrice?.toString() || ""}
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value) || null
                        setProductPrice(newPrice)
                        if (!isPurchasePriceFrozen && newPrice && supplier) {
                          // Auto-calculate purchase price when retail price changes
                          const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
                          const nettoPrice = newPrice / taxMultiplier
                          const factor = purchasePriceFactor || 1.5 // Default factor if none set
                          const calculatedPurchasePrice = parseFloat((nettoPrice / factor * 0.9).toFixed(2))
                          setPurchasePrice(calculatedPurchasePrice)
                        }
                      }}
                      placeholder="Enter retail price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase-price">
                      Purchase Price (€)
                      {isPurchasePriceFrozen && <span className="ml-2 text-sm text-green-600">(Frozen)</span>}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="purchase-price"
                        type="number"
                        step="0.01"
                        value={purchasePrice?.toString() || ""}
                        onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || null)}
                        placeholder="Enter purchase price"
                        disabled={isPurchasePriceFrozen}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (purchasePrice) {
                            setIsPurchasePriceFrozen(true)
                            setMessage({ type: "success", text: "Purchase Price frozen successfully." })
                          } else {
                            setMessage({
                              type: "error",
                              text: "Please set a valid purchase price before freezing.",
                            })
                          }
                        }}
                        disabled={isPurchasePriceFrozen || !purchasePrice}
                        className="whitespace-nowrap"
                      >
                        {isPurchasePriceFrozen ? "Frozen" : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
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
              <Label>Supplier</Label>
              <Combobox
                options={supplierOptions.filter(option => 
                  option.label.toLowerCase().includes((supplier || "").toLowerCase())
                )}
                value={supplier}
                onValueChange={setSupplier}
                placeholder="Type to search supplier..."
                emptyText="No matching suppliers found"
              />
            </div>

            <div className="space-y-2">
              <Button 
                onClick={calculatePurchasePriceFactor}
                disabled={!supplier || !productPrice || isPurchasePriceFrozen}
                className="w-full"
              >
                Recalculate Purchase Price
              </Button>
            </div>

            {(purchasePriceFactor !== null || purchasePrice !== null) && (
              <div className="p-4 bg-muted rounded-md space-y-2">
                {purchasePriceFactor !== null && !overridePurchasePrice && (
                  <p><strong>Purchase Price Factor:</strong> {purchasePriceFactor.toFixed(2)}</p>
                )}
                {profitMargin !== null && (
                  <div className="flex items-center space-x-2">
                    <strong>Profit Margin:</strong>
                    <span className={`font-medium ${
                      profitMargin < 0 ? 'text-red-500' :
                      profitMargin > 700 ? 'text-red-500' :
                      profitMargin > 100 ? 'text-green-500' :
                      'text-yellow-500'
                    }`}>
                      {profitMargin.toFixed(2)}%
                    </span>
                    {profitMargin > 700 && (
                      <span className="text-red-500 text-sm">
                        (Warning: Very high margin!)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={importArticle}
              disabled={!productTitle || !han || !supplier || !purchasePrice || !productPrice || !isPurchasePriceFrozen}
              className="w-full"
            >
              Import Article
            </Button>

            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {csvPath && (
              <div className="p-4 bg-muted rounded-md">
                <p><strong>CSV File:</strong> {csvPath}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showExistsDialog} onOpenChange={setShowExistsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>EAN Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              This EAN ({ean}) already exists in the database. Would you like to fetch the product information from Amazon anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowExistsDialog(false)
              resetForm()
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowExistsDialog(false)
              fetchProductFromAmazon()
            }}>
              Fetch from Amazon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
