import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'patient' | 'doctor' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  
  // Patient specific
  mrn?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;

  // Doctor specific
  departmentId?: string;
  specialty?: string;
  qualifications?: string;
  experienceYears?: number;
  consultationFee?: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDurationMinutes: number; // e.g., 30
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  symptoms?: string;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  oxygenLevel: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  vitals: Vitals;
  allergies: string[];
  pastMedicalHistory: string;
  diagnosis: string;
  clinicalNotes: string;
  followUpDate?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  durationDays: number;
  specialInstructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  items: PrescriptionItem[];
  status: 'pending' | 'dispensed';
  dispensedBy?: string;
  dispensedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  type: 'consultation' | 'lab_test' | 'medication' | 'procedure' | 'other';
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial' | 'cancelled';
  items: InvoiceItem[];
  paymentMethod?: 'cash' | 'card' | 'upi' | 'insurance';
  transactionId?: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  testName: string;
  status: 'pending' | 'sample_collected' | 'completed';
  notes?: string;
}

export interface LabReport {
  id: string;
  labRequestId: string;
  patientId: string;
  doctorId: string;
  technicianId?: string;
  date: string;
  testName: string;
  resultData: string; // Could be JSON in real app
  status: 'pending' | 'completed';
  fileUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  doctorSchedules: DoctorSchedule[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  labRequests: LabRequest[];
  labReports: LabReport[];
  messages: Message[];
  login: (email: string, role: Role) => void;
  logout: () => void;
  registerPatient: (data: Partial<User>) => void;
  bookAppointment: (data: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addMedicalRecord: (data: Omit<MedicalRecord, 'id' | 'date'>) => void;
  addPrescription: (data: Omit<Prescription, 'id' | 'date' | 'status'>) => void;
  dispensePrescription: (id: string, pharmacistId: string) => void;
  addDoctor: (data: Partial<User>) => void;
  addDepartment: (data: Omit<Department, 'id'>) => void;
  generateInvoice: (data: Omit<Invoice, 'id' | 'status'>) => void;
  payInvoice: (id: string, method: Invoice['paymentMethod'], transactionId?: string) => void;
  sendMessage: (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageRead: (id: string) => void;
  requestLabTest: (data: Omit<LabRequest, 'id' | 'date' | 'status'>) => void;
  addLabReport: (data: Omit<LabReport, 'id' | 'date'>) => void;
  updateLabReportStatus: (id: string, status: LabReport['status'], resultData?: string) => void;
}

const defaultDepartments: Department[] = [
  { id: 'd1', name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { id: 'd2', name: 'Neurology', description: 'Brain and nervous system' },
  { id: 'd3', name: 'Pediatrics', description: 'Child and infant care' },
  { id: 'd4', name: 'Orthopedics', description: 'Bones and muscles' },
];

const defaultUsers: User[] = [
  { id: 'a1', name: 'Admin User', email: 'admin@hospital.com', role: 'admin' },
  { id: 'rec1', name: 'Sarah Desk', email: 'reception@hospital.com', role: 'receptionist' },
  { id: 'pharm1', name: 'John Pills', email: 'pharmacy@hospital.com', role: 'pharmacist' },
  { id: 'lab1', name: 'Mike Tubes', email: 'lab@hospital.com', role: 'lab_technician' },
  { id: 'doc1', name: 'Dr. Sarah Jenkins', email: 'sarah@hospital.com', role: 'doctor', departmentId: 'd1', specialty: 'Cardiologist', consultationFee: 150, avatar: 'https://picsum.photos/seed/doc1/200/200' },
  { id: 'doc2', name: 'Dr. Michael Chen', email: 'michael@hospital.com', role: 'doctor', departmentId: 'd2', specialty: 'Neurologist', consultationFee: 200, avatar: 'https://picsum.photos/seed/doc2/200/200' },
  { id: 'doc3', name: 'Dr. Emily White', email: 'emily@hospital.com', role: 'doctor', departmentId: 'd3', specialty: 'Pediatrician', consultationFee: 120, avatar: 'https://picsum.photos/seed/doc3/200/200' },
  { id: 'p1', name: 'John Doe', email: 'john@example.com', role: 'patient', phone: '555-0101', mrn: 'MRN-2026-0001', dob: '1985-06-15', gender: 'male', bloodGroup: 'O+' },
  { id: 'p2', name: 'Jane Smith', email: 'jane@example.com', role: 'patient', phone: '555-0102', mrn: 'MRN-2026-0002', dob: '1990-08-22', gender: 'female', bloodGroup: 'A-' },
];

const defaultSchedules: DoctorSchedule[] = [
  { id: 'sch1', doctorId: 'doc1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { id: 'sch2', doctorId: 'doc1', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { id: 'sch3', doctorId: 'doc1', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
];

const defaultAppointments: Appointment[] = [
  { id: 'apt1', patientId: 'p1', doctorId: 'doc1', departmentId: 'd1', date: '2026-03-20', time: '10:00', status: 'confirmed', reason: 'Routine checkup' },
  { id: 'apt2', patientId: 'p2', doctorId: 'doc2', departmentId: 'd2', date: '2026-03-21', time: '14:30', status: 'pending', reason: 'Headaches' },
  { id: 'apt3', patientId: 'p1', doctorId: 'doc3', departmentId: 'd3', date: '2026-03-10', time: '09:00', status: 'completed', reason: 'Fever' },
];

const defaultMedicalRecords: MedicalRecord[] = [
  {
    id: 'emr1', patientId: 'p1', doctorId: 'doc3', appointmentId: 'apt3', date: '2026-03-10',
    vitals: { bloodPressure: '120/80', heartRate: 72, temperature: 98.6, weight: 75, height: 180, oxygenLevel: 99 },
    allergies: ['Penicillin'], pastMedicalHistory: 'None', diagnosis: 'Viral Fever', clinicalNotes: 'Patient presents with mild fever and fatigue.', followUpDate: '2026-03-17'
  }
];

const defaultPrescriptions: Prescription[] = [
  { 
    id: 'rx1', patientId: 'p1', doctorId: 'doc3', appointmentId: 'apt3', date: '2026-03-10', status: 'pending',
    items: [
      { id: 'rxi1', medicationName: 'Paracetamol', dosage: '500mg', route: 'Oral', frequency: 'Twice daily', durationDays: 5, specialInstructions: 'Take after meals' }
    ]
  }
];

const defaultInvoices: Invoice[] = [
  { 
    id: 'inv1', patientId: 'p1', appointmentId: 'apt3', amount: 150.00, date: '2026-03-10', dueDate: '2026-03-24', status: 'paid', paymentMethod: 'card', transactionId: 'TXN12345',
    items: [{ id: 'invi1', description: 'Consultation Fee - Dr. Emily White', amount: 150.00, type: 'consultation' }]
  }
];

const defaultLabRequests: LabRequest[] = [
  { id: 'req1', patientId: 'p1', doctorId: 'doc1', appointmentId: 'apt1', date: '2026-03-12', testName: 'Complete Blood Count (CBC)', status: 'completed' }
];

const defaultLabReports: LabReport[] = [
  { id: 'lab1', labRequestId: 'req1', patientId: 'p1', doctorId: 'doc1', technicianId: 'lab1', date: '2026-03-12', testName: 'Complete Blood Count (CBC)', resultData: 'All parameters within normal range. Hemoglobin: 14.2 g/dL', status: 'completed' }
];

const defaultMessages: Message[] = [
  { id: 'msg1', senderId: 'doc1', receiverId: 'p1', content: 'Hello John, your recent blood test results look good. No need to worry.', timestamp: '2026-03-13T10:30:00Z', read: false },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>(defaultSchedules);
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(defaultMedicalRecords);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(defaultPrescriptions);
  const [invoices, setInvoices] = useState<Invoice[]>(defaultInvoices);
  const [labRequests, setLabRequests] = useState<LabRequest[]>(defaultLabRequests);
  const [labReports, setLabReports] = useState<LabReport[]>(defaultLabReports);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);

  const login = (email: string, role: Role) => {
    const user = users.find(u => u.email === email && u.role === role);
    if (user) {
      setCurrentUser(user);
    } else {
      const mockUser = users.find(u => u.role === role);
      if (mockUser) setCurrentUser(mockUser);
    }
  };

  const logout = () => setCurrentUser(null);

  const registerPatient = (data: Partial<User>) => {
    const newUser: User = {
      id: `p${Date.now()}`,
      name: data.name || 'New Patient',
      email: data.email || '',
      role: 'patient',
      phone: data.phone,
      mrn: `MRN-${new Date().getFullYear()}-${String(users.filter(u => u.role === 'patient').length + 1).padStart(4, '0')}`,
      ...data
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const bookAppointment = (data: Omit<Appointment, 'id' | 'status'>) => {
    const newApt: Appointment = { ...data, id: `apt${Date.now()}`, status: 'pending' };
    setAppointments([...appointments, newApt]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const addMedicalRecord = (data: Omit<MedicalRecord, 'id' | 'date'>) => {
    const newRecord: MedicalRecord = { ...data, id: `emr${Date.now()}`, date: new Date().toISOString().split('T')[0] };
    setMedicalRecords([...medicalRecords, newRecord]);
  };

  const addPrescription = (data: Omit<Prescription, 'id' | 'date' | 'status'>) => {
    const newRx: Prescription = { ...data, id: `rx${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'pending' };
    setPrescriptions([...prescriptions, newRx]);
  };

  const dispensePrescription = (id: string, pharmacistId: string) => {
    setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: 'dispensed', dispensedBy: pharmacistId, dispensedAt: new Date().toISOString() } : p));
  };

  const addDoctor = (data: Partial<User>) => {
    const newDoc: User = {
      id: `doc${Date.now()}`, name: data.name || 'New Doctor', email: data.email || '', role: 'doctor',
      departmentId: data.departmentId, specialty: data.specialty, avatar: `https://picsum.photos/seed/${Date.now()}/200/200`,
    };
    setUsers([...users, newDoc]);
  };

  const addDepartment = (data: Omit<Department, 'id'>) => {
    const newDept: Department = { ...data, id: `d${Date.now()}` };
    setDepartments([...departments, newDept]);
  };

  const generateInvoice = (data: Omit<Invoice, 'id' | 'status'>) => {
    const newInvoice: Invoice = { ...data, id: `inv${Date.now()}`, status: 'unpaid' };
    setInvoices([...invoices, newInvoice]);
  };

  const payInvoice = (id: string, method: Invoice['paymentMethod'], transactionId?: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid', paymentMethod: method, transactionId } : i));
  };

  const sendMessage = (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMsg: Message = { ...data, id: `msg${Date.now()}`, timestamp: new Date().toISOString(), read: false };
    setMessages([...messages, newMsg]);
  };

  const markMessageRead = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const requestLabTest = (data: Omit<LabRequest, 'id' | 'date' | 'status'>) => {
    const newReq: LabRequest = { ...data, id: `req${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'pending' };
    setLabRequests([...labRequests, newReq]);
  };

  const addLabReport = (data: Omit<LabReport, 'id' | 'date'>) => {
    const newReport: LabReport = { ...data, id: `lab${Date.now()}`, date: new Date().toISOString().split('T')[0] };
    setLabReports([...labReports, newReport]);
    // Update request status
    setLabRequests(labRequests.map(r => r.id === data.labRequestId ? { ...r, status: 'completed' } : r));
  };

  const updateLabReportStatus = (id: string, status: LabReport['status'], resultData?: string) => {
    setLabReports(labReports.map(l => l.id === id ? { ...l, status, ...(resultData ? { resultData } : {}) } : l));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, doctorSchedules, appointments, medicalRecords, prescriptions, invoices, labRequests, labReports, messages,
      login, logout, registerPatient, bookAppointment, updateAppointmentStatus, addMedicalRecord,
      addPrescription, dispensePrescription, addDoctor, addDepartment, generateInvoice, payInvoice,
      sendMessage, markMessageRead, requestLabTest, addLabReport, updateLabReportStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
