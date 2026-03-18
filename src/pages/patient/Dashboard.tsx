import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Calendar, FileText, CreditCard, Activity, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function PatientDashboard() {
  const { currentUser, appointments, prescriptions, invoices, labReports, users } = useAppContext();

  if (!currentUser) return null;

  const myAppointments = appointments.filter(a => a.patientId === currentUser.id);
  const upcomingAppointments = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const myPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);
  const myInvoices = invoices.filter(i => i.patientId === currentUser.id);
  const unpaidInvoices = myInvoices.filter(i => i.status === 'unpaid');
  const myLabReports = labReports.filter(l => l.patientId === currentUser.id);
  const pendingLabReports = myLabReports.filter(l => l.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name}</h1>
          <p className="text-slate-500">Here is your healthcare summary for today.</p>
        </div>
        <Link to="/book-appointment" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Upcoming Visits</p>
            <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Prescriptions</p>
            <p className="text-2xl font-bold text-slate-900">{myPrescriptions.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Lab Tests</p>
            <p className="text-2xl font-bold text-slate-900">{pendingLabReports.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-rose-50 p-4 rounded-xl text-rose-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Unpaid Bills</p>
            <p className="text-2xl font-bold text-slate-900">{unpaidInvoices.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Upcoming Appointments
            </h2>
            <Link to="/patient/appointments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 3).map(apt => {
                const doctor = users.find(u => u.id === apt.doctorId);
                return (
                  <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img src={doctor?.avatar || `https://ui-avatars.com/api/?name=${doctor?.name}&background=random`} alt={doctor?.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-semibold text-slate-900">Dr. {doctor?.name}</p>
                          <p className="text-sm text-slate-500 capitalize">{doctor?.specialty}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.status === 'confirmed' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        <span className="capitalize">{apt.status}</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-6 text-sm text-slate-600 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{apt.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No upcoming appointments</p>
                <Link to="/book-appointment" className="mt-2 text-indigo-600 hover:text-indigo-700 hover:underline text-sm font-medium">Book one now</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Recent Prescriptions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Recent Prescriptions
              </h2>
              <Link to="/patient/records" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {myPrescriptions.length > 0 ? (
                myPrescriptions.slice(0, 2).map(rx => {
                  const doctor = users.find(u => u.id === rx.doctorId);
                  return (
                    <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">Prescribed by Dr. {doctor?.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(rx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">Rx</span>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-sm text-slate-700 line-clamp-2 font-medium">{rx.medications}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No recent prescriptions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Lab Reports */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                Lab Reports
              </h2>
              <Link to="/patient/records" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {myLabReports.length > 0 ? (
                myLabReports.slice(0, 2).map(lab => {
                  return (
                    <div key={lab.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${lab.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{lab.testName}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{new Date(lab.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                        lab.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {lab.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        <span className="capitalize">{lab.status}</span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Activity className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No lab reports available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
