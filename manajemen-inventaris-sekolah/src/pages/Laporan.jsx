import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ErrorAlert from '../components/common/ErrorAlert';

const Laporan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('barang');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [showGenerateButton, setShowGenerateButton] = useState(true);

  const reportTypes = [
    { value: 'barang', label: 'Inventaris Barang' },
    { value: 'peminjaman', label: 'Peminjaman' },
    { value: 'pengembalian', label: 'Pengembalian' },
    { value: 'barang_rusak', label: 'Barang Rusak/Hilang' },
    { value: 'aktivitas', label: 'Aktivitas Peminjaman per User' }
  ];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api(`/laporan/${reportType}`, {
        params: dateRange
      });
      setReportData(response.data);
      setShowGenerateButton(false);
    } catch (err) {
      setError('Gagal membuat laporan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async (format) => {
    setIsLoading(true);
    try {
      const response = await api(`/laporan/${reportType}/download`, {
        params: { ...dateRange, format },
        responseType: 'blob'
      });
      
      // Create a blob URL for the file
      const blob = new Blob([response.data], { 
        type: format === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Gagal mengunduh laporan');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetReport = () => {
    setReportData(null);
    setShowGenerateButton(true);
  };

  // Komponen rendering laporan berbeda berdasarkan tipe
  const renderReportData = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'barang':
        return (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Kode</th>
                  <th>Nama Barang</th>
                  <th>Kategori</th>
                  <th>Jumlah</th>
                  <th>Kondisi</th>
                  <th>Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.kode}</td>
                    <td>{item.nama}</td>
                    <td>{item.kategori?.nama || '-'}</td>
                    <td>{item.jumlah}</td>
                    <td>
                      <span className={`badge ${item.kondisi === 'baik' ? 'badge-success' : item.kondisi === 'rusak ringan' ? 'badge-warning' : 'badge-error'}`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td>{item.lokasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'peminjaman':
        return (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Barang</th>
                  <th>Peminjam</th>
                  <th>Tanggal Pinjam</th>
                  <th>Tanggal Kembali</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.barang?.nama || '-'}</td>
                    <td>{item.user?.name || '-'}</td>
                    <td>{new Date(item.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                    <td>
                      {item.tanggal_kembali 
                        ? new Date(item.tanggal_kembali).toLocaleDateString('id-ID') 
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge ${
                        item.status === 'dipinjam' 
                          ? 'badge-info' 
                          : item.status === 'dikembalikan' 
                            ? 'badge-success' 
                            : item.status === 'terlambat'
                              ? 'badge-error'
                              : 'badge-warning'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      // Implementasi rendering untuk tipe laporan lainnya
      default:
        return (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Data laporan tersedia untuk diunduh</span>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Laporan</h1>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Generate Laporan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Jenis Laporan</span>
              </label>
              <select
                className="select select-bordered"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  resetReport();
                }}
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tanggal Mulai</span>
              </label>
              <input
                type="date"
                name="startDate"
                className="input input-bordered"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tanggal Akhir</span>
              </label>
              <input
                type="date"
                name="endDate"
                className="input input-bordered"
                value={dateRange.endDate}
                onChange={handleDateChange}
                min={dateRange.startDate}
              />
            </div>
          </div>

          {showGenerateButton ? (
            <div className="flex justify-end">
              <button
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                onClick={generateReport}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                Generate Laporan
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={resetReport}
              >
                Reset
              </button>
              <button
                className={`btn btn-outline btn-primary ${isLoading ? 'loading' : ''}`}
                onClick={() => downloadReport('excel')}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                className={`btn btn-outline btn-accent ${isLoading ? 'loading' : ''}`}
                onClick={() => downloadReport('pdf')}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {reportData && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">
              Laporan {reportTypes.find(t => t.value === reportType)?.label || ''} 
            </h2>
            <p className="text-sm mb-4">
              Periode: {new Date(dateRange.startDate).toLocaleDateString('id-ID')} s/d {new Date(dateRange.endDate).toLocaleDateString('id-ID')}
            </p>
            
            {reportData.summary && (
              <div className="stats shadow mb-6">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div className="stat" key={key}>
                    <div className="stat-title">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div className="stat-value">{value}</div>
                  </div>
                ))}
              </div>
            )}
            
            {renderReportData()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;