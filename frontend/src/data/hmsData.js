export const hospitalStats = [
  { id: '1', label: 'Patients Cared For', value: '50,000+', change: '+12% this year', icon: 'Users' },
  { id: '2', label: 'Specialist Doctors', value: '250+', change: '35 Departments', icon: 'Award' },
  { id: '3', label: 'Emergency Beds', value: '180+', change: '24/7 ICU & Ward', icon: 'Bed' },
  { id: '4', label: 'Care Satisfaction Rate', value: '99.4%', change: 'Top Regional Rating', icon: 'HeartPulse' }
];

export const departments = [
  {
    id: 'cardiology',
    name: 'Cardiology & Heart Care',
    icon: 'Heart',
    description: 'Advanced interventional cardiology, cardiac surgery, and 24/7 chest pain emergency unit.',
    specialists: 18,
    wait: '< 10 mins',
    accentColor: 'bg-rose-50 text-rose-600 border-rose-200',
    popular: true
  },
  {
    id: 'neurology',
    name: 'Neurology & Brain Sciences',
    icon: 'Brain',
    description: 'Comprehensive neurological evaluation, stroke unit, neurosurgery, and 3T MRI diagnostics.',
    specialists: 14,
    wait: '< 15 mins',
    accentColor: 'bg-blue-50 text-blue-600 border-blue-200',
    popular: true
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Child Health',
    icon: 'Baby',
    description: 'Child-friendly clinical environment for routine checkups, pediatric surgery, and NICU care.',
    specialists: 22,
    wait: 'Immediate',
    accentColor: 'bg-amber-50 text-amber-600 border-amber-200',
    popular: false
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Joint Care',
    icon: 'Bone',
    description: 'Robotic joint replacements, sports injury rehabilitation, and emergency trauma surgery.',
    specialists: 16,
    wait: '< 20 mins',
    accentColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    popular: true
  },
  {
    id: 'radiology',
    name: 'Radiology & Advanced Imaging',
    icon: 'Activity',
    description: 'High-speed 3T MRI, 128-slice CT scans, ultrasound, and digital X-ray diagnostics.',
    specialists: 12,
    wait: '< 5 mins',
    accentColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    popular: false
  },
  {
    id: 'emergency',
    name: '24/7 Trauma & Emergency',
    icon: 'Siren',
    description: 'Immediate level-1 trauma care, cardiac emergency response, and rapid triage team.',
    specialists: 30,
    wait: '0 mins',
    accentColor: 'bg-red-50 text-red-600 border-red-200',
    popular: true
  }
];

export const topDoctors = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins, MD',
    specialty: 'Chief of Cardiology',
    department: 'Cardiology & Heart Care',
    experience: '16+ Years Experience',
    rating: 4.9,
    reviewsCount: 320,
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    education: 'Harvard Medical School',
    languages: ['English', 'Spanish']
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen, MD',
    specialty: 'Senior Neurosurgeon',
    department: 'Neurology & Brain Sciences',
    experience: '14+ Years Experience',
    rating: 4.95,
    reviewsCount: 284,
    availability: 'Available Tomorrow',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    education: 'Johns Hopkins University',
    languages: ['English', 'Mandarin']
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Rodriguez, MD',
    specialty: 'Pediatric Specialist',
    department: 'Pediatrics & Child Health',
    experience: '11+ Years Experience',
    rating: 4.88,
    reviewsCount: 410,
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1594824813566-78a1ed6493f8?auto=format&fit=crop&q=80&w=600',
    education: 'Stanford University',
    languages: ['English', 'Spanish']
  },
  {
    id: 'doc-4',
    name: 'Dr. Marcus Vance, MS',
    specialty: 'Orthopedic & Joint Surgeon',
    department: 'Orthopedics & Joint Care',
    experience: '18+ Years Experience',
    rating: 4.92,
    reviewsCount: 195,
    availability: 'Slots Open Today',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    education: 'Oxford Medical Institute',
    languages: ['English', 'German']
  }
];

export const testimonials = [
  {
    id: 'test-1',
    name: 'Eleanor Vance',
    role: 'Cardiac Surgery Patient',
    content: 'The care team at CarePlus HMS saved my life. From online appointment booking to my post-op recovery, every detail was handled with precision and deep compassion.',
    rating: 5,
    date: '2 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-2',
    name: 'David Thorne',
    role: 'Outpatient & EHR User',
    content: 'Being able to see my blood work, digital prescriptions, and doctor notes on my phone immediately after my consultation is a game changer!',
    rating: 5,
    date: '1 month ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-3',
    name: 'Sophia Martinez',
    role: 'Pediatric Care Parent',
    content: 'Dr. Emily was incredible with my 5-year-old son. The reception staff checked us in within 2 minutes. Extremely clean facility and polite staff.',
    rating: 5,
    date: '3 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  }
];

export const emergencyHotline = '+1 (800) 555-9000';
