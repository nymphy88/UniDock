/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // กวาดทุกไฟล์ใน src รวมถึง App.tsx ของคุณด้วย
  ],
  theme: {
    extend: {
      colors: {
        // กู้คืนสี Node จากระบบเดิม
        'node-input': '#dbeafe',     // ฟ้าอ่อน
        'node-process': '#dcfce7',    // เขียวอ่อน
        'node-model': '#fef9c3',      // เหลืองอ่อน
        'node-loss': '#fce7f3',       // ชมพูอ่อน
        'node-optimizer': '#fef08a',  // ส้ม/เหลืองเข้ม
        'node-math': '#f3e8ff',       // ม่วงอ่อน
        'node-pipeline': '#ccfbf1',   // เขียวมิ้นต์
        
        // สีพื้นฐานของระบบ
        primary: '#3B82F6',
        background: '#fafaf8',
        'text-primary': '#2d2420',
        'border-color': '#e5e0da',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}