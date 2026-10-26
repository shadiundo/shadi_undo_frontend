import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import avatar5 from '@/assets/images/users/avatar-5.jpg';
import avatar6 from '@/assets/images/users/avatar-6.jpg';
import avatar7 from '@/assets/images/users/avatar-7.jpg';
export const timelineData = {
  Today: [{
    title: 'Completed UX design project for our client',
    description: 'Dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde?',
    important: true
  }, {
    title: 'Yes! We are celebrating our first admin release.',
    description: 'Consectetur adipisicing elit. Iusto, optio, dolorumJohn deonprovident.'
  }, {
    title: 'We released new version of our theme Reback.',
    description: '3 new photo Uploaded on facebook fan page'
  }],
  Yesterday: [{
    title: 'We have archieved 25k sales in our themes',
    description: 'Dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde?'
  }, {
    title: 'Yes! We are celebrating our first admin release.',
    description: 'Outdoor visit at California State Route 85 with John Boltana & Harry Piterson.'
  }],
  '5 days ago': [{
    title: 'Join new team member Alex Smith',
    description: 'Alex Smith is a Senior Software (Full Stack) engineer with a deep passion for building usable, functional & pretty web applications.'
  }, {
    title: 'First release of Reback admin dashboard template',
    description: 'Outdoor visit at California State Route 85 with John Boltana & Harry Piterson regarding to setup a new show room.'
  }]
};
export const pricingData = [
  {
    id: '1',
    name: 'Silver Plan',
    price: 1999,
    features: [
      'Profile listed in directory',
      'Up to 5 client leads/month',
      'Verified ID & Certificate Upload',
      'Email and WhatsApp notifications',
      'Normal dashboard visibility',
      'Standard support'
    ]
  },
  {
    id: '2',
    name: 'Gold Plan',
    price: 2999,
    isPopular: true,
    features: [
      'Highlighted profile in directory',
      'Up to 20 client leads/month',
      'Verified badge on profile',
      'Profile insights & client analytics',
      'Higher visibility on dashboard',
      'Priority email & chat support',
       ' uploads photos and certificates', 
    ],
    subscribed: true
  },
  {
    id: '3',
    name: 'Platinum Plan',
    price: 3999,
    features: [
      'Top placement on dashboard and search results',
      'Unlimited client leads',
      'Verified & Featured Professional badge',
      'Custom media uploads (photos, certificates, intro video)',
      'Access to premium client requests',
      'Dedicated relationship manager support'
    ]
  }


// {
//   id: '4',
//   name: 'EnterPrice Pack',
//   price: 29,
//   features: ['2 TB Storage', 'Unlimited Bandwidth', '50 Domain', 'Email Support', '24x7 Support', 'Unlimited User']
// }
];
export const projectsData = [{
  id: '1',
  projectName: 'Zelogy',
  client: 'Daniel Olsen',
  teamMembers: [avatar2, avatar3, avatar4],
  deadlineDate: new Date('12/4/2024'),
  progressValue: 33,
  variant: 'primary'
}, {
  id: '2',
  projectName: 'Shiaz',
  client: 'Jack Roldan',
  teamMembers: [avatar1, avatar5],
  deadlineDate: new Date('10/4/2024'),
  progressValue: 74,
  variant: 'success'
}, {
  id: '3',
  projectName: 'Holderick',
  client: 'Betty Cox',
  teamMembers: [avatar5, avatar2, avatar3],
  deadlineDate: new Date('31/3/2024'),
  progressValue: 50,
  variant: 'warning'
}, {
  id: '4',
  projectName: 'Feyvux',
  client: 'Carlos Johnson',
  teamMembers: [avatar3, avatar7, avatar6],
  deadlineDate: new Date('25/3/2024'),
  progressValue: 92,
  variant: 'primary'
}, {
  id: '5',
  projectName: 'Xavlox',
  client: 'Lorraine Cox',
  teamMembers: [avatar7],
  deadlineDate: new Date('22/3/2024'),
  progressValue: 48,
  variant: 'danger'
}, {
  id: '6',
  projectName: 'Mozacav',
  client: 'Delores Young',
  teamMembers: [avatar3, avatar4, avatar2],
  deadlineDate: new Date('15/3/2024'),
  progressValue: 21,
  variant: 'primary'
}];
export const transactionsData = [
  {
    id: '10101',
    customerId: '2001',
    date: new Date('04/24/2025'),
    amount: 4999,
    description: 'Therapist Consultation',
    status: 'Cr.',
  },
  {
    id: '10102',
    customerId: '2002',
    date: new Date('12/6/2025'),
    amount: 5999,
    description: 'Dowry Case',
    status: 'Cr.',
  },
  {
    id: '10103',
    customerId: '2003',
    date: new Date('04/20/2025'),
    amount: 6999,
    description: 'Divorce Case',
    status: 'Dr.',
  },
  {
    id: '10104',
    customerId: '2004',
    date: new Date('04/18/2025'),
    amount: 4999,
    description: 'Imago relationship therapy',
    status: 'Cr.',
  },
  {
    id: '10105',
    customerId: '2005',
    date: new Date('04/18/2025'),
    amount: 2999,
    description: 'Discernment counseling',
    status: 'Dr.',
  },
  {
    id: '10106',
    customerId: '2006',
    date: new Date('04/17/2024'),
    amount: 455.62,
    description: 'Reconciliation mediation',
    status: 'Dr.',
  },
  {
    id: '10107',
    customerId: '2007',
    date: new Date('04/17/2024'),
    amount: 102.77,
    description: 'Interest',
    status: 'Cr.',
  },
  {
    id: '10108',
    customerId: '2008',
    date: new Date('04/16/2024'),
    amount: 79.49,
    description: 'Refunds',
    status: 'Cr.',
  },
  {
    id: '10109',
    customerId: '2009',
    date: new Date('04/05/2024'),
    amount: 980.0,
    description: 'Shopping',
    status: 'Dr.',
  },
]
export const dataTableRecords = [{
  id: '11',
  name: 'Jonathan',
  email: 'jonathan@example.com',
  position: 'Senior Implementation Architect',
  company: 'Hauck Inc',
  country: 'Holy See'
}, {
  id: '12',
  name: 'Harold',
  email: 'harold@example.com',
  position: 'Forward Creative Coordinator',
  company: 'Metz Inc',
  country: 'Iran'
}, {
  id: '13',
  name: 'Shannon',
  email: 'shannon@example.com',
  position: 'Legacy Functionality Associate',
  company: 'Zemlak Group',
  country: 'South Georgia'
}, {
  id: '14',
  name: 'Robert',
  email: 'robert@example.com',
  position: 'Product Accounts Technician',
  company: 'Hoeger',
  country: 'San Marino'
}, {
  id: '15',
  name: 'Noel',
  email: 'noel@example.com',
  position: 'Customer Data Director',
  company: 'Howell - Rippin',
  country: 'Germany'
}, {
  id: '16',
  name: 'Traci',
  email: 'traci@example.com',
  position: 'Corporate Identity Director',
  company: 'Koelpin - Goldner',
  country: 'Vanuatu'
}, {
  id: '17',
  name: 'Kerry',
  email: 'kerry@example.com',
  position: 'Lead Applications Associate',
  company: 'Feeney, Langworth and Tremblay',
  country: 'Niger'
}, {
  id: '18',
  name: 'Patsy',
  email: 'patsy@example.com',
  position: 'Dynamic Assurance Director',
  company: 'Streich Group',
  country: 'Niue'
}, {
  id: '19',
  name: 'Cathy',
  email: 'cathy@example.com',
  position: 'Customer Data Director',
  company: 'Ebert, Schamberger and Johnston',
  country: 'Mexico'
}, {
  id: '20',
  name: 'Tyrone',
  email: 'tyrone@example.com',
  position: 'Senior Response Liaison',
  company: 'Raynor, Rolfson and Daugherty',
  country: 'Qatar'
}];