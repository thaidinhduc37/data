import React, { useState } from 'react';
import { Button, Card, Input } from '../../components';

const TimeOff = () => {
  const [formData, setFormData] = useState({
    kinggui: 'Lãnh đạo Phòng Tham mưu - Công an tỉnh',
    hoTen: '',
    sinhNgay: '',
    capBac: '',
    chucVu: '',
    soHieu: '',
    thangNamVaoCAND: '',
    thamNien: '',
    congTac: '',
    thoiGianDaNghiPhep: '',
    namNghiPhep: new Date().getFullYear().toString(),
    tuNgay: '',
    denNgay: '',
    lyDo: '',
    diaDiem: '',
    donVi: 'PHÒNG THAM MƯU',
    soNgayNghi: '',
    ngayLap: new Date().toLocaleDateString('vi-VN'),
  });

  const capBacOptions = [
    { value: 'Hạ sĩ', label: 'Hạ sĩ' },
    { value: 'Trung sĩ', label: 'Trung sĩ' },
    { value: 'Thượng sĩ', label: 'Thượng sĩ' },
    { value: 'Thiếu úy', label: 'Thiếu úy' },
    { value: 'Trung úy', label: 'Trung úy' },
    { value: 'Thượng úy', label: 'Thượng úy' },
    { value: 'Đại úy', label: 'Đại úy' },
    { value: 'Thiếu tá', label: 'Thiếu tá' },
    { value: 'Trung tá', label: 'Trung tá' },
    { value: 'Thượng tá', label: 'Thượng tá' }
  ];

  const chucVuOptions = [
    { value: 'Chiến sĩ', label: 'Chiến sĩ' },
    { value: 'Cán bộ', label: 'Cán bộ' },
    { value: 'Trưởng Công an xã/phường', label: 'Trưởng Công an xã/phường' },
    { value: 'Phó trưởng Công an xã/phường', label: 'Phó trưởng Công an xã/phường' },
    { value: 'Đội trưởng', label: 'Đội trưởng' },
    { value: 'Phó Đội trưởng', label: 'Phó Đội trưởng' },
    { value: 'Trưởng Phòng', label: 'Trưởng Phòng' },
    { value: 'Phó Trưởng phòng', label: 'Phó Trưởng phòng' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateWorkingDays = () => {
    if (formData.tuNgay && formData.denNgay) {
      const startDate = new Date(formData.tuNgay);
      const endDate = new Date(formData.denNgay);
      
      if (endDate < startDate) return 0;
      
      let workingDays = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return workingDays;
    }
    return 0;
  };

  React.useEffect(() => {
    const days = calculateWorkingDays();
    setFormData(prev => ({ ...prev, soNgayNghi: days.toString() }));
  }, [formData.tuNgay, formData.denNgay]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const downloadDocument = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              font-size: 13pt; 
              line-height: 1.6; 
              margin: 3cm 2.5cm;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .italic { font-style: italic; }
            .indent { text-indent: 20px; }
          </style>
        </head>
        <body>
          <div class="center bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="center">Độc lập - Tự do - Hạnh phúc</div>
          <br>
          <div class="center bold" style="font-size: 16pt;">ĐƠN XIN NGHỈ PHÉP</div>
          <br>
          <p>Kính gửi: ${formData.kinggui}</p>
          <br>
          <p>Tên tôi là: ${formData.hoTen}; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sinh ngày: ${formatDate(formData.sinhNgay)}</p>
          <p>Cấp bậc: ${formData.capBac}; &nbsp;&nbsp;&nbsp;&nbsp;Chức vụ: ${formData.chucVu}</p>
          <p>Số hiệu: ${formData.soHieu}; &nbsp;&nbsp;&nbsp;Tháng, năm vào CAND: ${formData.thangNamVaoCAND}; Thâm niên: ${formData.thamNien} năm</p>
          <p>Hiện đang công tác: ${formData.congTac}.</p>
          <p>Thời gian đã được nghỉ phép trong năm <span class="italic">(nếu có):</span> ${formData.thoiGianDaNghiPhep}</p>
          <br>
          <p class="indent">Nay tôi viết đơn xin nghỉ phép theo chế độ được quy định tại Thông tư 50/2019/TT-BCA ngày 16/10/2019 của Bộ trưởng Bộ Công an; kính đề nghị các đồng chí xem xét giải quyết cho tôi được nghỉ phép năm ${formData.namNghiPhep} từ ngày ${formatDate(formData.tuNgay)}, lý do: ${formData.lyDo}.</p>
          <br>
          <p>Địa điểm: ${formData.diaDiem}.</p>
          <br>
          <p>Rất mong được sự quan tâm, tạo điều kiện của các đồng chí, tôi xin chân thành cảm ơn./.</p>
          <br><br>
          <table width="100%">
            <tr>
              <td width="55%" valign="top">
                <p class="bold">ĐƠN VỊ ${formData.donVi}</p>
                <p>Căn cứ Thông tư 50/2019/TT-BCA và đơn xin nghỉ phép của đồng chí ${formData.hoTen}</p>
                <br>
                <p>Giải quyết cho đồng chí được nghỉ phép năm ${formData.namNghiPhep}, thời gian ${formData.soNgayNghi} ngày, kể từ ngày ${formatDate(formData.tuNgay)} đến ngày ${formatDate(formData.denNgay)} <span class="italic">(không tính thứ 7, chủ nhật và các ngày lễ, tết)</span>. Nơi nghỉ: ${formData.diaDiem}/.</p>
                <br>
                <p class="italic">Đắk Lắk, ngày ${formData.ngayLap}</p>
              </td>
              <td width="45%" valign="top" align="center">
                <p class="italic">Đắk Lắk, ngày ${formData.ngayLap}</p>
                <br>
                <p class="bold">NGƯỜI LÀM ĐƠN</p>
                <br><br><br>
                <p class="bold">${formData.hoTen}</p>
              </td>
            </tr>
          </table>
          <br><br>
          <div class="center bold">THỦ TRƯỞNG ĐƠN VỊ</div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Don_xin_nghi_phep_${formData.hoTen || 'template'}.docx`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const printDocument = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Đơn xin nghỉ phép</title>
          <style>
            @page { size: A4; margin: 3cm 2.5cm; }
            body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.6; margin: 0; padding: 0; color: #000; }
            .header { text-align: center; font-weight: bold; margin-bottom: 25px; line-height: 1.8; }
            .title { font-size: 16px; font-weight: bold; text-align: center; margin: 25px 0 30px 0; letter-spacing: 0.5px; }
            .content { line-height: 1.7; margin-bottom: 40px; }
            .indent { text-indent: 20px; text-align: justify; }
            .signature-section { display: table; width: 100%; margin-top: 40px; }
            .signature-left { display: table-cell; width: 55%; vertical-align: top; padding-right: 30px; line-height: 1.6; }
            .signature-right { display: table-cell; width: 45%; vertical-align: top; text-align: center; line-height: 1.6; }
            .signature-name { margin-top: 60px; font-weight: bold; }
            .thu-truong { margin-top: 50px; text-align: center; font-weight: bold; }
            .bold { font-weight: bold; }
            .italic { font-style: italic; }
            p { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div>Độc lập - Tự do - Hạnh phúc</div>
          </div>
          
          <div class="title">ĐƠN XIN NGHỈ PHÉP</div>
          
          <div class="content">
            <p>Kính gửi: ${formData.kinggui}</p>
            <br>
            <p class="indent">Tên tôi là: ${formData.hoTen}; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sinh ngày: ${formatDate(formData.sinhNgay)}</p>
            <p class="indent">Cấp bậc: ${formData.capBac}; &nbsp;&nbsp;&nbsp;&nbsp;Chức vụ: ${formData.chucVu}</p>
            <p class="indent">Số hiệu: ${formData.soHieu}; &nbsp;&nbsp;&nbsp;Tháng, năm vào CAND: ${formData.thangNamVaoCAND}; Thâm niên: ${formData.thamNien} năm</p>
            <p class="indent">Hiện đang công tác: ${formData.congTac}.</p>
            <p class="indent">Thời gian đã được nghỉ phép trong năm <span class="italic">(nếu có):</span> ${formData.thoiGianDaNghiPhep}</p>
            <br>
            <p class="indent">Nay tôi viết đơn xin nghỉ phép theo chế độ được quy định tại Thông tư 50/2019/TT-BCA ngày 16/10/2019 của Bộ trưởng Bộ Công an; kính đề nghị các đồng chí xem xét giải quyết cho tôi được nghỉ phép năm ${formData.namNghiPhep} từ ngày ${formatDate(formData.tuNgay)}, lý do: ${formData.lyDo}.</p>
            <br>
            <p class="indent">Địa điểm: ${formData.diaDiem}.</p>
            <br>
            <p class="indent">Rất mong được sự quan tâm, tạo điều kiện của các đồng chí, tôi xin chân thành cảm ơn./.</p>
          </div>
          
          <div class="signature-section">
            <div class="signature-left">
              <div class="bold">ĐƠN VỊ ${formData.donVi}</div>
              <p>Căn cứ Thông tư 50/2019/TT-BCA và đơn xin nghỉ phép của đồng chí ${formData.hoTen}</p>
              <br>
              <p>Giải quyết cho đồng chí được nghỉ phép năm ${formData.namNghiPhep}, thời gian ${formData.soNgayNghi} ngày, kể từ ngày ${formatDate(formData.tuNgay)} đến ngày ${formatDate(formData.denNgay)} <span class="italic">(không tính thứ 7, chủ nhật và các ngày lễ, tết)</span>. Nơi nghỉ: ${formData.diaDiem}/.</p>
              <br>
              <p class="italic">Đắk Lắk, ngày ${formData.ngayLap}</p>
              <div class="thu-truong">
            <div class="bold">THỦ TRƯỞNG ĐƠN VỊ</div>
          </div>
            </div>
            <div class="signature-right">
              <p class="italic">Đắk Lắk, ngày ${formData.ngayLap}</p>
              <br>
              <p class="bold">NGƯỜI LÀM ĐƠN</p>
              <div class="signature-name">${formData.hoTen}</div>
            </div>
          </div>
          
          
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Left Panel - Form Input */}
      <div style={{ width: '50%', padding: '24px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
          Thông tin đăng ký nghỉ phép
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Thông tin cơ bản */}
          <div style={{ backgroundColor: '#dbeafe', padding: '12px', borderRadius: '8px' }}>
            <h3 style={{ fontWeight: '600', color: '#374151', margin: 0 }}>Thông tin cơ bản</h3>
          </div>
          
          <Input
            label="Kính gửi"
            value={formData.kinggui}
            onChange={(e) => handleInputChange('kinggui', e.target.value)}
            size="small"
          />

          <Input
            label="Họ và tên"
            value={formData.hoTen}
            onChange={(e) => handleInputChange('hoTen', e.target.value)}
            placeholder="Nguyễn Văn A"
            size="small"
            required
          />

          <Input
            label="Sinh ngày"
            type="date"
            value={formData.sinhNgay}
            onChange={(e) => handleInputChange('sinhNgay', e.target.value)}
            size="small"
            required
          />

          <Input.Select
            label="Cấp bậc"
            value={formData.capBac}
            onChange={(e) => handleInputChange('capBac', e.target.value)}
            options={capBacOptions}
            placeholder="Chọn cấp bậc"
            required
          />

          <Input.Select
            label="Chức vụ"
            value={formData.chucVu}
            onChange={(e) => handleInputChange('chucVu', e.target.value)}
            options={chucVuOptions}
            placeholder="Chọn chức vụ"
            required
          />

          <Input
            label="Số hiệu"
            value={formData.soHieu}
            onChange={(e) => handleInputChange('soHieu', e.target.value)}
            placeholder="589-070"
            size="small"
          />

          <Input
            label="Tháng, năm vào CAND"
            value={formData.thangNamVaoCAND}
            onChange={(e) => handleInputChange('thangNamVaoCAND', e.target.value)}
            placeholder="9/2015"
            size="small"
          />

          <Input
            label="Thâm niên (năm)"
            type="number"
            value={formData.thamNien}
            onChange={(e) => handleInputChange('thamNien', e.target.value)}
            placeholder="10"
            size="small"
          />

          <Input.Textarea
            label="Hiện đang công tác"
            value={formData.congTac}
            onChange={(e) => handleInputChange('congTac', e.target.value)}
            placeholder="Đội Công nghệ thông tin - Phòng Tham mưu"
            rows={2}
          />

          {/* Thông tin nghỉ phép */}
          <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '8px' }}>
            <h3 style={{ fontWeight: '600', color: '#374151', margin: 0 }}>Thông tin nghỉ phép</h3>
          </div>

          <Input
            label="Thời gian đã nghỉ phép trong năm"
            value={formData.thoiGianDaNghiPhep}
            onChange={(e) => handleInputChange('thoiGianDaNghiPhep', e.target.value)}
            placeholder="5 ngày (tùy chọn)"
            size="small"
          />

          <Input
            label="Năm nghỉ phép"
            type="number"
            value={formData.namNghiPhep}
            onChange={(e) => handleInputChange('namNghiPhep', e.target.value)}
            min="2024"
            max="2030"
            size="small"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Từ ngày"
              type="date"
              value={formData.tuNgay}
              onChange={(e) => handleInputChange('tuNgay', e.target.value)}
              size="small"
              required
            />

            <Input
              label="Đến ngày"
              type="date"
              value={formData.denNgay}
              onChange={(e) => handleInputChange('denNgay', e.target.value)}
              size="small"
              required
            />
          </div>

          <Input.Textarea
            label="Lý do nghỉ phép"
            value={formData.lyDo}
            onChange={(e) => handleInputChange('lyDo', e.target.value)}
            placeholder="Giải quyết việc gia đình"
            rows={2}
            required
          />

          <Input
            label="Địa điểm nghỉ"
            value={formData.diaDiem}
            onChange={(e) => handleInputChange('diaDiem', e.target.value)}
            placeholder="Tỉnh Nghệ An"
            size="small"
            required
          />

          <Input
            label="Đơn vị"
            value={formData.donVi}
            onChange={(e) => handleInputChange('donVi', e.target.value)}
            placeholder="PHÒNG THAM MƯU"
            size="small"
            required
          />

          {/* Thông tin tính toán */}
          <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
            <p style={{ color: '#6b7280', margin: 0 }}>
              <strong>Số ngày nghỉ (không tính T7, CN):</strong> {calculateWorkingDays()} ngày
            </p>
            {formData.tuNgay && formData.denNgay && (
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                Từ {formatDate(formData.tuNgay)} đến {formatDate(formData.denNgay)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div style={{ width: '50%', padding: '24px', backgroundColor: '#f9fafb', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Xem trước đơn</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="success" size="small" onClick={downloadDocument}>
              <i className="fas fa-download" style={{ marginRight: '4px' }}></i>
              Tải về
            </Button>
            <Button variant="primary" size="small" onClick={printDocument}>
              <i className="fas fa-print" style={{ marginRight: '4px' }}></i>
              In đơn
            </Button>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '32px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
          minHeight: 'calc(100vh - 120px)', 
          fontFamily: 'Times New Roman, serif' 
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.8' }}>
            <div style={{ fontSize: '14px' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style={{ fontSize: '14px' }}>Độc lập - Tự do - Hạnh phúc</div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '32px', letterSpacing: '0.5px' }}>
            ĐƠN XIN NGHỈ PHÉP
          </div>

          {/* Content */}
          <div style={{ fontSize: '13px', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '16px', textAlign: 'center' }}>Kính gửi: {formData.kinggui}</p>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '8px', textIndent: '20px' }}>
                Tên tôi là: {formData.hoTen}; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Sinh ngày: {formatDate(formData.sinhNgay)}
              </p>
              <p style={{ marginBottom: '8px' , textIndent: '20px' }}>
                Cấp bậc: {formData.capBac}; &nbsp;&nbsp;&nbsp;&nbsp;Chức vụ: {formData.chucVu}
              </p>
              <p style={{ marginBottom: '8px' , textIndent: '20px' }}>
                Số hiệu: {formData.soHieu}; &nbsp;&nbsp;&nbsp;Tháng, năm vào CAND: {formData.thangNamVaoCAND}; 
                Thâm niên: {formData.thamNien} năm
              </p>
              <p style={{ marginBottom: '8px' , textIndent: '20px' }}>Hiện đang công tác: {formData.congTac}.</p>
              <p style={{ marginBottom: '8px' , textIndent: '20px' }}>
                Thời gian đã được nghỉ phép trong năm <em>(nếu có):</em> {formData.thoiGianDaNghiPhep}
              </p>
            </div>

            <p style={{ textAlign: 'justify', textIndent: '20px', marginBottom: '16px' }}>
              Nay tôi viết đơn xin nghỉ phép theo chế độ được quy định tại Thông tư 50/2019/TT-BCA ngày 16/10/2019 
              của Bộ trưởng Bộ Công an; kính đề nghị các đồng chí xem xét giải quyết cho tôi được nghỉ phép năm {formData.namNghiPhep} 
               từ ngày {formatDate(formData.tuNgay)}, lý do: {formData.lyDo}.
            </p>

            <p style={{ marginBottom: '16px',textIndent: '20px' }}>Địa điểm: {formData.diaDiem}.</p>

            <p style={{ marginBottom: '32px',textIndent: '20px' }}>
              Rất mong được sự quan tâm, tạo điều kiện của các đồng chí, tôi xin chân thành cảm ơn./.
            </p>
          </div>

          {/* Signature Section */}
          <div style={{ display: 'flex', marginTop: '32px' }}>
            {/* Left column */}
            <div style={{ width: '55%', paddingRight: '16px', fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px',textAlign: 'center' }}>ĐƠN VỊ {formData.donVi}</div>
              <p style={{ marginBottom: '12px', }}>
                Căn cứ Thông tư 50/2019/TT-BCA và đơn xin nghỉ phép của đồng chí {formData.hoTen}
              </p>
              <p style={{ marginBottom: '12px' }}>
                Giải quyết cho đồng chí được nghỉ phép năm {formData.namNghiPhep}, thời gian {formData.soNgayNghi} ngày, 
                kể từ ngày {formatDate(formData.tuNgay)} đến ngày {formatDate(formData.denNgay)} 
                <em> (không tính thứ 7, chủ nhật và các ngày lễ, tết)</em>. Nơi nghỉ: {formData.diaDiem}/.
              </p>
              <p style={{ fontStyle: 'italic' }}>Đắk Lắk, ngày {formData.ngayLap}</p>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginTop: '16px' }}>
            THỦ TRƯỞNG ĐƠN VỊ
          </div>
            </div>

            {/* Right column */}
            <div style={{ width: '45%', textAlign: 'center', fontSize: '13px', lineHeight: '1.6' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '16px' }}>Đắk Lắk, ngày {formData.ngayLap}</p>
              <p style={{ fontWeight: 'bold', marginBottom: '48px' }}>NGƯỜI LÀM ĐƠN</p>
              <p style={{ fontWeight: 'bold' }}>{formData.hoTen}</p>
            </div>
          </div>

          {/* Footer */}
          
        </div>
      </div>
    </div>
  );
};

export default TimeOff;