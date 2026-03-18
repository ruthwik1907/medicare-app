import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Plus, FileText, Calendar, Mail, Phone, Clock, CheckCircle, Activity, Pill, User as UserIcon, X } from 'lucide-react';

export default function DoctorPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, users, appointments, prescriptions, addPrescription, updateAppointmentStatus } = useAppContext();
  const navigate = useNavigate();
  
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');

  if (!currentUser) return null;

  const patient = users.find(u => u.id === id && u.role === 'patient');
  
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient not found</h2>
        <p className="text-slate-500 mb-6">The patient you are looking for does not exist or you don't have access.</p>
        <button 
          onClick={() => navigate('/doctor/patients')} 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </button>
      </div>
    );
  }

  const patientApts = appointments.filter(a => a.patientId === patient.id && a.doctorId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id && p.doctorId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    addPrescription({
      patientId: patient.id,
      doctorId: currentUser.id,
      appointmentId: selectedAptId,
      medications,
      notes
    });
    
    // Auto complete the appointment if it's not already
    const apt = appointments.find(a => a.id === selectedAptId);
    if (apt && apt.status !== 'completed') {
      updateAppointmentStatus(selectedAptId, 'completed');
    }

    setShowPrescriptionModal(false);
    setMedications('');
    setNotes('');
    setSelectedAptId('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'completed': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/doctor/patients')} 
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Profile</h1>
          <p className="text-slate-500 text-sm mt-1">View patient details and medical history.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <img 
              src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}&background=random`} 
              alt={patient.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{patient.name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {patient.email}
              </div>
              {patient.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {patient.phone}
                </div>
              )}
            </div>
            <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Patient ID: {patient.id}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowPrescriptionModal(true)}
          className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Appointment History
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {patientApts.length} Total
            </span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[600px]">
            {patientApts.map(apt => (
              <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <p className="font-bold text-slate-900">
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <span className="text-slate-300">•</span>
                      <Clock className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-700">{apt.time}</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 flex items-start gap-2">
                      <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{apt.reason}</span>
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset capitalize shrink-0 ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
                
                {apt.status === 'confirmed' && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Mark Completed
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedAptId(apt.id);
                        setShowPrescriptionModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <Pill className="h-3.5 w-3.5 mr-1.5" />
                      Add Prescription
                    </button>
                  </div>
                )}
              </div>
            ))}
            {patientApts.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No appointments found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Prescriptions History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-500" />
              Prescriptions
            </h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {patientPrescriptions.length} Total
            </span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[600px]">
            {patientPrescriptions.map(rx => (
              <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(rx.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5" /> Medications
                    </h4>
                    <p className="text-slate-800 text-sm whitespace-pre-wrap font-medium">{rx.medications}</p>
                  </div>
                  
                  {rx.notes && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Doctor's Notes
                      </h4>
                      <p className="text-slate-600 text-sm whitespace-pre-wrap">{rx.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {patientPrescriptions.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Pill className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No prescriptions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-indigo-600" />
                Add Prescription
              </h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPrescription} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Related Appointment</label>
                <select
                  required
                  value={selectedAptId}
                  onChange={(e) => setSelectedAptId(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                >
                  <option value="">Select an appointment</option>
                  {patientApts.filter(a => a.status !== 'cancelled').map(a => (
                    <option key={a.id} value={a.id}>{a.date} at {a.time} - {a.reason}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">Linking to an appointment helps maintain accurate medical records.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Medications & Dosage</label>
                <textarea
                  required
                  rows={4}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm resize-none"
                  placeholder="e.g. Amoxicillin 500mg, 1 tablet 3 times a day for 7 days"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor's Notes / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm resize-none"
                  placeholder="Additional instructions, dietary restrictions, or warnings..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
