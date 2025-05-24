"use client"

// ... (keep all imports)

export default function AmazonImportPage() {
  // ... (keep all state variables)

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
          database: "eazybusiness"
        }
        setConnectionDetails(dbConfig)
        
        await loadSuppliers(dbConfig)
        
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

  const loadSuppliers = async (dbConfig: ConnectionDetails) => {
    try {
      const response = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionDetails: dbConfig })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch suppliers")
      }

      console.log('Loaded suppliers:', data.suppliers)
      setAllSuppliers(data.suppliers)
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to fetch suppliers"
      })
    }
  }

  const calculatePurchasePrice = (retailPrice: number, taxRate: string, factor: number = 1.5) => {
    const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
    const nettoPrice = retailPrice / taxMultiplier
    const calculatedPurchasePrice = parseFloat((nettoPrice / factor * 0.9).toFixed(2))
    
    const margin = ((nettoPrice - calculatedPurchasePrice) / calculatedPurchasePrice * 100)
    setProfitMargin(parseFloat(margin.toFixed(2)))
    
    return calculatedPurchasePrice
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

  const validateEan = (ean: string) => {
    return /^\d{13}$/.test(ean)
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
        const price = data.product.price
        setProductPrice(price)
        setShowPriceInput(false)

        // Automatically calculate purchase price
        const defaultFactor = 1.5
        setPurchasePriceFactor(defaultFactor)
        const calculatedPurchasePrice = calculatePurchasePrice(price, taxRate, defaultFactor)
        setPurchasePrice(calculatedPurchasePrice)
        
        setMessage({
          type: "success",
          text: "Product info fetched and purchase price calculated.",
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

      await fetchProductFromAmazon()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to check EAN in database." })
      setLoading(false)
    }
  }

  const calculatePurchasePriceFactor = async () => {
    if (!supplier) {
      setMessage({ type: "error", text: "Please select a supplier first." })
      return
    }

    try {
      const mockFactor = 1.5
      setPurchasePriceFactor(mockFactor)
      setOverridePurchasePrice(false)
      
      if (productPrice) {
        const calculatedPurchasePrice = calculatePurchasePrice(productPrice, taxRate, mockFactor)
        setPurchasePrice(calculatedPurchasePrice)
      }
      
      setMessage({ type: "success", text: `Purchase price factor calculated: ${mockFactor}` })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to calculate purchase price factor." })
    }
  }

  const handleRetailPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value) || null
    setProductPrice(newPrice)
    
    if (!isPurchasePriceFrozen && newPrice) {
      const factor = purchasePriceFactor || 1.5
      const calculatedPurchasePrice = calculatePurchasePrice(newPrice, taxRate, factor)
      setPurchasePrice(calculatedPurchasePrice)
    }
  }

  const importArticle = async () => {
    if (!productPrice || !purchasePrice || !connectionDetails) {
      setMessage({ type: "error", text: "Missing required information." })
      return
    }

    try {
      const taxMultiplier = taxRate === "19" ? 1.19 : 1.07
      const nettoPrice = productPrice / taxMultiplier

      const importData = {
        ean,
        title: productTitle,
        han,
        bruttoPrice: productPrice,
        nettoPrice,
        purchasePrice,
        supplier: allSuppliers.find(s => s.value === supplier)?.label || '',
        taxRate: taxRate as "7" | "19",
        connectionDetails
      }

      const response = await fetch("/api/save-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importData)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to import article")
      }

      setCsvPath(data.csvPath)
      setMessage({ 
        type: "success", 
        text: `Article imported successfully! CSV saved at: ${data.csvPath}` 
      })
      
      resetForm()
    } catch (error) {
      console.error('Import error:', error)
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to import article" 
      })
    }
  }

  const clearCache = async () => {
    try {
      setClearingCache(true)
      const response = await fetch("/api/clear-cache", {
        method: "POST"
      })
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to clear cache")
      }

      setMessage({
        type: "success",
        text: "Cache cleared successfully"
      })
    } catch (error) {
      console.error('Failed to clear cache:', error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to clear cache"
      })
    } finally {
      setClearingCache(false)
    }
  }

  const handleTitleEdit = () => {
    setEditedTitle(productTitle)
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      setProductTitle(editedTitle.trim())
      setMessage({
        type: "success",
        text: "Product title updated successfully."
      })
    }
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setEditedTitle(productTitle)
    setIsEditingTitle(false)
  }

  // ... (keep the rest of the JSX)
}
