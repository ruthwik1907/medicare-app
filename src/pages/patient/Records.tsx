import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, Download, Printer, Search, Filter, Pill, Calendar, User, Activity } from 'lucide-react';

export default function PatientRecords() {
  const { currentUser, prescriptions, labReports, users } = useAppContext();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'lab-reports'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  const myPrescriptions = prescriptions
    .filter(p => p.patientId === currentUser.id)
    .filter(p => {
      const doctor = users.find(u => u.id === p.doctorId);
      const medsString = p.items?.map(i => i.medicationName).join(' ') || '';
      return (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             medsString.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const myLabReports = (labReports || [])
    .filter(r => r.patientId === currentUser.id)
    .filter(r => {
      const doctor = users.find(u => u.id === r.doctorId);
      return (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (r.testName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (r.resultData && r.resultData.toLowerCase().includes(searchTerm.toLowerCase()));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-500 text-sm mt-1">Access your prescriptions, lab results, and medical history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'prescriptions'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('lab-reports')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'lab-reports'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Lab Reports
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {activeTab === 'prescriptions' && (
          <>
            {myPrescriptions.map(rx => {
              const doctor = users.find(u => u.id === rx.doctorId);
              return (
                <div key={rx.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Prescription</h3>
                          <div className="flex items-center text-sm text-slate-500 mt-1 gap-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              {new Date(rx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1.5" />
                              Dr. {doctor?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Printer className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Pill className="h-5 w-5 text-indigo-500" />
                          <h4 className="font-semibold text-slate-900">Medications</h4>
                        </div>
                        <div className="prose prose-sm prose-slate max-w-none">
                          <ul className="space-y-2">
                            {rx.items?.map((item, idx) => (
                              <li key={idx} className="text-slate-700">
                                <strong>{item.medicationName}</strong> - {item.dosage} ({item.route})<br/>
                                <span className="text-xs text-slate-500">{item.frequency} for {item.durationDays} days. {item.specialInstructions}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          <h4 className="font-semibold text-slate-900">Status</h4>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                          {rx.status === 'dispensed' ? `Dispensed on ${new Date(rx.dispensedAt || '').toLocaleDateString()}` : 'Pending Dispensation'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {myPrescriptions.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No prescriptions found</h3>
                <p className="text-slate-500">You don't have any prescriptions matching your search.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'lab-reports' && (
          <>
            {myLabReports.map(report => {
              const doctor = users.find(u => u.id === report.doctorId);
              return (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{report.testName}</h3>
                          <div className="flex items-center text-sm text-slate-500 mt-1 gap-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1.5" />
                              Requested by Dr. {doctor?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          report.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {report.status}
                        </span>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <h4 className="font-semibold text-slate-900 mb-3">Results & Interpretation</h4>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {report.resultData || 'Results are pending and will be available soon.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {myLabReports.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No lab reports found</h3>
                <p className="text-slate-500">You don't have any lab reports matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
