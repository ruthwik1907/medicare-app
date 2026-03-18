import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, secondaryAuth } from '../firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, 
  query, where, getDoc, addDoc, getDocs 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { sendAppointmentConfirmationEmail } from '../services/emailService';

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
  isAuthReady: boolean;
  login: (email: string, password?: string, role?: Role) => Promise<User>;
  logout: () => Promise<void>;
  registerPatient: (data: Partial<User> & { password?: string }) => Promise<User>;
  bookAppointment: (data: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addMedicalRecord: (data: Omit<MedicalRecord, 'id' | 'date'>) => Promise<void>;
  addPrescription: (data: Omit<Prescription, 'id' | 'date' | 'status'>) => Promise<void>;
  dispensePrescription: (id: string, pharmacistId: string) => Promise<void>;
  addDoctor: (data: Partial<User>) => Promise<void>;
  addDepartment: (data: Omit<Department, 'id'>) => Promise<void>;
  generateInvoice: (data: Omit<Invoice, 'id' | 'status'>) => Promise<void>;
  payInvoice: (id: string, method: Invoice['paymentMethod'], transactionId?: string) => Promise<void>;
  sendMessage: (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  requestLabTest: (data: Omit<LabRequest, 'id' | 'date' | 'status'>) => Promise<void>;
  addLabReport: (data: Omit<LabReport, 'id' | 'date'>) => Promise<void>;
  updateLabReportStatus: (id: string, status: LabReport['status'], resultData?: string) => Promise<void>;
  createAdminUser: (data: Partial<User> & { password?: string }) => Promise<void>;
  updateAdminUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    });

    return () => {
      unsubUsers(); unsubDepts();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const unsubSchedules = onSnapshot(collection(db, 'doctorSchedules'), (snapshot) => {
      setDoctorSchedules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorSchedule)));
    });
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });
    const unsubRecords = onSnapshot(collection(db, 'medicalRecords'), (snapshot) => {
      setMedicalRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
    });
    const unsubPrescriptions = onSnapshot(collection(db, 'prescriptions'), (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
    });
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    });
    const unsubLabReqs = onSnapshot(collection(db, 'labRequests'), (snapshot) => {
      setLabRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabRequest)));
    });
    const unsubLabReps = onSnapshot(collection(db, 'labReports'), (snapshot) => {
      setLabReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabReport)));
    });
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => {
      unsubSchedules(); unsubAppts();
      unsubRecords(); unsubPrescriptions(); unsubInvoices();
      unsubLabReqs(); unsubLabReps(); unsubMessages();
    };
  }, [isAuthReady, currentUser]);

  const login = async (email: string, password?: string, role?: Role) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password || '123456');
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const isAdminEmail = email === 'admin@hospital.com';
        const newUser: User = {
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || email,
          role: isAdminEmail ? 'admin' : (role || 'patient'),
          avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        };
        if (newUser.role === 'patient') {
          newUser.mrn = `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        }
        await setDoc(doc(db, 'users', user.uid), newUser);
        setCurrentUser(newUser);
        return newUser;
      } else {
        const existingUser = { id: userDoc.id, ...userDoc.data() } as User;
        setCurrentUser(existingUser);
        return existingUser;
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials or ensure you have enabled Email/Password authentication in Firebase.");
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const registerPatient = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const isAdminEmail = data.email === 'admin@hospital.com';
      
      const newUser: User = {
        id: user.uid,
        name: data.name || user.displayName || (isAdminEmail ? 'Admin' : 'New Patient'),
        email: data.email || user.email || '',
        phone: data.phone,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        ...data,
        role: isAdminEmail ? 'admin' : 'patient', // Ensure role is not overwritten by ...data
      };
      
      if (!isAdminEmail) {
        newUser.mrn = `MRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }
      
      // Remove password from the data saved to Firestore
      delete (newUser as any).password;
      
      await setDoc(doc(db, 'users', user.uid), newUser);
      setCurrentUser(newUser);
      return newUser;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const bookAppointment = async (data: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const newApt = { ...data, status: 'pending' };
      await addDoc(collection(db, 'appointments'), newApt);
      
      // Try to send email notification
      const doctor = users.find(u => u.id === data.doctorId);
      const department = departments.find(d => d.id === data.departmentId);
      const patient = users.find(u => u.id === data.patientId);
      
      if (doctor && department && patient) {
        try {
          await sendAppointmentConfirmationEmail({
            patient_name: patient.name,
            patient_email: patient.email,
            doctor_name: doctor.name,
            department: department.name,
            date: data.date,
            time: data.time
          });
        } catch (emailError) {
          console.error("Could not send email, but appointment was booked:", emailError);
          // We don't throw here because the appointment was successfully booked
        }
      }
      
      toast.success('Appointment booked successfully!');
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error('Failed to book appointment. Please try again.');
      throw error;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await updateDoc(doc(db, 'appointments', id), { status });
  };

  const addMedicalRecord = async (data: Omit<MedicalRecord, 'id' | 'date'>) => {
    const newRecord = { ...data, date: new Date().toISOString().split('T')[0] };
    await addDoc(collection(db, 'medicalRecords'), newRecord);
  };

  const addPrescription = async (data: Omit<Prescription, 'id' | 'date' | 'status'>) => {
    const newRx = { ...data, date: new Date().toISOString().split('T')[0], status: 'pending' };
    await addDoc(collection(db, 'prescriptions'), newRx);
  };

  const dispensePrescription = async (id: string, pharmacistId: string) => {
    await updateDoc(doc(db, 'prescriptions', id), { 
      status: 'dispensed', 
      dispensedBy: pharmacistId, 
      dispensedAt: new Date().toISOString() 
    });
  };

  const addDoctor = async (data: Partial<User>) => {
    const newDoc = {
      name: data.name || 'New Doctor', 
      email: data.email || '', 
      role: 'doctor',
      departmentId: data.departmentId, 
      specialty: data.specialty, 
      avatar: `https://picsum.photos/seed/${Date.now()}/200/200`,
    };
    await addDoc(collection(db, 'users'), newDoc);
  };

  const addDepartment = async (data: Omit<Department, 'id'>) => {
    await addDoc(collection(db, 'departments'), data);
  };

  const generateInvoice = async (data: Omit<Invoice, 'id' | 'status'>) => {
    const newInvoice = { ...data, status: 'unpaid' };
    await addDoc(collection(db, 'invoices'), newInvoice);
  };

  const payInvoice = async (id: string, method: Invoice['paymentMethod'], transactionId?: string) => {
    await updateDoc(doc(db, 'invoices', id), { 
      status: 'paid', 
      paymentMethod: method, 
      transactionId 
    });
  };

  const sendMessage = async (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMsg = { ...data, timestamp: new Date().toISOString(), read: false };
    await addDoc(collection(db, 'messages'), newMsg);
  };

  const markMessageRead = async (id: string) => {
    await updateDoc(doc(db, 'messages', id), { read: true });
  };

  const requestLabTest = async (data: Omit<LabRequest, 'id' | 'date' | 'status'>) => {
    const newReq = { ...data, date: new Date().toISOString().split('T')[0], status: 'pending' };
    await addDoc(collection(db, 'labRequests'), newReq);
  };

  const addLabReport = async (data: Omit<LabReport, 'id' | 'date'>) => {
    const newReport = { ...data, date: new Date().toISOString().split('T')[0] };
    await addDoc(collection(db, 'labReports'), newReport);
    await updateDoc(doc(db, 'labRequests', data.labRequestId), { status: 'completed' });
  };

  const updateLabReportStatus = async (id: string, status: LabReport['status'], resultData?: string) => {
    const updateData: any = { status };
    if (resultData) updateData.resultData = resultData;
    await updateDoc(doc(db, 'labReports', id), updateData);
  };

  const createAdminUser = async (data: Partial<User> & { password?: string }) => {
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email || '', data.password || '123456');
      const user = result.user;
      
      const newUser: User = {
        id: user.uid,
        name: data.name || user.displayName || 'New Admin',
        email: data.email || user.email || '',
        role: 'admin',
        phone: data.phone,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        ...data
      };
      // Remove password from the data saved to Firestore
      delete (newUser as any).password;
      
      await setDoc(doc(db, 'users', user.uid), newUser);
      // Sign out the secondary auth so it doesn't interfere
      await signOut(secondaryAuth);
    } catch (error) {
      console.error("Admin registration failed:", error);
      alert("Admin registration failed. Please ensure you have enabled Email/Password authentication in Firebase.");
      throw error;
    }
  };

  const updateAdminUser = async (id: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', id), data);
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, doctorSchedules, appointments, medicalRecords, prescriptions, invoices, labRequests, labReports, messages,
      login, logout, registerPatient, bookAppointment, updateAppointmentStatus, addMedicalRecord,
      addPrescription, dispensePrescription, addDoctor, addDepartment, generateInvoice, payInvoice,
      sendMessage, markMessageRead, requestLabTest, addLabReport, updateLabReportStatus,
      createAdminUser, updateAdminUser, deleteUser
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
