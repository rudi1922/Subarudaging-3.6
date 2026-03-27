import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { PrinterType, PrinterConnection } from '../types';
import { Printer, Bluetooth, Settings, AlertTriangle, Cable, CheckCircle2 } from 'lucide-react';

const PrinterSettings: React.FC = () => {
  const { printerConfig, updatePrinterConfig } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleTestPrint = async () => {
    setIsTesting(true);
    setStatusMessage('Mencoba cetak tes...');
    
    try {
        if (printerConfig.connection === PrinterConnection.SYSTEM) {
            // Use browser print
            window.print();
            setStatusMessage('Dialog cetak sistem terbuka.');
        } else if (printerConfig.connection === PrinterConnection.USB) {
            if (!printerConfig.deviceId) {
                setStatusMessage('Printer USB belum terhubung. Silakan scan dulu.');
            } else {
                // Mock direct USB print logic
                setStatusMessage('Perintah cetak dikirim ke USB (Raw).');
            }
        } else if (printerConfig.connection === PrinterConnection.BLUETOOTH) {
            if (!printerConfig.deviceId) {
                setStatusMessage('Printer Bluetooth belum terhubung. Silakan scan dulu.');
            } else {
                // Mock Bluetooth print logic
                setStatusMessage('Perintah cetak dikirim ke Bluetooth (Raw).');
            }
        }
    } catch (error) {
        console.error(error);
        setStatusMessage('Gagal melakukan cetak tes.');
    } finally {
        setIsTesting(false);
        setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleScanBluetooth = async () => {
    setIsScanning(true);
    setStatusMessage('Mencari perangkat Bluetooth...');
    
    // Web Bluetooth API Check
    if (!(navigator as Navigator & { bluetooth?: { requestDevice: (options: unknown) => Promise<BluetoothDevice> } }).bluetooth) {
      setStatusMessage('Browser ini tidak mendukung Web Bluetooth API.');
      setIsScanning(false);
      return;
    }

    try {
      const device = await (navigator as Navigator & { bluetooth: { requestDevice: (options: unknown) => Promise<BluetoothDevice> } }).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      if (device) {
        updatePrinterConfig({
          deviceName: device.name || 'Unknown Device',
          deviceId: device.id,
          connection: PrinterConnection.BLUETOOTH
        });
        setStatusMessage(`Terhubung ke: ${device.name}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error.name === 'NotFoundError' || error.message?.includes('No device selected'))) {
        setStatusMessage('Pencarian dibatalkan.');
        return;
      }
      console.error(error);
      setStatusMessage('Gagal menemukan atau menghubungkan perangkat Bluetooth.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanUSB = async () => {
      setIsScanning(true);
      setStatusMessage('Mencari perangkat USB...');

      if (!(navigator as Navigator & { usb?: { requestDevice: (options: unknown) => Promise<USBDevice> } }).usb) {
          setStatusMessage('Browser ini tidak mendukung WebUSB API.');
          setIsScanning(false);
          return;
      }

      try {
          const device = await (navigator as Navigator & { usb: { requestDevice: (options: unknown) => Promise<USBDevice> } }).usb.requestDevice({ filters: [] });
          if (device) {
              await device.open();
              updatePrinterConfig({
                  deviceName: device.productName || `USB Device ${device.vendorId}:${device.productId}`,
                  deviceId: String(device.serialNumber),
                  connection: PrinterConnection.USB
              });
              setStatusMessage(`Terhubung ke: ${device.productName}`);
              await device.close();
          }
      } catch (error: unknown) {
          if (error instanceof Error && (error.name === 'NotFoundError' || error.message?.includes('No device selected'))) {
            setStatusMessage('Pencarian dibatalkan.');
            return;
          }
          console.error(error);
          setStatusMessage('Gagal menghubungkan perangkat USB.');
      } finally {
          setIsScanning(false);
      }
  };

  return (
    <div className="bg-[#1e1e1e] text-white p-6 rounded-xl border border-white/10 shadow-lg max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <Printer size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Pengaturan Printer</h2>
          <p className="text-xs text-gray-400">Konfigurasi cetak struk & laporan</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Connection Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Metode Koneksi</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => updatePrinterConfig({ connection: PrinterConnection.SYSTEM })}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${
                printerConfig.connection === PrinterConnection.SYSTEM
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              <Settings size={20} />
              <span className="text-[10px] font-bold">System</span>
            </button>
            <button
              onClick={() => updatePrinterConfig({ connection: PrinterConnection.BLUETOOTH })}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${
                printerConfig.connection === PrinterConnection.BLUETOOTH
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              <Bluetooth size={20} />
              <span className="text-[10px] font-bold">Bluetooth</span>
            </button>
            <button
              onClick={() => updatePrinterConfig({ connection: PrinterConnection.USB })}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${
                printerConfig.connection === PrinterConnection.USB
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              <Cable size={20} />
              <span className="text-[10px] font-bold">Direct USB</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            *System: Gunakan driver printer bawaan OS.<br/>
            *Bluetooth/USB: Koneksi langsung ke printer thermal (Raw Print).
          </p>
        </div>

        {/* Paper Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ukuran Kertas</label>
          <select
            value={printerConfig.type}
            onChange={(e) => updatePrinterConfig({ type: e.target.value as PrinterType })}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
          >
            <option value={PrinterType.THERMAL_58}>Thermal 58mm (Struk Kecil)</option>
            <option value={PrinterType.THERMAL_80}>Thermal 80mm (Struk Standar)</option>
            <option value={PrinterType.A4}>Kertas A4 (Laporan Standar)</option>
            <option value={PrinterType.LEGAL}>Kertas Legal (Laporan Panjang)</option>
            <option value={PrinterType.FOLIO}>Kertas Folio / F4 (Laporan)</option>
          </select>
          <p className="text-[10px] text-blue-400 mt-2">
            *Untuk Canon G2730: Pilih "System" & "A4/Legal".
          </p>
        </div>

        {/* Bluetooth Specifics */}
        {printerConfig.connection === PrinterConnection.BLUETOOTH && (
          <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-300">Perangkat Bluetooth</span>
              {isScanning && <span className="text-[10px] animate-pulse text-blue-400">Scanning...</span>}
            </div>
            
            {printerConfig.deviceName ? (
              <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5">
                <span className="text-sm text-white">{printerConfig.deviceName}</span>
                <button 
                  onClick={() => updatePrinterConfig({ deviceName: undefined, deviceId: undefined })}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Putus
                </button>
              </div>
            ) : (
              <button
                onClick={handleScanBluetooth}
                disabled={isScanning}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isScanning ? 'Mencari...' : 'Scan & Hubungkan Printer'}
              </button>
            )}
            
            {statusMessage && (
              <p className="text-[10px] text-yellow-400 mt-2 flex items-center gap-1">
                <AlertTriangle size={10} /> {statusMessage}
              </p>
            )}
          </div>
        )}

        {/* USB Specifics */}
        {printerConfig.connection === PrinterConnection.USB && (
          <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-300">Perangkat USB</span>
              {isScanning && <span className="text-[10px] animate-pulse text-blue-400">Scanning...</span>}
            </div>
            
            {printerConfig.deviceName ? (
              <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5">
                <span className="text-sm text-white">{printerConfig.deviceName}</span>
                <button 
                  onClick={() => updatePrinterConfig({ deviceName: undefined, deviceId: undefined })}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Putus
                </button>
              </div>
            ) : (
              <button
                onClick={handleScanUSB}
                disabled={isScanning}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isScanning ? 'Mencari...' : 'Scan & Hubungkan USB'}
              </button>
            )}
            
            {statusMessage && (
              <p className="text-[10px] text-yellow-400 mt-2 flex items-center gap-1">
                <AlertTriangle size={10} /> {statusMessage}
              </p>
            )}
          </div>
        )}

        {/* Auto Print Toggle */}
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
          <span className="text-sm text-gray-300">Otomatis Cetak Struk</span>
          <button 
            onClick={() => updatePrinterConfig({ autoPrint: !printerConfig.autoPrint })}
            className={`w-10 h-5 rounded-full relative transition-colors ${printerConfig.autoPrint ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${printerConfig.autoPrint ? 'left-6' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Test Print Button */}
        <button
          onClick={handleTestPrint}
          disabled={isTesting}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          {isTesting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 size={18} className="text-green-400" />}
          Uji Coba Cetak (Test Print)
        </button>

        {statusMessage && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                <p className="text-xs text-blue-400">{statusMessage}</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default PrinterSettings;
