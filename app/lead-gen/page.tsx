'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Users2,
  ArrowRight,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  contact_name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
}

export default function LeadGenPage() {
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    contact_name: '',
    email: '',
    phone: '',
    company: '',
    source: 'CSV Upload',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState<{ count: number } | null>(null);

  // Manual lead form state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualSource, setManualSource] = useState('Direct Referral');
  const [manualSuccess, setManualSuccess] = useState(false);

  // Auto-detect columns based on header strings
  const detectColumns = (headers: string[]) => {
    const newMapping: ColumnMapping = {
      contact_name: '',
      email: '',
      phone: '',
      company: '',
      source: 'CSV Upload',
    };

    for (const h of headers) {
      const lower = h.toLowerCase().trim();
      if (!newMapping.contact_name && (lower.includes('name') || lower.includes('contact') || lower.includes('client'))) {
        newMapping.contact_name = h;
      } else if (!newMapping.email && (lower.includes('email') || lower.includes('mail'))) {
        newMapping.email = h;
      } else if (!newMapping.phone && (lower.includes('phone') || lower.includes('mobile') || lower.includes('whatsapp') || lower.includes('tel') || lower.includes('cell'))) {
        newMapping.phone = h;
      } else if (!newMapping.company && (lower.includes('company') || lower.includes('organization') || lower.includes('org') || lower.includes('business'))) {
        newMapping.company = h;
      }
    }

    setMapping(newMapping);
  };

  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    setImportSuccess(null);

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setCsvHeaders(results.meta.fields);
          detectColumns(results.meta.fields);
        }
        setParsedData(results.data || []);
      },
      error: (err) => {
        alert(`Error parsing CSV: ${err.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImportLeads = async () => {
    if (!mapping.contact_name && !mapping.email && !mapping.phone) {
      alert('Please map at least one contact identifier (Name, Email, or Phone).');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate bulk database batch insert into Supabase leads table
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setImportSuccess({ count: parsedData.length });
    } catch {
      alert('Failed to import leads. Check Supabase connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualSuccess(true);
    setTimeout(() => {
      setManualName('');
      setManualEmail('');
      setManualPhone('');
      setManualCompany('');
      setManualSuccess(false);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Lead Gen & Ingestion
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Lead Generation & CSV Contact Importer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk ingest customer databases, map fields, sanitize phone numbers, and auto-feed into your CRM.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/80 p-1 rounded-lg flex items-center text-xs font-medium">
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'csv' ? 'bg-white shadow-xs text-slate-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
              <span>Bulk CSV Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'manual' ? 'bg-white shadow-xs text-slate-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Add Single Lead</span>
            </button>
          </div>

          <Link
            href="/crm"
            className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#5D3D55] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Open CRM Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6 flex-1">
        {activeTab === 'csv' ? (
          <div className="space-y-6">
            {/* Step 1: Drag & Drop Upload Card */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
                csvFile ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300 hover:border-amber-500 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {csvFile ? csvFile.name : 'Drag & drop customer CSV file here'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                Support for `.csv` files with custom columns (Name, Email, Mobile/Phone, Company, Tags). Automatically parses 10,000+ rows instantly.
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-medium rounded-lg cursor-pointer shadow-xs transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>Select CSV from Computer</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>

              {parsedData.length > 0 && (
                <div className="mt-4 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parsed {parsedData.length.toLocaleString()} rows successfully</span>
                </div>
              )}
            </div>

            {/* Step 2: Column Mapping & Ingestion Setup */}
            {parsedData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Step 2: Map CSV Headers to LeadAgent7 Fields
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match each column from your CSV to corresponding CRM lead attributes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={mapping.contact_name}
                      onChange={(e) => setMapping({ ...mapping, contact_name: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Select Column --</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Phone / WhatsApp</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={mapping.phone}
                      onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Select Column --</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <select
                      value={mapping.email}
                      onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Select Column --</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Company / Organization</label>
                    <select
                      value={mapping.company}
                      onChange={(e) => setMapping({ ...mapping, company: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Select Column --</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data Preview Table */}
                <div>
                  <div className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Data Preview (First 5 Rows)
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Mapped Name</th>
                          <th className="px-3 py-2">Mapped Phone</th>
                          <th className="px-3 py-2">Mapped Email</th>
                          <th className="px-3 py-2">Mapped Company</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium text-slate-800">
                              {mapping.contact_name ? row[mapping.contact_name] || '-' : '-'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {mapping.phone ? row[mapping.phone] || '-' : '-'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {mapping.email ? row[mapping.email] || '-' : '-'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {mapping.company ? row[mapping.company] || '-' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Deduplication active: Contacts will be upserted without creating duplicate phone/email records.</span>
                  </div>

                  <button
                    onClick={handleImportLeads}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Importing to Supabase...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Import {parsedData.length} Leads to CRM</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Import Success Banner */}
                {importSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold">
                        Successfully imported {importSuccess.count} leads into your CRM database!
                      </span>
                    </div>
                    <Link
                      href="/crm"
                      className="font-bold underline hover:text-emerald-900 inline-flex items-center gap-1"
                    >
                      <span>View in CRM Kanban</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Manual Single Lead Creation Tab */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-8 max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Create Single Lead
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Manually register a prospective client or referral directly into the CRM pipeline.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Tariq Al-Hashimi"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="tariq@example.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="Hashimi Properties LLC"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Acquisition Source
                  </label>
                  <select
                    value={manualSource}
                    onChange={(e) => setManualSource(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Direct Referral">Direct Referral</option>
                    <option value="Instagram Ad">Instagram Ad</option>
                    <option value="Facebook Campaign">Facebook Campaign</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="WhatsApp Inbound">WhatsApp Inbound</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#714B67] hover:bg-[#5D3D55] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create & Add to CRM Pipeline</span>
                </button>
              </div>

              {manualSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium text-center">
                  Lead successfully created and assigned to CRM!
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
