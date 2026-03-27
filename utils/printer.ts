import { PrinterConfig, PrinterType, PrinterConnection, ReceiptData, PrintingData } from '../types';

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;

const COMMANDS = {
  INIT: [ESC, 0x40],
  TEXT_NORMAL: [ESC, 0x21, 0x00],
  TEXT_DOUBLE_HEIGHT: [ESC, 0x21, 0x10],
  TEXT_DOUBLE_WIDTH: [ESC, 0x21, 0x20],
  TEXT_BOLD_ON: [ESC, 0x45, 0x01],
  TEXT_BOLD_OFF: [ESC, 0x45, 0x00],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  FEED_LINES: (n: number) => [ESC, 0x64, n],
  SET_MARGIN_LEFT: [GS, 0x4C, 0x00, 0x00], // Set left margin to 0
  SET_PRINT_WIDTH: (w: number) => [GS, 0x57, w & 0xFF, (w >> 8) & 0xFF],
  CUT: [GS, 0x56, 0x42, 0x00]
};

export class PrinterService {
  private config: PrinterConfig;

  constructor(config: PrinterConfig) {
    this.config = config;
  }

  // Helper to format currency
  private formatCurrency(amount: number): string {
    // Replace non-breaking space (\u00A0) with normal space to prevent printer issues
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
        .format(amount)
        .replace(/\u00A0/g, ' '); 
  }

  // Helper to center text (for string based generation, though we use commands now)
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length);
    const leftPad = Math.floor(padding / 2);
    return ' '.repeat(leftPad) + text;
  }

  // Helper to create a line separator
  private createLine(width: number, char: string = '-'): string {
    return char.repeat(width);
  }

  // Generate Receipt Content based on Type
  public generateReceiptContent(_data: unknown): string {
    // This is mainly for debugging or non-binary contexts
    return "Binary Data Generated";
  }

  private encodeText(text: string): Uint8Array {
      const encoder = new TextEncoder();
      return encoder.encode(text);
  }

  private combineBuffers(buffers: Uint8Array[]): Uint8Array {
      const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const b of buffers) {
          result.set(b, offset);
          offset += b.length;
      }
      return result;
  }

  // Generate ESC/POS Command Buffer
  private generateThermalReceiptBuffer(data: ReceiptData): Uint8Array {
    const width = this.config.type === PrinterType.THERMAL_58 ? 32 : 48; 
    const buffers: Uint8Array[] = [];

    // Helper to add commands
    const add = (cmd: number[] | Uint8Array) => {
        if (cmd instanceof Uint8Array) buffers.push(cmd);
        else buffers.push(new Uint8Array(cmd));
    };

    const addTextLine = (text: string) => {
        add(this.encodeText(text + '\n'));
    };

    // Initialize
    add(COMMANDS.INIT);
    add(COMMANDS.SET_MARGIN_LEFT);
    add(COMMANDS.SET_PRINT_WIDTH(width * 8)); // Approx dots for character width
    add(COMMANDS.FEED_LINES(1)); // Initial feed to wake up
    add(COMMANDS.ALIGN_CENTER);

    // Header
    add(COMMANDS.TEXT_BOLD_ON);
    addTextLine(data.title || 'SUBARU DAGING');
    add(COMMANDS.TEXT_NORMAL); // Reset
    add(COMMANDS.ALIGN_CENTER);
    
    if (data.subtitle) {
        // Ensure no phone number in subtitle if it comes from data
        const cleanSubtitle = data.subtitle.replace(/08\d{2,}-\d{2,}-\d{2,}/g, '').replace(/08\d{8,}/g, '');
        addTextLine(cleanSubtitle);
    } else {
        addTextLine('Jl. Tamin No.30, Klp. Tiga');
        addTextLine('Tj. Karang Pusat, B. Lampung');
    }
    
    addTextLine(this.createLine(width));
    add(COMMANDS.ALIGN_LEFT);

    // --- PRINTING DATA (REPORTS) ---
    if ('columns' in data && 'rows' in data) {
        const report = data as PrintingData;
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine(report.title);
        add(COMMANDS.TEXT_NORMAL);
        addTextLine(this.createLine(width));
        
        // Header
        let headerLine = '';
        report.columns.forEach((col, idx) => {
            headerLine += col.substring(0, 8).padEnd(8);
            if (idx < report.columns.length - 1) headerLine += ' ';
        });
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine(headerLine.substring(0, width));
        add(COMMANDS.TEXT_BOLD_OFF);
        addTextLine(this.createLine(width));

        // Rows
        report.rows.forEach(row => {
            let rowLine = '';
            row.forEach((cell, idx) => {
                rowLine += String(cell).substring(0, 8).padEnd(8);
                if (idx < row.length - 1) rowLine += ' ';
            });
            addTextLine(rowLine.substring(0, width));
        });
        addTextLine(this.createLine(width));
    }
    // --- EXPENSE RECEIPT (GAJI, OPERASIONAL) ---
    if (data.expense) {
        addTextLine(`Tgl: ${data.date}`);
        addTextLine(`Kategori: ${data.expense.category}`);
        addTextLine(`Divisi: ${data.expense.division}`);
        addTextLine(this.createLine(width));
        
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine('Keterangan:');
        add(COMMANDS.TEXT_BOLD_OFF);
        addTextLine(data.expense.description || '-');
        
        addTextLine(this.createLine(width));
        add(COMMANDS.ALIGN_RIGHT);
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine(`TOTAL: ${this.formatCurrency(data.expense.amount)}`);
        add(COMMANDS.TEXT_NORMAL);
        add(COMMANDS.ALIGN_LEFT);
        
        addTextLine(this.createLine(width));
        addTextLine('\n');
        add(COMMANDS.ALIGN_CENTER);
        addTextLine('( Admin )         ( Penerima )');
        addTextLine('\n\n');
    } 
    // --- SALES TRANSACTION RECEIPT ---
    else if (data.transactionId || data.id) {
        const id = data.transactionId || data.id;
        addTextLine(`No: ${id}`);
        addTextLine(`Tgl: ${new Date(data.date).toLocaleString('id-ID')}`);
        addTextLine(`Kasir: ${data.cashier || data.user || 'Admin'}`);
        addTextLine(this.createLine(width));

        // Items
        const items = data.items || [];
        if (Array.isArray(items)) {
            items.forEach((item) => {
                const name = item.name.substring(0, width);
                addTextLine(name);
                
                const itemTotal = item.total || (item.price * item.qty);
                const qtyPrice = `${item.qty} x ${item.price.toLocaleString('id-ID')}`;
                const totalStr = itemTotal.toLocaleString('id-ID');
                
                // Simple layout: Qty x Price ... Total
                // Calculate spaces
                const spaceCount = width - qtyPrice.length - totalStr.length - 1; // -1 for space
                const spaces = ' '.repeat(Math.max(0, spaceCount));
                
                addTextLine(`${qtyPrice}${spaces} ${totalStr}`);
            });
        }
        addTextLine(this.createLine(width));

        // Totals
        add(COMMANDS.ALIGN_RIGHT);
        
        if (data.isDelivery && (data.shippingCost || 0) > 0) {
             const sub = data.subtotal || (data.total - (data.shippingCost || 0));
             addTextLine(`Subtotal: ${this.formatCurrency(sub)}`);
             addTextLine(`Ongkir: ${this.formatCurrency(data.shippingCost || 0)}`);
        }

        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine(`Total: ${this.formatCurrency(data.total)}`);
        add(COMMANDS.TEXT_NORMAL);
        
        if (data.paymentMethod) {
            addTextLine(`Bayar (${data.paymentMethod}): ${this.formatCurrency(data.total)}`);
        }
        add(COMMANDS.ALIGN_CENTER);
    } else if (data.employee) {
        // --- SALARY SLIP ---
        addTextLine(`Periode: ${data.date}`);
        addTextLine(this.createLine(width));
        add(COMMANDS.ALIGN_LEFT);
        addTextLine(`Nama: ${data.employee.name}`);
        addTextLine(`Div : ${data.employee.division}`);
        addTextLine(this.createLine(width));
        
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine('PENERIMAAN');
        add(COMMANDS.TEXT_BOLD_OFF);
        (data.earnings || []).forEach((e) => {
             const val = this.formatCurrency(e.value);
             const space = width - e.label.length - val.length;
             addTextLine(`${e.label}${' '.repeat(Math.max(0, space))}${val}`);
        });
        
        addTextLine('\n');
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine('POTONGAN');
        add(COMMANDS.TEXT_BOLD_OFF);
        (data.deductions || []).forEach((d) => {
             const val = `(${this.formatCurrency(d.value)})`;
             const space = width - d.label.length - val.length;
             addTextLine(`${d.label}${' '.repeat(Math.max(0, space))}${val}`);
        });
        
        addTextLine(this.createLine(width, '='));
        add(COMMANDS.ALIGN_RIGHT);
        add(COMMANDS.TEXT_BOLD_ON);
        addTextLine(`THP: ${this.formatCurrency(data.total)}`);
        add(COMMANDS.TEXT_NORMAL);
        add(COMMANDS.ALIGN_CENTER);
        addTextLine('\n\n( HRD )         ( Karyawan )');
        addTextLine('\n');
    }

    // Footer
    addTextLine(this.createLine(width));
    addTextLine('Terima Kasih');
    
    // Feed and Cut
    add(COMMANDS.FEED_LINES(4));
    // add(COMMANDS.CUT); // Optional, many mobile printers don't support cut

    return this.combineBuffers(buffers);
  }

  // Chunking for BLE
  private async sendBluetoothData(characteristic: BluetoothRemoteGATTCharacteristic, data: Uint8Array) {
      const CHUNK_SIZE = 20; // Smaller chunks for BT58D stability
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
          const chunk = data.slice(i, i + CHUNK_SIZE);
          await characteristic.writeValue(chunk);
          // Delay to prevent buffer overflow
          await new Promise(resolve => setTimeout(resolve, 80)); 
      }
  }

  // Check if printer is configured for the selected connection
  public checkConfig(): { ready: boolean; message?: string } {
    if (this.config.connection === PrinterConnection.SYSTEM) {
        return { ready: true };
    }
    
    if (!this.config.deviceId || !this.config.deviceName) {
        return { 
            ready: false, 
            message: `Printer ${this.config.connection} belum dikonfigurasi. Silakan atur di menu Pengaturan.` 
        };
    }
    
    return { ready: true };
  }

  // Print Function
  public async print(data: ReceiptData | PrintingData): Promise<void> {
    const configCheck = this.checkConfig();
    if (!configCheck.ready && this.config.connection !== PrinterConnection.SYSTEM) {
        const proceed = window.confirm(`${configCheck.message}\n\nLanjutkan menggunakan dialog cetak sistem (Browser)?`);
        if (!proceed) return;
        // Fallback to system print
        window.print();
        return;
    }

    if (this.config.connection === PrinterConnection.SYSTEM) {
      window.print();
    } else if (this.config.connection === PrinterConnection.BLUETOOTH) {
      try {
        if (!navigator.bluetooth) {
           throw new Error('Web Bluetooth API tidak didukung di browser ini.');
        }
        
        // Common Service UUIDs for Thermal Printers
        // Note: 000018f0 is standard Generic Access, usually not for printing.
        // 0000ff00 is very common for Chinese printers.
        // 49535343 is ISSC (common).
        const services = [
            '000018f0-0000-1000-8000-00805f9b34fb', 
            '0000ff00-0000-1000-8000-00805f9b34fb', 
            'e7810a71-73ae-499d-8c15-faa9aef0c3f2', 
            '49535343-fe7d-4ae5-8fa9-9fafd205e455'
        ];

        // Request device with ALL services optional to avoid filtering issues
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: services
        });

        if (device) {
            const server = await device.gatt.connect();
            
            let service;
            let characteristic;

            // Try to find the correct service and characteristic
            for (const sUuid of services) {
                try {
                    service = await server.getPrimaryService(sUuid);
                    // Try common characteristic UUIDs
                    const charUuids = [
                        '00002af1-0000-1000-8000-00805f9b34fb',
                        '0000ff02-0000-1000-8000-00805f9b34fb',
                        '49535343-8841-43f4-a8d4-ecbe34729bb3'
                    ];
                    
                    for (const cUuid of charUuids) {
                        try {
                            characteristic = await service.getCharacteristic(cUuid);
                            if (characteristic) break;
                        } catch { /* continue */ }
                    }
                    if (characteristic) break;
                } catch { /* continue */ }
            }

            if (!characteristic) {
                // Fallback: Try to get ANY characteristic from the first available service
                try {
                    const servicesList = await server.getPrimaryServices();
                    if (servicesList.length > 0) {
                        const chars = await servicesList[0].getCharacteristics();
                        if (chars.length > 0) {
                             // Look for a writable characteristic
                             characteristic = chars.find((c: BluetoothRemoteGATTCharacteristic) => c.properties.write || c.properties.writeWithoutResponse);
                        }
                    }
                } catch(__e) { console.warn("Fallback failed", __e); }
            }

            if (!characteristic) {
                throw new Error('Service/Characteristic printer tidak ditemukan.');
            }
            
            // Cast to ReceiptData because generateThermalReceiptBuffer expects it. 
            // If it's PrintingData (report), we might need a different generator or adapter.
            // For now, assume it's ReceiptData if we are printing to thermal via BT.
            const buffer = this.generateThermalReceiptBuffer(data as ReceiptData);
            await this.sendBluetoothData(characteristic, buffer);
            
            alert("Cetak Berhasil via Bluetooth!");
            if (device.gatt.connected) {
                device.gatt.disconnect();
            }
        }
      } catch (error: unknown) {
        const err = error as Error;
        if (err.name === 'NotFoundError' || err.message?.includes('No device selected')) {
             console.warn('Bluetooth device selection cancelled by user');
             return;
        }
        console.error('Bluetooth Print Error:', error);
        alert('Gagal mencetak ke Bluetooth. Pastikan perangkat aktif dan browser mendukung.');
      }
    } else if (this.config.connection === PrinterConnection.USB) {
        try {
            if (!navigator.usb) {
                throw new Error('WebUSB API tidak didukung di browser ini.');
            }

            const device = await navigator.usb.requestDevice({ filters: [] });
            await device.open();
            await device.selectConfiguration(1);
            await device.claimInterface(0);
            
            const buffer = this.generateThermalReceiptBuffer(data as ReceiptData);
            
            // Endpoint number might vary, usually 1 or 2 for OUT
            await device.transferOut(1, buffer);
            alert("Cetak Berhasil via USB!");
            await device.close();
        } catch (error: unknown) {
            const err = error as Error;
            if (err.name === 'NotFoundError' || err.message?.includes('No device selected')) {
                 console.warn('USB device selection cancelled by user');
                 return;
            }
            console.error('USB Print Error:', error);
            alert('Gagal mencetak ke USB. Pastikan kabel terhubung dan izin diberikan.');
        }
    }
  }
}
