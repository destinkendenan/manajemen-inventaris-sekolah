import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';

const LaporanGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const printFrameRef = useRef(null);

  // Report filters state
  const [filters, setFilters] = useState({
    reportType: 'inventaris',
    dateRange: 'bulan_ini',
    startDate: '',
    endDate: '',
    kategoriId: '',
    status: '',
    kondisi: '',
    exportType: 'pdf'
  });

  // UI states
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);

  useEffect(() => {
    fetchKategori();
    
    // Set default dates for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilters(prev => ({
      ...prev,
      startDate: formatDateForInput(firstDay),
      endDate: formatDateForInput(lastDay)
    }));
  }, []);

  // Format date to YYYY-MM-DD for input elements
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchKategori = async () => {
    try {
      const response = await api('/kategori', { params: { per_page: 100 } });
      setKategoriList(response.data || []);
    } catch (err) {
      console.error('Error fetching kategori:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });

    // Handle date range presets
    if (name === 'dateRange') {
      const now = new Date();
      let startDate, endDate;

      switch (value) {
        case 'hari_ini':
          startDate = formatDateForInput(now);
          endDate = formatDateForInput(now);
          break;
        case 'minggu_ini':
          // Calculate first day of week (Sunday) and last day (Saturday)
          const firstDayOfWeek = new Date(now);
          const day = now.getDay();
          const diff = now.getDate() - day;
          firstDayOfWeek.setDate(diff);
          
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
          
          startDate = formatDateForInput(firstDayOfWeek);
          endDate = formatDateForInput(lastDayOfWeek);
          break;
        case 'bulan_ini':
          startDate = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1));
          endDate = formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
          break;
        case 'tahun_ini':
          startDate = formatDateForInput(new Date(now.getFullYear(), 0, 1));
          endDate = formatDateForInput(new Date(now.getFullYear(), 11, 31));
          break;
        case 'semua':
          startDate = '';
          endDate = '';
          break;
        case 'kustom':
          // Keep current dates
          return;
        default:
          break;
      }

      setFilters(prev => ({
        ...prev,
        startDate,
        endDate
      }));
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setReportData(null);
    
    try {
      // Prepare params based on filter settings
      const params = {
        report_type: filters.reportType,
        export_type: filters.exportType
      };
      
      // Add date range if not 'semua'
      if (filters.dateRange !== 'semua') {
        if (filters.startDate) params.start_date = filters.startDate;
        if (filters.endDate) params.end_date = filters.endDate;
      }
      
      // Add other filters if they are set
      if (filters.kategoriId) params.kategori_id = filters.kategoriId;
      if (filters.status) params.status = filters.status;
      if (filters.kondisi) params.kondisi = filters.kondisi;
      
      // Call API to generate report
      const response = await api('/laporan/generate', {
        method: 'POST',
        data: params
      });
      
      if (filters.exportType === 'preview') {
        // Set data for preview
        setReportData(response);
        setIsPreviewVisible(true);
      } else {
        // For PDF/Excel, API should return a download URL
        if (response.download_url) {
          window.open(response.download_url, '_blank');
        }
        setSuccess('Laporan berhasil dibuat dan siap diunduh');
      }
    } catch (err) {
      setError(err.message || 'Gagal membuat laporan. Silakan coba lagi.');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('reportPreview');
    const WinPrint = window.open('', '', 'width=900,height=650');
    
    WinPrint.document.write(`
      <html>
        <head>
          <title>Laporan ${filters.reportType === 'inventaris' ? 'Inventaris' : 
                          filters.reportType === 'peminjaman' ? 'Peminjaman' : 
                          'Aktivitas'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1, h2 { text-align: center; }
            .header { margin-bottom: 20px; text-align: center; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">
            <p>Dicetak pada ${new Date().toLocaleString('id-ID')}</p>
          </div>
        </body>
      </html>
    `);
    
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // Clear alerts after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="w-full">
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-6">Generator Laporan</h2>
        
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {success && (
          <div className="alert alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleGenerateReport}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Report Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Jenis Laporan</span>
              </label>
              <select
                name="reportType"
                value={filters.reportType}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="inventaris">Laporan Inventaris</option>
                <option value="peminjaman">Laporan Peminjaman</option>
                <option value="aktivitas">Laporan Aktivitas</option>
              </select>
            </div>
            
            {/* Date Range Preset */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Rentang Waktu</span>
              </label>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="hari_ini">Hari Ini</option>
                <option value="minggu_ini">Minggu Ini</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="tahun_ini">Tahun Ini</option>
                <option value="semua">Semua Waktu</option>
                <option value="kustom">Kustom</option>
              </select>
            </div>
            
            {/* Custom Date Range */}
            {filters.dateRange === 'kustom' && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tanggal Mulai</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tanggal Akhir</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </>
            )}
            
            {/* Report-specific filters */}
            {filters.reportType === 'inventaris' && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Kategori</span>
                  </label>
                  <select
                    name="kategoriId"
                    value={filters.kategoriId}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Semua Kategori</option>
                    {kategoriList.map(kat => (
                      <option key={kat.id} value={kat.id}>{kat.nama}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Kondisi</span>
                  </label>
                  <select
                    name="kondisi"
                    value={filters.kondisi}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Semua Kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                </div>
              </>
            )}
            
            {filters.reportType === 'peminjaman' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Semua Status</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="dipinjam">Dipinjam</option>
                  <option value="dikembalikan">Dikembalikan</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="terlambat">Terlambat</option>
                </select>
              </div>
            )}
            
            {/* Export Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Format Laporan</span>
              </label>
              <select
                name="exportType"
                value={filters.exportType}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="preview">Preview</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : null}
              Generate Laporan
            </button>
          </div>
        </form>
      </div>
      
      {/* Report Preview Section */}
      {isPreviewVisible && reportData && (
        <div className="bg-base-100 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Preview Laporan</h2>
            
            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak
            </button>
          </div>
          
          <div className="divider"></div>
          
          <div className="overflow-auto" id="reportPreview">
            <div className="header mb-6">
              <h1 className="text-2xl font-bold">
                {filters.reportType === 'inventaris' ? 'Laporan Inventaris Barang' : 
                 filters.reportType === 'peminjaman' ? 'Laporan Peminjaman Barang' : 
                 'Laporan Aktivitas Sistem'}
              </h1>
              <p className="text-sm mt-2">
                Periode: {filters.dateRange === 'semua' ? 'Semua Waktu' : 
                         `${filters.startDate} s/d ${filters.endDate}`}
              </p>
            </div>
            
            {/* Render based on report type */}
            {filters.reportType === 'inventaris' && (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Tersedia</th>
                    <th>Kondisi</th>
                    <th>Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data?.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.kode}</td>
                      <td>{item.nama}</td>
                      <td>{item.kategori?.nama || '-'}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.jumlah_tersedia}</td>
                      <td>
                        {item.kondisi === 'baik' ? 'Baik' : 
                         item.kondisi === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}
                      </td>
                      <td>{item.lokasi || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="text-right font-bold">Total:</td>
                    <td className="font-bold">{reportData.summary?.total_items || 0}</td>
                    <td className="font-bold">{reportData.summary?.total_available || 0}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            )}
            
            {filters.reportType === 'peminjaman' && (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Peminjam</th>
                    <th>Barang</th>
                    <th>Tanggal Pinjam</th>
                    <th>Batas Kembali</th>
                    <th>Tanggal Kembali</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data?.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.user?.name || '-'}</td>
                      <td>{item.barang?.nama || '-'}</td>
                      <td>{new Date(item.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                      <td>{new Date(item.tanggal_kembali).toLocaleDateString('id-ID')}</td>
                      <td>{item.tanggal_dikembalikan ? new Date(item.tanggal_dikembalikan).toLocaleDateString('id-ID') : '-'}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="text-right font-bold">Total Peminjaman:</td>
                    <td className="font-bold">{reportData.summary?.total_peminjaman || 0}</td>
                  </tr>
                </tfoot>
              </table>
            )}
            
            {filters.reportType === 'aktivitas' && (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Pengguna</th>
                    <th>Aktivitas</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data?.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{new Date(item.created_at).toLocaleString('id-ID')}</td>
                      <td>{item.user?.name || '-'}</td>
                      <td>{item.activity_type}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {/* Summary and Charts could be added here */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Ringkasan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filters.reportType === 'inventaris' && (
                  <>
                    <div className="stat bg-base-200 rounded">
                      <div className="stat-title">Total Barang</div>
                      <div className="stat-value">{reportData.summary?.total_items || 0}</div>
                    </div>
                    <div className="stat bg-base-200 rounded">
                      <div className="stat-title">Total Tersedia</div>
                      <div className="stat-value">{reportData.summary?.total_available || 0}</div>
                    </div>
                    <div className="stat bg-base-200 rounded">
                      <div className="stat-title">Total Nilai</div>
                      <div className="stat-value">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(reportData.summary?.total_value || 0)}
                      </div>
                    </div>
                  </>
                )}
                
                {filters.reportType === 'peminjaman' && (
                  <>
                    <div className="stat bg-base-200 rounded">
                      <div className="stat-title">Total Peminjaman</div>
                      <div className="stat-value">{reportData.summary?.total_peminjaman || 0}</div>
                    </div>
                    <div className="stat bg-base-200 rounded">
                      <div className="stat-title">Peminjaman Aktif</div>
                      <div className="stat-value">{reportData.summary?.peminjaman_aktif || 0}</div>
                    </div>
                    <div className="stat bg-base-200 rounded">
                      <div className="stat-title">Peminjaman Selesai</div>
                      <div className="stat-value">{reportData.summary?.peminjaman_selesai || 0}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <iframe ref={printFrameRef} style={{ display: 'none' }}></iframe>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsPreviewVisible(false)}
              className="btn btn-outline"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporanGenerator;