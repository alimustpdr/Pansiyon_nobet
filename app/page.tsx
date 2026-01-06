'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Users, Settings, Calendar, FileText } from 'lucide-react';

export default function Home() {
  const { teachers } = useStore();
  const activeCount = teachers.filter(t => t.isActive).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Pansiyon Nöbet Yönetim Sistemi</h1>
        <p className="text-indigo-200 text-lg">
          MEB yönetmeliklerine uygun, adil ve otomatik nöbet dağıtım asistanı.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/teachers" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition hover:border-indigo-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Öğretmen Havuzu</h2>
                <p className="text-gray-500 text-sm">Nöbet tutacak personeli yönetin</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {teachers.length} <span className="text-sm font-normal text-gray-400">Toplam</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              {activeCount} Aktif Öğretmen
            </div>
          </div>
        </Link>

        <Link href="/settings" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition hover:border-indigo-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kurallar ve Ayarlar</h2>
                <p className="text-gray-500 text-sm">Günlük nöbetçi sayılarını belirleyin</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-4">
              Erkek ve Kız pansiyonları için ayrı ayrı nöbetçi sayısı yapılandırması.
            </div>
          </div>
        </Link>

        <Link href="/schedule" className="group md:col-span-2">
          <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition hover:border-indigo-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Nöbet Dağıtımı</h2>
                  <p className="text-gray-500 text-sm">Otomatik liste oluştur ve raporla</p>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm border">
                Excel Çıktısı Mevcut
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
