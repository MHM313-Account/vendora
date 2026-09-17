import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ComparisonSearchView from './components/ComparisonSearchView';
import AnalyticsView from './components/AnalyticsView';
import AutomationView from './components/AutomationView';
import VendorsView from './components/VendorsView';
import ProductsView from './components/ProductsView';
import PurchasesView from './components/PurchasesView';
import ReplacementsView from './components/ReplacementsView';
import IssuesView from './components/IssuesView';
import EvidenceVaultView from './components/EvidenceVaultView';
import CustomerSalesView from './components/CustomerSalesView';
import InventoryVaultView from './components/InventoryVaultView';

import VendorDetailModal from './components/VendorDetailModal';
import AddVendorModal from './components/AddVendorModal';
import AddProductModal from './components/AddProductModal';
import AddOfferModal from './components/AddOfferModal';
import AddPurchaseModal from './components/AddPurchaseModal';
import AddReplacementModal from './components/AddReplacementModal';
import AddIssueModal from './components/AddIssueModal';
import AddEvidenceModal from './components/AddEvidenceModal';
import ImportExportModal from './components/ImportExportModal';
import PriceAlertsModal from './components/PriceAlertsModal';
import SmartParserModal from './components/SmartParserModal';
import SettingsModal from './components/SettingsModal';
import PriceListGeneratorModal from './components/PriceListGeneratorModal';
import AddSaleModal from './components/AddSaleModal';
import WarrantyClaimModal from './components/WarrantyClaimModal';
import ReplacementChainModal from './components/ReplacementChainModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [issues, setIssues] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [globalSearch, setGlobalSearch] = useState('');
  const [comparisonQuery, setComparisonQuery] = useState('CapCut');

  // Modals state
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendorDetailId, setSelectedVendorDetailId] = useState(null);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [offerPreselectedVendor, setOfferPreselectedVendor] = useState(null);
  const [offerPreselectedProduct, setOfferPreselectedProduct] = useState(null);

  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [purchasePreselectedData, setPurchasePreselectedData] = useState(null);

  const [isAddReplacementOpen, setIsAddReplacementOpen] = useState(false);
  const [replacementPreselectedPurchaseId, setReplacementPreselectedPurchaseId] = useState(null);

  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [issuePreselectedVendorId, setIssuePreselectedVendorId] = useState(null);

  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [evidencePreselectedVendorId, setEvidencePreselectedVendorId] = useState(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isPriceAlertsOpen, setIsPriceAlertsOpen] = useState(false);
  const [isSmartParserOpen, setIsSmartParserOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPriceListOpen, setIsPriceListOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [selectedClaimSaleId, setSelectedClaimSaleId] = useState(null);
  const [selectedChainSaleId, setSelectedChainSaleId] = useState(null);

  // Load all data
  const loadData = async () => {
    try {
      const [dashRes, venRes, prodRes, purRes, repRes, issRes, eviRes, custRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/vendors'),
        fetch('/api/products'),
        fetch('/api/purchases'),
        fetch('/api/replacements'),
        fetch('/api/issues'),
        fetch('/api/evidence'),
        fetch('/api/customers')
      ]);

      const [dash, ven, prod, pur, rep, iss, evi, cust] = await Promise.all([
        dashRes.json(),
        venRes.json(),
        prodRes.json(),
        purRes.json(),
        repRes.json(),
        issRes.json(),
        eviRes.json(),
        custRes.json()
      ]);

      setDashboardData(dash);
      setVendors(ven);
      setProducts(prod);
      setPurchases(pur);
      setReplacements(rep);
      setIssues(iss);
      setEvidenceList(evi);
      setCustomers(cust);
    } catch (err) {
      console.error('Error fetching data from local server:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Global search trigger
  const handleSearchSubmit = () => {
    if (globalSearch.trim()) {
      setComparisonQuery(globalSearch.trim());
      setCurrentTab('comparison');
    }
  };

  // Direct product compare click
  const handleSelectProductCompare = (prodName) => {
    setComparisonQuery(prodName);
    setCurrentTab('comparison');
  };

  // Open Add Offer Modal
  const handleOpenAddOffer = (vendorId = null, productId = null) => {
    setOfferPreselectedVendor(vendorId);
    setOfferPreselectedProduct(productId);
    setIsAddOfferOpen(true);
  };

  // Open Log Purchase Modal
  const handleOpenAddPurchase = (vendorId = null, productId = null, offerId = null, price = null) => {
    if (vendorId) {
      setPurchasePreselectedData({ vendor_id: vendorId, product_id: productId, offer_id: offerId, price });
    } else {
      setPurchasePreselectedData(null);
    }
    setIsAddPurchaseOpen(true);
  };

  // Open Add Replacement Modal
  const handleOpenAddReplacement = (purchaseId = null) => {
    setReplacementPreselectedPurchaseId(purchaseId);
    setIsAddReplacementOpen(true);
  };

  // Open Add Issue Modal
  const handleOpenAddIssue = (vendorId = null) => {
    setIssuePreselectedVendorId(vendorId);
    setIsAddIssueOpen(true);
  };

  // Open Add Evidence Modal
  const handleOpenAddEvidence = (vendorId = null) => {
    setEvidencePreselectedVendorId(vendorId);
    setIsAddEvidenceOpen(true);
  };

  // From comparison table click
  const handleLogPurchaseFromOffer = (offer) => {
    setPurchasePreselectedData({
      vendor_id: offer.vendor_id,
      product_id: offer.product_id,
      offer_id: offer.id,
      price: offer.price
    });
    setIsAddPurchaseOpen(true);
  };

  // Update Replacement Status
  const handleUpdateReplacementStatus = async (id, status, notes) => {
    try {
      await fetch(`/api/replacements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Deletion Handlers
  const handleDeleteVendor = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس وینڈر کو ڈیلیٹ کرنا چاہتے ہیں؟ اس کے تمام ریٹس، شکایات اور ثبوت بھی ڈیلیٹ ہو جائیں گے۔')) return;
    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('کیا آپ واقعی اس پراڈکٹ کو ڈیلیٹ کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePurchase = async (id) => {
    if (!window.confirm('کیا آپ خریداری کا یہ ریکارڈ حذف کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReplacement = async (id) => {
    if (!window.confirm('کیا آپ یہ ریپلیسمنٹ کلیم حذف کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/replacements/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm('کیا آپ یہ شکایت حذف کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvidence = async (id) => {
    if (!window.confirm('کیا آپ یہ ثبوت حذف کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/evidence/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPriceList={() => setIsPriceListOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header 
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onSearchSubmit={handleSearchSubmit}
          onOpenAddVendor={() => {
            setEditingVendor(null);
            setIsAddVendorOpen(true);
          }}
          onOpenAddPurchase={() => handleOpenAddPurchase()}
          onOpenAddProduct={() => setIsAddProductOpen(true)}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          onOpenPriceAlerts={() => setIsPriceAlertsOpen(true)}
          onOpenSmartParser={() => setIsSmartParserOpen(true)}
          onOpenPriceList={() => setIsPriceListOpen(true)}
          activeAlertsCount={dashboardData?.stats?.activePriceAlertsCount || 0}
        />

        {/* Dynamic Views */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <DashboardView 
                dashboardData={dashboardData}
                onSelectProductCompare={handleSelectProductCompare}
                setCurrentTab={setCurrentTab}
                onOpenVendorDetail={(id) => setSelectedVendorDetailId(id)}
                onOpenAddVendor={() => setIsAddVendorOpen(true)}
                onOpenAddPurchase={() => handleOpenAddPurchase()}
                onOpenSmartParser={() => setIsSmartParserOpen(true)}
                onOpenPriceList={() => setIsPriceListOpen(true)}
              />
            )}

            {currentTab === 'comparison' && (
              <ComparisonSearchView 
                searchQuery={comparisonQuery}
                setSearchQuery={setComparisonQuery}
                onOpenVendorDetail={(id) => setSelectedVendorDetailId(id)}
                onLogPurchaseFromOffer={handleLogPurchaseFromOffer}
              />
            )}

            {currentTab === 'sales' && (
              <CustomerSalesView 
                onOpenAddSale={() => setIsAddSaleOpen(true)}
                onOpenPriceList={() => setIsPriceListOpen(true)}
                onOpenClaimModal={(saleId) => setSelectedClaimSaleId(saleId)}
                onOpenChainModal={(saleId) => setSelectedChainSaleId(saleId)}
              />
            )}

            {currentTab === 'vault' && (
              <InventoryVaultView 
                products={products}
                vendors={vendors}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView 
                onOpenVendorDetail={(id) => setSelectedVendorDetailId(id)}
              />
            )}

            {currentTab === 'automation' && (
              <AutomationView 
                onDataUpdated={loadData}
              />
            )}

            {currentTab === 'vendors' && (
              <VendorsView 
                vendors={vendors}
                onOpenAddVendor={() => {
                  setEditingVendor(null);
                  setIsAddVendorOpen(true);
                }}
                onEditVendor={(v) => {
                  setEditingVendor(v);
                  setIsAddVendorOpen(true);
                }}
                onDeleteVendor={handleDeleteVendor}
                onOpenVendorDetail={(id) => setSelectedVendorDetailId(id)}
                onOpenAddOffer={handleOpenAddOffer}
              />
            )}

            {currentTab === 'products' && (
              <ProductsView 
                products={products}
                onSelectProductCompare={handleSelectProductCompare}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onOpenAddOffer={handleOpenAddOffer}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentTab === 'purchases' && (
              <PurchasesView 
                purchases={purchases}
                onOpenAddPurchase={() => handleOpenAddPurchase()}
                onOpenAddReplacement={handleOpenAddReplacement}
                onDeletePurchase={handleDeletePurchase}
              />
            )}

            {currentTab === 'replacements' && (
              <ReplacementsView 
                replacements={replacements}
                onOpenAddReplacement={() => handleOpenAddReplacement()}
                onUpdateReplacementStatus={handleUpdateReplacementStatus}
                onDeleteReplacement={handleDeleteReplacement}
              />
            )}

            {currentTab === 'issues' && (
              <IssuesView 
                issues={issues}
                onOpenAddIssue={() => handleOpenAddIssue()}
                onDeleteIssue={handleDeleteIssue}
              />
            )}

            {currentTab === 'evidence' && (
              <EvidenceVaultView 
                evidenceList={evidenceList}
                onOpenAddEvidence={() => handleOpenAddEvidence()}
                onDeleteEvidence={handleDeleteEvidence}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Add / Edit Vendor Modal */}
      <AddVendorModal 
        isOpen={isAddVendorOpen}
        initialData={editingVendor}
        onClose={() => {
          setIsAddVendorOpen(false);
          setEditingVendor(null);
        }}
        onVendorSaved={loadData}
        products={products}
      />

      {/* 2. Vendor Detail Modal */}
      <VendorDetailModal 
        vendorId={selectedVendorDetailId}
        onClose={() => setSelectedVendorDetailId(null)}
        onOpenAddOffer={(vId) => handleOpenAddOffer(vId)}
        onOpenAddPurchase={(vId, pId, oId, price) => handleOpenAddPurchase(vId, pId, oId, price)}
        onOpenAddIssue={(vId) => handleOpenAddIssue(vId)}
        onOpenAddEvidence={(vId) => handleOpenAddEvidence(vId)}
      />

      {/* 3. Add Product Modal */}
      <AddProductModal 
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductSaved={loadData}
        vendors={vendors}
      />

      {/* 4. Add Offer Modal */}
      <AddOfferModal 
        isOpen={isAddOfferOpen}
        onClose={() => setIsAddOfferOpen(false)}
        onOfferSaved={loadData}
        vendors={vendors}
        products={products}
        preselectedVendorId={offerPreselectedVendor}
        preselectedProductId={offerPreselectedProduct}
      />

      {/* 5. Add Purchase Modal */}
      <AddPurchaseModal 
        isOpen={isAddPurchaseOpen}
        onClose={() => setIsAddPurchaseOpen(false)}
        onPurchaseSaved={loadData}
        vendors={vendors}
        products={products}
        preselectedData={purchasePreselectedData}
      />

      {/* 6. Add Replacement Modal */}
      <AddReplacementModal 
        isOpen={isAddReplacementOpen}
        onClose={() => setIsAddReplacementOpen(false)}
        onReplacementSaved={loadData}
        purchases={purchases}
        preselectedPurchaseId={replacementPreselectedPurchaseId}
      />

      {/* 7. Add Issue Modal */}
      <AddIssueModal 
        isOpen={isAddIssueOpen}
        onClose={() => setIsAddIssueOpen(false)}
        onIssueSaved={loadData}
        vendors={vendors}
        products={products}
        preselectedVendorId={issuePreselectedVendorId}
      />

      {/* 8. Add Evidence Modal */}
      <AddEvidenceModal 
        isOpen={isAddEvidenceOpen}
        onClose={() => setIsAddEvidenceOpen(false)}
        onEvidenceSaved={loadData}
        vendors={vendors}
        preselectedVendorId={evidencePreselectedVendorId}
      />

      {/* 9. Import / Export CSV Modal */}
      <ImportExportModal 
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportSuccess={loadData}
      />

      {/* 10. Price Alerts Modal */}
      <PriceAlertsModal 
        isOpen={isPriceAlertsOpen}
        onClose={() => setIsPriceAlertsOpen(false)}
        products={products}
        onOpenVendorDetail={(id) => setSelectedVendorDetailId(id)}
      />

      {/* 11. Smart Text Parser Modal */}
      <SmartParserModal 
        isOpen={isSmartParserOpen}
        onClose={() => setIsSmartParserOpen(false)}
        onOfferSaved={loadData}
        vendors={vendors}
        products={products}
      />

      {/* 12. Settings & Backup Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 13. Price List Generator Modal */}
      <PriceListGeneratorModal 
        isOpen={isPriceListOpen}
        onClose={() => setIsPriceListOpen(false)}
      />

      {/* 14. Add Customer Sale Modal */}
      <AddSaleModal 
        isOpen={isAddSaleOpen}
        onClose={() => setIsAddSaleOpen(false)}
        onSaleSaved={loadData}
        products={products}
        vendors={vendors}
        customers={customers}
      />

      {/* 15. Warranty Claim Modal */}
      <WarrantyClaimModal 
        saleId={selectedClaimSaleId}
        onClose={() => setSelectedClaimSaleId(null)}
        onStatusUpdated={loadData}
      />

      {/* 16. Replacement Chain Modal */}
      <ReplacementChainModal 
        saleId={selectedChainSaleId}
        isOpen={Boolean(selectedChainSaleId)}
        onClose={() => setSelectedChainSaleId(null)}
        onOpenClaimModal={(saleId) => setSelectedClaimSaleId(saleId)}
      />
    </div>
  );
}
