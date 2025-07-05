/* ------------------------------------------------------------------
 *  src/pages/admin/AdminReports.tsx
 * ----------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { useNavigate }          from 'react-router-dom';
import { Layout }               from '../../components/layout/Layout';
import { Card }                 from '../../components/ui/Card';
import { Button }               from '../../components/ui/Button';
import { Table }                from '../../components/ui/Table';
import { useToast }             from '../../components/ui/Toast';
import type { LucideIcon } from 'lucide-react';

import {
  Home, Gavel, Package, Settings, BarChart3, Download,
  TrendingUp, DollarSign, Clock, RefreshCw,
} from 'lucide-react';

import {
  auctionService,
  Auction,             // <- exported in your service
  Product,
  Bid,
} from '../../services/auctionService';

/* ------------------------------------------------------------------
 *  Sidebar items
 * ----------------------------------------------------------------- */
const adminSidebar = [
  { path: '/admin/dashboard', label: 'Dashboard',       icon: <Home  className="h-5 w-5" /> },
  { path: '/admin/auctions',  label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products',  label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  { path: '/admin/reports',   label: 'Reports',         icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/settings',  label: 'Settings',        icon: <Settings className="h-5 w-5" /> },
];

/* ------------------------------------------------------------------
 *  Local interfaces for table rows
 * ----------------------------------------------------------------- */
interface AuctionReport {
  id: string;
  name: string;
  valid_until: string;
  productCount: number;
  bidCount: number;
  revenue: number;
}

interface ProductReport {
  id: string;
  name: string;
  description?: string;
  status?: string;
  bidCount: number;
  highestBid: number;
}

/* ------------------------------------------------------------------
 *  AdminReports page
 * ----------------------------------------------------------------- */
export const AdminReports: React.FC = () => {
  /* ---------------- state ---------------- */
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'auctions' | 'products'>('auctions');

  const [auctionRows, setAuctionRows]   = useState<AuctionReport[]>([]);
  const [productRows, setProductRows]   = useState<ProductReport[]>([]);

  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  /* ---------------- load data ---------------- */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      /** 1️⃣  fetch auctions created by this admin */
      const myAuctions:   Auction[]  = await auctionService.getMyAuctions().catch(() => []);
      /** 2️⃣  unassigned products for stats */
      const unassigned:   Product[]  = await auctionService.getUnassignedProducts().catch(() => []);

      /** 3️⃣  Build per‑auction rows  */
      const auctionRowsBuilt: AuctionReport[] = await Promise.all(
        myAuctions.map(async (a: Auction): Promise<AuctionReport> => {
          const products: Product[] =
            await auctionService.getAuctionProductsAdmin(a.id).catch(() => []);

          /* bids for every product */
          const bidsNested: Bid[][] = await Promise.all(
            products.map((p: Product) =>
              auctionService.getAllBids(p.id).catch(() => [] as Bid[])
            )
          );
          const flatBids: Bid[] = bidsNested.flat();

          const revenue = flatBids
            .filter((b: Bid) => b.status === 'success')
            .reduce((sum: number, b: Bid) => sum + (b.amount ?? 0), 0);

          return {
            id: a.id,
            name: a.name,
            valid_until: a.valid_until,
            productCount: products.length,
            bidCount: flatBids.length,
            revenue,
          };
        })
      );

      /** 4️⃣  Build global product rows */
      const productRowsBuilt: ProductReport[] = await Promise.all(
        myAuctions
          .map((a: Auction) => a.id)
          .map(async (id: string): Promise<Product[]> =>
            await auctionService.getAuctionProductsAdmin(id).catch(() => [])
          )
      )
        .then((arr: Product[][]) => arr.flat())
        .then(async (allProds: Product[]) =>
          Promise.all(
            allProds.map(async (p: Product): Promise<ProductReport> => {
              const bids: Bid[] = await auctionService.getAllBids(p.id).catch(() => []);
              const highest = bids.reduce(
                (m: number, b: Bid) => Math.max(m, b.amount ?? 0),
                0
              );

              return {
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                bidCount: bids.length,
                highestBid: highest,
              };
            })
          )
        );

      /* include unassigned in product report */
      const unassignedRows: ProductReport[] = unassigned.map((u: Product) => ({
        id: u.id,
        name: u.name,
        description: u.description,
        status: 'unassigned',
        bidCount: 0,
        highestBid: 0,
      }));

      /* commit to state */
      setAuctionRows(auctionRowsBuilt);
      setProductRows(productRowsBuilt.concat(unassignedRows));
    } catch (err) {
      console.error(err);
      showError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CSV export ---------------- */
  const handleExport = () => {
    const rows = reportType === 'auctions' ? auctionRows : productRows;
    if (!rows.length) return;

    const csv =
      [Object.keys(rows[0]).join(',')]
        .concat(rows.map(r => Object.values(r).join(',')))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('CSV file generated.');
  };

  /* ---------------- column schemas ----------- */
  const auctionCols = [
    {
      key: 'id',
      label: 'ID',
      render: (v: string) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate(`/admin/auctions/${v}`)}
        >
          {v}
        </button>
      ),
    },
    { key: 'name', label: 'Name', render: (v: string) => <span className="font-medium">{v}</span> },
    {
      key: 'valid_until',
      label: 'Ends',
      render: (v: string) => <span>{new Date(v).toLocaleString()}</span>,
    },
    { key: 'productCount', label: '#Products' },
    { key: 'bidCount', label: '#Bids' },
    {
      key: 'revenue',
      label: 'Revenue (₹)',
      render: (v: number) => <span className="font-semibold">₹{v.toLocaleString()}</span>,
    },
  ];

  const productCols = [
    { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'name', label: 'Name', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'description', label: 'Description' },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium
            ${v === 'sold' ? 'bg-red-100 text-red-800'
              : v === 'unassigned' ? 'bg-amber-100 text-amber-800'
              : 'bg-green-100 text-green-800'}`}
        >
          {v ?? 'N/A'}
        </span>
      ),
    },
    { key: 'bidCount', label: '#Bids' },
    {
      key: 'highestBid',
      label: 'Highest Bid',
      render: (v: number) => <span>₹{v.toLocaleString()}</span>,
    },
  ];

  /* ---------------- loading state ------------ */
  if (loading) {
    return (
      <Layout
        title="Reports"
        sidebarItems={adminSidebar}
        sidebarTitle="Admin Portal"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      </Layout>
    );
  }

  /* ---------------- page render -------------- */
  return (
    <Layout
      title="Reports"
      sidebarItems={adminSidebar}
      sidebarTitle="Admin Portal"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">System Reports</h2>
              <p className="text-slate-600">
                Monitor auction &amp; product analytics
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            icon={Gavel}
            label="Total Auctions"
            value={auctionRows.length}
            color="text-blue-600"
          />
          <SummaryCard
            icon={Clock}
            label="Active Auctions"
            value={
              auctionRows.filter(
                (a: AuctionReport) => new Date(a.valid_until) > new Date()
              ).length
            }
            color="text-green-600"
          />
          <SummaryCard
            icon={Package}
            label="Total Products"
            value={productRows.length}
            color="text-purple-600"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Revenue (₹)"
            value={`₹${auctionRows
              .reduce((s: number, a: AuctionReport) => s + a.revenue, 0)
              .toLocaleString()}`}
            color="text-amber-600"
          />
        </div>

        {/* selector */}
        <Card>
          <div className="flex gap-4">
            <Button
              variant={reportType === 'auctions' ? 'primary' : 'secondary'}
              onClick={() => setReportType('auctions')}
            >
              Auction Reports
            </Button>
            <Button
              variant={reportType === 'products' ? 'primary' : 'secondary'}
              onClick={() => setReportType('products')}
            >
              Product Reports
            </Button>
          </div>
        </Card>

        {/* data table */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            {reportType === 'auctions'
              ? 'Auction Performance'
              : 'Product Analytics'}
          </h3>

          {reportType === 'auctions' ? (
            <Table
              columns={auctionCols}
              data={auctionRows}
              emptyMessage="No auction data"
            />
          ) : (
            <Table
              columns={productCols}
              data={productRows}
              emptyMessage="No product data"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

/* ------------------------------------------------------------------
 *  SummaryCard helper
 * ----------------------------------------------------------------- */
const SummaryCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: any;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <Card className="text-center">
    <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
    <h3 className="font-semibold text-slate-900">{label}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </Card>
);

