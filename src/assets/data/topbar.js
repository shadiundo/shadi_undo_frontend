import { addOrSubtractDaysFromDate } from '@/utils/date';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar5 from '@/assets/images/users/avatar-5.jpg';
import avatar6 from '@/assets/images/users/avatar-6.jpg';
import avatar7 from '@/assets/images/users/avatar-7.jpg';

export const appsData = [
  {
   image:avatar1,
    name: "Lawyer",
    description: "Legal experts handling contracts, corporate, and family law cases.",
    link: "/apps/lawyers",
  },
  {
    image:avatar2,
    name: "Mediator",
    description: "Neutral mediators helping resolve disputes without litigation.",
    link: "/apps/mediators",
  },
  {
  image:avatar5,
    name: "Counsellor",
    description: "Trained counsellors offering emotional guidance and mental support.",
    link: "/apps/counsellors",
  },
  {
   image:avatar4,
    name: "Therapist",
    description: "Certified therapists providing therapy for mental and physical well-being.",
    link: "/apps/therapists",
  },
];
export const notificationsData = [
  {
    from: "Aarav Sharma",
    content: 'Uploaded new certificate "Certificate in Corporate Law". Please review and approve.',
    icon: avatar1
  },
  {
    from: "Neha Patel",
    content: "Requested scheduling for a commercial mediation session on 12 Oct 2025.",
    icon: avatar2
  },
  {
    from: "Site Admin",
    content: "Approved the profile of Aarav Sharma. Profile is now visible to public.",
    icon: avatar3
  },
  {
    from: "Meera Iyer",
    content: "Left a review for mediator Rohit Mehta: “Very professional and empathetic.”",
    icon: avatar4
  },
  {
    from: "Arjun Rao",
    content: "Uploaded training certificate for Family Mediation (2017). Awaiting verification.",
    icon: avatar5
  },
  {
    from: "Priya Singh",
    content: "Booked a counselling session with Meera Iyer for 10 Oct 2025 at 11:00 AM.",
    icon: avatar6
  },
  {
    from: "Rahul Verma",
    content: "Marked experience 'Litigation Attorney' as updated on profile.",
    icon: avatar7
  }
];
export const activityStreamData = [{
  title: 'School and College Details',
  variant: 'danger',
  files: [{
    name: 'Degree.pdf'
  }, {
    name: 'Certificates.pdf'
  }],
  time: addOrSubtractDaysFromDate(0)
}, {
  title: 'Work Experience',
  files: [{
    name: 'ALT-ex-letter.pdf'
  }],
  variant: 'success',
  status: 'completed',
  time: addOrSubtractDaysFromDate(1)
},];